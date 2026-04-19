import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp, orderBy, updateDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';

// GLOBAL CACHE: Scoped per-user by uid to prevent data leakage between accounts
const userScanCache = new Map(); // Map<uid, { scans, fetchTime }>
const CACHE_STALE_TIME = 1000 * 60 * 5; // 5 minutes

export function useScans() {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;

  // Get this user's cache entry if it exists
  const userCache = uid ? userScanCache.get(uid) : null;
  const hasFreshCache = userCache && (Date.now() - userCache.fetchTime < CACHE_STALE_TIME);

  const [scans, setScans] = useState(hasFreshCache ? userCache.scans : []);
  const [loading, setLoading] = useState(!hasFreshCache);

  const fetchScans = useCallback(async (silent = false) => {
    if (!uid) return;

    const cached = userScanCache.get(uid);
    const isStale = !cached || (Date.now() - cached.fetchTime > CACHE_STALE_TIME);

    if (!silent && isStale) setLoading(true);
    if (!isStale && cached) {
      setScans(cached.scans);
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'scans'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const scansData = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      userScanCache.set(uid, { scans: scansData, fetchTime: Date.now() });
      setScans(scansData);
    } catch (err) {
      console.error('Error fetching scans:', err);
      if (err.message?.includes('index') || err.code === 'failed-precondition') {
        try {
          const qFallback = query(collection(db, 'scans'), where('userId', '==', uid));
          const snap = await getDocs(qFallback);
          const scansData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          scansData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
          userScanCache.set(uid, { scans: scansData, fetchTime: Date.now() });
          setScans(scansData);
        } catch (fallbackErr) {
          console.error('Fallback fetch also failed:', fallbackErr);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    // When user changes, reset state and fetch fresh data for the new user
    if (!uid) {
      setScans([]);
      setLoading(false);
      return;
    }
    const cached = userScanCache.get(uid);
    const isStale = !cached || (Date.now() - cached.fetchTime > CACHE_STALE_TIME);
    if (isStale) {
      setScans([]);
      fetchScans();
    } else {
      setScans(cached.scans);
      setLoading(false);
    }
  }, [uid, fetchScans]);

  const saveScan = async (code, vulnerabilities) => {
    if (!uid) return null;
    try {
      const lines = code.split('\n').filter(l => l.trim().length > 0);
      const firstLine = lines[0] || '';
      let title = firstLine.replace(/^['"\/\/#\-\s]+/, '').substring(0, 50).trim() || 'Unnamed Snippet';

      const payload = {
        userId: uid,
        title,
        code,
        vulnerabilities,
        issueCount: vulnerabilities.length,
        isBookmarked: false,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'scans'), payload);

      const newScan = { id: docRef.id, ...payload, createdAt: { toMillis: () => Date.now() } };

      const current = userScanCache.get(uid)?.scans || [];
      const updated = [newScan, ...current];
      userScanCache.set(uid, { scans: updated, fetchTime: Date.now() });
      setScans(updated);

      return docRef.id;
    } catch (err) {
      console.error('Error saving scan:', err);
      throw err;
    }
  };

  const toggleBookmark = async (scanId, currentStatus) => {
    if (!uid) return;
    try {
      // Optimistic update first
      const current = userScanCache.get(uid)?.scans || [];
      const updated = current.map(s => s.id === scanId ? { ...s, isBookmarked: !currentStatus } : s);
      userScanCache.set(uid, { scans: updated, fetchTime: userScanCache.get(uid)?.fetchTime || Date.now() });
      setScans(updated);

      await updateDoc(doc(db, 'scans', scanId), { isBookmarked: !currentStatus });
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      // Revert optimistic update on failure
      fetchScans(true);
      throw err;
    }
  };

  const removeScan = async (scanId) => {
    if (!uid) return;
    try {
      await deleteDoc(doc(db, 'scans', scanId));
      const current = userScanCache.get(uid)?.scans || [];
      const updated = current.filter(s => s.id !== scanId);
      userScanCache.set(uid, { scans: updated, fetchTime: userScanCache.get(uid)?.fetchTime || Date.now() });
      setScans(updated);
    } catch (err) {
      console.error('Error deleting scan:', err);
      throw err;
    }
  };

  const getStats = useCallback(() => {
    const totalScans = scans.length;
    const totalIssues = scans.reduce((acc, scan) => acc + (scan.issueCount || 0), 0);
    const criticalIssues = scans.reduce((acc, scan) => {
      return acc + (scan.vulnerabilities?.filter(v => v.severity === 'critical').length || 0);
    }, 0);
    return { totalScans, totalIssues, criticalIssues };
  }, [scans]);

  return { scans, loading, saveScan, toggleBookmark, removeScan, getStats, refetch: fetchScans };
}
