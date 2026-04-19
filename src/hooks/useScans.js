import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp, orderBy, updateDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';

export function useScans() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const fetchScans = useCallback(async (silent = false) => {
    if (!currentUser) return;
    if (!silent) setLoading(true);
    try {
      const q = query(
        collection(db, 'scans'), 
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const scansData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setScans(scansData);
    } catch (err) {
      console.error('Error fetching scans:', err);
      if (err.message.includes('index')) {
        try {
          const qFallback = query(collection(db, 'scans'), where('userId', '==', currentUser.uid));
          const snap = await getDocs(qFallback);
          const scansData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          scansData.sort((a,b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
          setScans(scansData);
        } catch(fallbackErr) {
          console.error(fallbackErr);
        }
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  const saveScan = async (code, vulnerabilities) => {
    if (!currentUser) return null;
    try {
      const lines = code.split('\n').filter(l => l.trim().length > 0);
      const title = lines.length > 0 ? guidelinesCleanTitle(lines[0]) : 'Empty Snippet';
      
      function guidelinesCleanTitle(firstLine) {
         let cleaned = firstLine.replace(/^['"\/\/#\-\s]+/, '').substring(0, 40).trim();
         return cleaned || 'Unnamed Snippet';
      }

      const payload = {
        userId: currentUser.uid,
        title: title,
        code: code,
        vulnerabilities: vulnerabilities,
        issueCount: vulnerabilities.length,
        isBookmarked: false,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'scans'), payload);
      
      const newScan = {
        id: docRef.id,
        ...payload,
        createdAt: { toMillis: () => Date.now() } 
      };
      setScans(prev => [newScan, ...prev]);
      fetchScans(true);
      return docRef.id;
    } catch (err) {
      console.error('Error saving scan:', err);
      throw err;
    }
  };

  const toggleBookmark = async (scanId, currentStatus) => {
    try {
      const scanRef = doc(db, 'scans', scanId);
      await updateDoc(scanRef, {
        isBookmarked: !currentStatus
      });
      // Optimistic update
      setScans(prev => prev.map(s => s.id === scanId ? { ...s, isBookmarked: !currentStatus } : s));
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      throw err;
    }
  };

  const removeScan = async (scanId) => {
    try {
      await deleteDoc(doc(db, 'scans', scanId));
      setScans(prev => prev.filter(scan => scan.id !== scanId));
    } catch (err) {
      console.error('Error deleting scan:', err);
      throw err;
    }
  };

  const getStats = () => {
    const totalScans = scans.length;
    const totalIssues = scans.reduce((acc, scan) => acc + (scan.issueCount || 0), 0);
    const criticalIssues = scans.reduce((acc, scan) => {
      const crits = scan.vulnerabilities?.filter(v => v.severity === 'critical').length || 0;
      return acc + crits;
    }, 0);
    
    return { totalScans, totalIssues, criticalIssues };
  };

  return { scans, loading, saveScan, toggleBookmark, removeScan, getStats, refetch: fetchScans };
}
