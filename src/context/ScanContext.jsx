import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

const ScanContext = createContext();

const CACHE_STALE_TIME = 1000 * 60 * 5; // 5 min

// HELPERS: LocalStorage Persistence
const getStorageKey = (uid) => uid ? `devguard_scans_u_${uid}` : 'devguard_scans_guest';

const getLocalScans = (uid) => {
  try {
    const key = getStorageKey(uid);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Local storage read failed', e);
    return [];
  }
};

const saveLocalScans = (uid, scans) => {
  try {
    const key = getStorageKey(uid);
    // Limit to 20 scans locally to prevent storage bloat
    const limited = scans.slice(0, 20);
    localStorage.setItem(key, JSON.stringify(limited));
  } catch (e) {
    console.error('Local storage write failed', e);
  }
};

export function ScanProvider({ children }) {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;

  const [scans, setScans] = useState(() => getLocalScans(null)); // Initialize with guest scans or empty
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Sync from Firebase on load/auth change
  const fetchScans = useCallback(async (options = { silent: false, force: false }) => {
    if (!uid) {
      setScans(getLocalScans(null));
      setLoading(false);
      return;
    }

    if (!options.silent && !options.force) setLoading(true);
    if (options.silent || options.force) setRefreshing(true);

    try {
      const q = query(collection(db, 'scans'), where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      const scansData = querySnapshot.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        // Normalize createdAt for UI consistency
        createdAt: d.data().createdAt?.toMillis ? { toMillis: () => d.data().createdAt.toMillis() } : d.data().createdAt 
      }));
      
      scansData.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });

      setScans(scansData);
      saveLocalScans(uid, scansData);
    } catch (err) {
      console.error('Firebase fetch failed, falling back to local', err);
      setScans(getLocalScans(uid));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [uid]);

  useEffect(() => {
    // Immediate hydration from local storage
    const local = getLocalScans(uid);
    setScans(local);
    
    if (uid) {
      fetchScans({ silent: true });
    } else {
      setLoading(false);
    }
  }, [uid, fetchScans]);

  const saveScan = async (code, vulnerabilities, language) => {
    const tempId = `local_${Date.now()}`;
    const lines = code.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !/^(?:\/\/|#|\/\*)/.test(l));
    const firstLine = lines[0] || 'Snippet';
    const title = `${firstLine.substring(0, 30)} #${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    const newScan = {
      id: tempId,
      userId: uid || 'guest',
      title,
      code,
      language: language || 'javascript',
      vulnerabilities,
      issueCount: vulnerabilities.length,
      isBookmarked: false,
      createdAt: { toMillis: () => Date.now() }
    };

    // 1. Update UI and Local Storage Instantly
    const updated = [newScan, ...scans].slice(0, 20);
    setScans(updated);
    saveLocalScans(uid, updated);

    // 2. Sync to Firebase if logged in
    if (uid) {
      try {
        const payload = { ...newScan, userId: uid, createdAt: serverTimestamp() };
        delete payload.id; // Let Firebase generate ID
        const docRef = await addDoc(collection(db, 'scans'), payload);
        
        // Update local item with real Firebase ID
        const finalScans = updated.map(s => s.id === tempId ? { ...s, id: docRef.id } : s);
        setScans(finalScans);
        saveLocalScans(uid, finalScans);
        return docRef.id;
      } catch (err) {
        console.error('Firebase sync failed', err);
      }
    }
    return tempId;
  };

  const updateScan = async (scanId, data) => {
    const updated = scans.map(s => s.id === scanId ? { ...s, ...data } : s);
    setScans(updated);
    saveLocalScans(uid, updated);

    if (uid && !scanId.startsWith('local_')) {
      try {
        await updateDoc(doc(db, 'scans', scanId), data);
      } catch (err) {
        console.error('Firebase update failed', err);
      }
    }
  };

  const toggleBookmark = async (scanId, currentStatus) => {
    const updated = scans.map(s => s.id === scanId ? { ...s, isBookmarked: !currentStatus } : s);
    setScans(updated);
    saveLocalScans(uid, updated);

    if (uid && !scanId.startsWith('local_')) {
      try {
        await updateDoc(doc(db, 'scans', scanId), { isBookmarked: !currentStatus });
      } catch (err) {
        console.error('Firebase bookmark failed', err);
      }
    }
  };

  const removeScan = async (scanId) => {
    const updated = scans.filter(s => s.id !== scanId);
    setScans(updated);
    saveLocalScans(uid, updated);

    if (uid && !scanId.startsWith('local_')) {
      try {
        await deleteDoc(doc(db, 'scans', scanId));
      } catch (err) {
        console.error('Firebase delete failed', err);
      }
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
