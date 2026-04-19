import { useScanContext } from '../context/ScanContext';

/**
 * useScans hook
 * Proxy to ScanContext for global state synchronization.
 */
export function useScans() {
  return useScanContext();
}
