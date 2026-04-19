import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

const ScanContext = createContext();

const CACHE_STALE_TIME = 1000 * 60 * 5; // 5 min

// HELPERS: LocalStorage Persistence
const getPersistedCache = () => {
  try {
    const saved = localStorage.getItem('devguard_scan_cache_v4');
    if (!saved) return new Map();
    const data = JSON.parse(saved);
    // Backward compatibility: ensure it's a valid array before conversion
    if (!Array.isArray(data)) return new Map();
    return new Map(data);
  } catch (e) { 
    console.error('Cache hydration failed', e);
    return new Map(); 
  }
};

const savePersistedCache = (cache) => {
  try {
    const data = JSON.stringify(Array.from(cache.entries()));
    localStorage.setItem('devguard_scan_cache_v4', data);
  } catch (e) {}
};

const userScanCache = getPersistedCache();

export function ScanProvider({ children }) {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;

  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // FETCH: Bridging Cloud & Local Storage
  const fetchScans = useCallback(async (options = { silent: false, force: false }) => {
    if (!uid) return;

    const cached = userScanCache.get(uid);
    const isStale = !cached || (Date.now() - cached.fetchTime > CACHE_STALE_TIME);

    // If fresh and not forcing, return cached instantly
    if (!isStale && !options.force && cached) {
      setScans(cached.scans);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (cached && (options.silent || options.force)) {
      setRefreshing(true);
    } else if (!cached) {
      setLoading(true);
    }

    try {
      const q = query(collection(db, 'scans'), where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      const scansData = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Sort by creation time (most recent first)
      scansData.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });

      userScanCache.set(uid, { scans: scansData, fetchTime: Date.now() });
      savePersistedCache(userScanCache);
      setScans(scansData);
    } catch (err) {
      console.error('Error fetching scans:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [uid]);

  // Handle Auth Changes: Crucial for persistence
  useEffect(() => {
    if (!uid) {
      setScans([]);
      setLoading(false);
      return;
    }

    const cached = userScanCache.get(uid);
    if (cached) {
      setScans(cached.scans);
      // Even if cached, do a silent background refresh to ensure consistency
      fetchScans({ silent: true });
    } else {
      fetchScans();
    }
  }, [uid, fetchScans]);

  const saveScan = async (code, vulnerabilities, language) => {
    if (!uid) return null;
    try {
      // Improved Naming logic
      const lines = code.split('\n').map(l => l.trim()).filter(l => {
        return l.length > 0 && !/^(?:\/\/|#|\/\*|\*)/.test(l) && !l.toLowerCase().includes('paste your');
      });
      
      const firstLine = lines[0] || 'Clean Snippet';
      let baseTitle = firstLine.replace(/^[^a-zA-Z0-9]+/, '').substring(0, 35).trim() || 'Untitled Scan';
      const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
      const title = `${baseTitle} #${shortId}`;

      const currentScans = [...scans];
      
      // Enforce 7-scan limit
      if (currentScans.length >= 7) {
        const oldest = currentScans[currentScans.length - 1];
        await deleteDoc(doc(db, 'scans', oldest.id));
        currentScans.pop();
      }

      const payload = {
        userId: uid,
        title,
        code,
        language: language || 'javascript',
        vulnerabilities,
        issueCount: vulnerabilities.length,
        isBookmarked: false,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'scans'), payload);
      const newScan = { id: docRef.id, ...payload, createdAt: { toMillis: () => Date.now() } };
      
      const updated = [newScan, ...currentScans];
      userScanCache.set(uid, { scans: updated, fetchTime: Date.now() });
      savePersistedCache(userScanCache);
      setScans(updated);

      return docRef.id;
    } catch (err) {
      console.error('Error saving scan:', err);
      throw err;
    }
  };

  const updateScan = async (scanId, data) => {
    if (!uid) return;
    try {
      const updatedScans = scans.map(s => s.id === scanId ? { ...s, ...data } : s);
      setScans(updatedScans);
      userScanCache.set(uid, { scans: updatedScans, fetchTime: userScanCache.get(uid)?.fetchTime || Date.now() });
      savePersistedCache(userScanCache);
      await updateDoc(doc(db, 'scans', scanId), data);
    } catch (err) {
      console.error('Error updating scan:', err);
    }
  };

  const toggleBookmark = async (scanId, currentStatus) => {
    if (!uid) return;
    try {
      const updated = scans.map(s => s.id === scanId ? { ...s, isBookmarked: !currentStatus } : s);
      setScans(updated);
      userScanCache.set(uid, { scans: updated, fetchTime: userScanCache.get(uid)?.fetchTime || Date.now() });
      savePersistedCache(userScanCache);
      await updateDoc(doc(db, 'scans', scanId), { isBookmarked: !currentStatus });
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      fetchScans({ silent: true });
    }
  };

  const removeScan = async (scanId) => {
    if (!uid) return;
    try {
      const updated = scans.filter(s => s.id !== scanId);
      setScans(updated);
      userScanCache.set(uid, { scans: updated, fetchTime: userScanCache.get(uid)?.fetchTime || Date.now() });
      savePersistedCache(userScanCache);
      await deleteDoc(doc(db, 'scans', scanId));
    } catch (err) {
      console.error('Error deleting scan:', err);
      fetchScans({ silent: true });
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

  const value = {
    scans,
    loading,
    refreshing,
    saveScan,
    updateScan,
    toggleBookmark,
    removeScan,
    getStats,
    refetch: (force = false) => fetchScans({ silent: false, force })
  };

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export const useScanContext = () => useContext(ScanContext);
