import { useScanContext } from '../context/ScanContext';

/**
 * useScans hook (DEPRECATED: Now uses ScanContext for global sync)
 * Maintained as a proxy for backward compatibility.
 */
export function useScans() {
  return useScanContext();
}
