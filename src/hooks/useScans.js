import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';

// GLOBAL CACHE: Scoped per-user by uid to prevent data leakage between accounts
const CACHE_STALE_TIME = 1000 * 60 * 5; // 5 min before a background refresh

// HELPERS: LocalStorage Persistence for the Global Cache
const getPersistedCache = () => {
  try {
    const saved = localStorage.getItem('devguard_scan_cache_v3');
    if (!saved) return new Map();
    // Rehydrate the Map from serialized array entries
    return new Map(JSON.parse(saved));
  } catch (e) { 
    console.error('Failed to load scan cache:', e);
    return new Map(); 
  }
};

const savePersistedCache = (cache) => {
  try {
    const data = JSON.stringify(Array.from(cache.entries()));
    localStorage.setItem('devguard_scan_cache_v3', data);
  } catch (e) {
    console.error('Failed to save scan cache:', e);
  }
};

const userScanCache = getPersistedCache(); // Map<uid, { scans, fetchTime }>

export function useScans() {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;

  // STALE-WHILE-REVALIDATE:
  // 1. Serve whatever is in cache INSTANTLY (no skeleton, no wait)
  // 2. If cache is stale OR empty, fetch in the background
  // 3. 'loading' is only true when there is ZERO data to show (absolute first load)

  const getInitialState = () => {
    if (!uid) return { scans: [], loading: false };
    const cached = userScanCache.get(uid);
    if (cached) return { scans: cached.scans, loading: false }; // Serve instantly from cache
    return { scans: [], loading: true }; // Only show skeleton on very first load for this uid
  };

  const initial = getInitialState();
  const [scans, setScans] = useState(initial.scans);
  const [loading, setLoading] = useState(initial.loading);
  const [refreshing, setRefreshing] = useState(false); // Subtle background refresh indicator

  const fetchScans = useCallback(async (silent = false) => {
    if (!uid) return;

    const cached = userScanCache.get(uid);
    const isStale = !cached || (Date.now() - cached.fetchTime > CACHE_STALE_TIME);

    if (!isStale && cached) {
      // Cache is fresh — serve instantly, no network request
      setScans(cached.scans);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    // We have stale/no cache — fetch, but show existing data while we wait
    if (cached && silent) {
      // Stale-while-revalidate: show old data, refresh silently
      setRefreshing(true);
    } else if (!cached) {
      // No data at all — show loading
      setLoading(true);
    }

    try {
      const q = query(collection(db, 'scans'), where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      const scansData = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      scansData.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

      userScanCache.set(uid, { scans: scansData, fetchTime: Date.now() });
      savePersistedCache(userScanCache); // Persist
      setScans(scansData);
    } catch (err) {
      console.error('Error fetching scans:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      setScans([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const cached = userScanCache.get(uid);

    if (!cached) {
      // First load for this user — fetch and show loading skeleton
      setLoading(true);
      fetchScans(false);
    } else {
      // Serve cached data immediately, then silently refresh in background if stale
      setScans(cached.scans);
      setLoading(false);
      const isStale = Date.now() - cached.fetchTime > CACHE_STALE_TIME;
      if (isStale) {
        fetchScans(true); // Silent background refresh
      }
    }
  }, [uid]); // Do NOT include fetchScans — uid change is the only trigger we need

  const saveScan = async (code, vulnerabilities) => {
    if (!uid) return null;
    try {
      // Smart naming: Skip comments (//, #, /*) and empty lines to find real code
      const lines = code.split('\n').filter(l => {
        const t = l.trim();
        return t.length > 0 && 
               !t.startsWith('//') && 
               !t.startsWith('#') && 
               !t.startsWith('/*') && 
               !t.startsWith('*');
      });
      
      const firstCodeLine = lines[0] || 'Unknown Logic';
      let baseTitle = firstCodeLine.substring(0, 40).trim() || 'Unnamed Snippet';
      
      // Generate a short 4-char unique ID for the title to ensure uniqueness
      const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
      const title = `${baseTitle} #${shortId}`;

      const currentScans = userScanCache.get(uid)?.scans || [];
      
      // Enforce 7-scan limit: If 7 or more exist, delete the oldest (last in array as they are sorted desc)
      if (currentScans.length >= 7) {
        const oldest = currentScans[currentScans.length - 1];
        try {
          await deleteDoc(doc(db, 'scans', oldest.id));
          // Update cache immediately to reflect deletion
          currentScans.pop(); 
        } catch (err) {
          console.error('Error pruning oldest scan:', err);
        }
      }

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

      // Optimistic: prepend to cache immediately
      const newScan = { 
        id: docRef.id, 
        ...payload, 
        createdAt: { toMillis: () => Date.now() } 
      };
      
      const updated = [newScan, ...currentScans];
      userScanCache.set(uid, { scans: updated, fetchTime: Date.now() });
      savePersistedCache(userScanCache); // Persist
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
      // Optimistic update — instant UI response
      const current = userScanCache.get(uid)?.scans || [];
      const updated = current.map(s => s.id === scanId ? { ...s, isBookmarked: !currentStatus } : s);
      userScanCache.set(uid, { scans: updated, fetchTime: userScanCache.get(uid)?.fetchTime || Date.now() });
      savePersistedCache(userScanCache); // Persist
      setScans(updated);

      await updateDoc(doc(db, 'scans', scanId), { isBookmarked: !currentStatus });
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      // Revert on failure
      fetchScans(true);
      throw err;
    }
  };

  const removeScan = async (scanId) => {
    if (!uid) return;
    try {
      // Optimistic remove
      const current = userScanCache.get(uid)?.scans || [];
      const updated = current.filter(s => s.id !== scanId);
      userScanCache.set(uid, { scans: updated, fetchTime: userScanCache.get(uid)?.fetchTime || Date.now() });
      savePersistedCache(userScanCache); // Persist
      setScans(updated);

      await deleteDoc(doc(db, 'scans', scanId));
    } catch (err) {
      console.error('Error deleting scan:', err);
      fetchScans(true);
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

  return { scans, loading, refreshing, saveScan, toggleBookmark, removeScan, getStats, refetch: fetchScans };
}
