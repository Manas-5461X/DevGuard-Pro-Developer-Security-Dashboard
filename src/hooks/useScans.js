import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp, orderBy, updateDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';

// GLOBAL CACHE: Lives outside the hook instance so it persists across page navigations
let cachedScans = null;
let lastFetchTime = 0;
const CACHE_STALE_TIME = 1000 * 60 * 5; // 5 minutes

export function useScans() {
  const [scans, setScans] = useState(cachedScans || []);
  const [loading, setLoading] = useState(!cachedScans);
  const { currentUser } = useAuth();

  const fetchScans = useCallback(async (silent = false) => {
    if (!currentUser) return;
    
    // If not silent and we have no cache OR cache is stale, show loading
    const isStale = Date.now() - lastFetchTime > CACHE_STALE_TIME;
    if (!silent && (!cachedScans || isStale)) {
        setLoading(true);
    }
    
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
      
      // Update local state and global cache
      setScans(scansData);
      cachedScans = scansData;
      lastFetchTime = Date.now();
    } catch (err) {
      console.error('Error fetching scans:', err);
      // Fallback for missing indexes
      if (err.message.includes('index')) {
        const qFallback = query(collection(db, 'scans'), where('userId', '==', currentUser.uid));
        const snap = await getDocs(qFallback);
        const scansData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        scansData.sort((a,b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setScans(scansData);
        cachedScans = scansData;
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    // Only fetch if we have no cache or it's stale
    const isStale = Date.now() - lastFetchTime > CACHE_STALE_TIME;
    if (!cachedScans || isStale) {
      fetchScans();
    } else {
      setLoading(false);
    }
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
      
      // Update cache immediately
      const updated = [newScan, ...(cachedScans || [])];
      setScans(updated);
      cachedScans = updated;
      
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
      
      // Update cache
      const updated = (cachedScans || []).map(s => 
        s.id === scanId ? { ...s, isBookmarked: !currentStatus } : s
      );
      setScans(updated);
      cachedScans = updated;
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      throw err;
    }
  };

  const removeScan = async (scanId) => {
    try {
      await deleteDoc(doc(db, 'scans', scanId));
      const updated = (cachedScans || []).filter(scan => scan.id !== scanId);
      setScans(updated);
      cachedScans = updated;
    } catch (err) {
      console.error('Error deleting scan:', err);
      throw err;
    }
  };

  const getStats = () => {
    const activeScans = scans || [];
    const totalScans = activeScans.length;
    const totalIssues = activeScans.reduce((acc, scan) => acc + (scan.issueCount || 0), 0);
    const criticalIssues = activeScans.reduce((acc, scan) => {
      const crits = scan.vulnerabilities?.filter(v => v.severity === 'critical').length || 0;
      return acc + crits;
    }, 0);
    
    return { totalScans, totalIssues, criticalIssues };
  };

  return { scans, loading, saveScan, toggleBookmark, removeScan, getStats, refetch: fetchScans };
}
