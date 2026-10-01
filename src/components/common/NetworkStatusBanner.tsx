import React, { useState, useEffect } from 'react';
import { WifiOff, AlertTriangle, X, RefreshCw, SignalLow } from 'lucide-react';

export const NetworkStatusBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isPoorNetwork, setIsPoorNetwork] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [slowReason, setSlowReason] = useState<string>('');

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setDismissed(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check Network Information API if explicitly throttled
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    const checkNetworkSpeed = () => {
      if (!connection) return;
      const { effectiveType } = connection;
      if (effectiveType === 'slow-2g') {
        setIsPoorNetwork(true);
        setSlowReason('Low speed connection (slow-2g)');
      } else {
        setIsPoorNetwork(false);
      }
    };

    checkNetworkSpeed();
    if (connection) {
      connection.addEventListener('change', checkNetworkSpeed);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', checkNetworkSpeed);
      }
    };
  }, [isOffline]);

  if (dismissed && !isOffline) return null;

  if (isOffline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs font-medium animate-in slide-in-from-top duration-300">
        <div className="flex items-center gap-2.5 mx-auto sm:mx-0">
          <WifiOff className="w-4 h-4 text-amber-200 animate-pulse shrink-0" />
          <span>You are currently offline. Please check your internet connection.</span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-[11px] font-bold transition-all"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  if (isPoorNetwork && !dismissed) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 border-b border-amber-600 text-slate-950 px-4 py-2 shadow-md flex items-center justify-between text-xs font-semibold animate-in slide-in-from-top duration-300">
        <div className="flex items-center gap-2.5 mx-auto sm:mx-0">
          <SignalLow className="w-4 h-4 text-slate-900 animate-bounce shrink-0" />
          <span>
            Poor Internet Connection detected ({slowReason}). Please connect to a stable network for optimal performance.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-amber-600/30 rounded text-slate-950 transition-all"
            title="Dismiss indicator"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
};
