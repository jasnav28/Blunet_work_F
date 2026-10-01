import React, { useState, useEffect } from 'react';
import { WifiOff, AlertTriangle, X, RefreshCw, CheckCircle2, ServerCrash } from 'lucide-react';
import { networkMonitor, NetworkStatusState } from '../../lib/networkMonitor';

export const NetworkStatusBanner: React.FC = () => {
  const [networkState, setNetworkState] = useState<NetworkStatusState>(() => networkMonitor.getState());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const unsubscribe = networkMonitor.subscribe((state) => {
      setNetworkState(state);
      // Automatically show banner on state change unless explicitly dismissed
      if (state.status !== 'ONLINE') {
        setDismissed(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (networkState.status === 'ONLINE' || dismissed) {
    return null;
  }

  // 1. Browser Offline State
  if (networkState.status === 'OFFLINE') {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs font-medium animate-in slide-in-from-top duration-300">
        <div className="flex items-center gap-2.5 mx-auto sm:mx-0">
          <WifiOff className="w-4 h-4 text-amber-200 animate-pulse shrink-0" />
          <span>{networkState.message || "You're offline. Please check your internet connection."}</span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-[11px] font-bold transition-all cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // 2. Server Unavailable State (Railway / API Unreachable)
  if (networkState.status === 'SERVER_UNAVAILABLE') {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-rose-700 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs font-medium animate-in slide-in-from-top duration-300">
        <div className="flex items-center gap-2.5 mx-auto sm:mx-0">
          <ServerCrash className="w-4 h-4 text-rose-200 shrink-0" />
          <span>{networkState.message || 'Unable to connect to the server. Please try again.'}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => networkMonitor.verifyServerHealth()}
            className="flex items-center gap-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-[11px] font-bold transition-all cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Check Health</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-rose-600 rounded text-white transition-all cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 3. Degraded API Latency State
  if (networkState.status === 'DEGRADED') {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 border-b border-amber-600 text-slate-950 px-4 py-2 shadow-md flex items-center justify-between text-xs font-semibold animate-in slide-in-from-top duration-300">
        <div className="flex items-center gap-2.5 mx-auto sm:mx-0">
          <AlertTriangle className="w-4 h-4 text-slate-900 shrink-0" />
          <span>{networkState.message || 'Server response is taking longer than expected.'}</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-amber-600/30 rounded text-slate-950 transition-all cursor-pointer"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // 4. Recovered State
  if (networkState.status === 'RECOVERED') {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-emerald-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs font-medium animate-in slide-in-from-top duration-300">
        <div className="flex items-center gap-2.5 mx-auto sm:mx-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{networkState.message || 'Connection restored.'}</span>
        </div>
      </div>
    );
  }

  return null;
};
