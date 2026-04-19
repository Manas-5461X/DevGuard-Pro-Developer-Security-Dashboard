import React, { useState, useEffect } from 'react';

/**
 * Reusable component for real-time relative timestamps.
 * Updates automatically every minute (or 10s if < 1m).
 */
export default function RelativeTime({ timestamp, className = "" }) {
  const [relativeTime, setRelativeTime] = useState('');

  useEffect(() => {
    if (!timestamp) {
      setRelativeTime('Just now');
      return;
    }

    const calculate = () => {
      const date = typeof timestamp.toMillis === 'function' ? new Date(timestamp.toMillis()) : new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 5) return 'Just now';
      if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      
      // Fallback to local date if more than a day
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    };

    setRelativeTime(calculate());

    const intervalTime = () => {
      const now = new Date();
      const date = typeof timestamp.toMillis === 'function' ? new Date(timestamp.toMillis()) : new Date(timestamp);
      const diffInSeconds = Math.floor((now - date) / 1000);
      return diffInSeconds < 60 ? 10000 : 60000; // 10s for first minute, then 60s
    };

    const interval = setInterval(() => {
      setRelativeTime(calculate());
    }, intervalTime());

    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <span className={className}>
      {relativeTime}
    </span>
  );
}
