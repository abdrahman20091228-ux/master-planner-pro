'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useApp } from './app-context';

export function ConnectionIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const { t } = useApp();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div 
      className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
        isOnline 
          ? 'bg-success/20 text-success' 
          : 'bg-muted text-muted-foreground'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-3 h-3" />
          <span>{t.online}</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>{t.offline}</span>
        </>
      )}
    </div>
  );
}
