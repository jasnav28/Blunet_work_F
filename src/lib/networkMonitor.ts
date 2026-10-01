/**
 * Centralized Network & Server Health Monitor
 * 
 * Accurately classifies connection states without false-positive "Poor Network" warnings:
 * - ONLINE: Everything healthy
 * - OFFLINE: Browser navigator.onLine is false or window.offline fired
 * - SERVER_UNAVAILABLE: Browser is online, but backend API (Railway) is down/unreachable (502/503/504/connection refused)
 * - DEGRADED: Repeated high latency on API calls (>8 seconds)
 * - RECOVERED: Connection restored after being OFFLINE or SERVER_UNAVAILABLE
 */

export type NetworkStatusType = 'ONLINE' | 'OFFLINE' | 'SERVER_UNAVAILABLE' | 'DEGRADED' | 'RECOVERED';

export interface NetworkStatusState {
  status: NetworkStatusType;
  message: string;
  lastChecked: number;
}

type Listener = (state: NetworkStatusState) => void;

class NetworkMonitor {
  private currentState: NetworkStatusState = {
    status: 'ONLINE',
    message: '',
    lastChecked: Date.now(),
  };

  private listeners: Set<Listener> = new Set();
  private consecutiveServerFailures = 0;
  private consecutiveSlowRequests = 0;
  private lastHealthCheckTime = 0;
  private healthCheckInProgress = false;
  private recoveryTimer: ReturnType<typeof setTimeout> | null = null;
  private lastNotificationTime = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);

      if (!navigator.onLine) {
        this.updateState('OFFLINE', "You're offline. Please check your internet connection.");
      }
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Send initial state
    listener(this.currentState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): NetworkStatusState {
    return { ...this.currentState };
  }

  private handleOnline = () => {
    if (this.currentState.status === 'OFFLINE') {
      this.triggerRecovery();
    } else {
      this.updateState('ONLINE', '');
    }
  };

  private handleOffline = () => {
    this.consecutiveServerFailures = 0;
    this.consecutiveSlowRequests = 0;
    this.updateState('OFFLINE', "You're offline. Please check your internet connection.");
  };

  /**
   * Report an API response or failure from Axios interceptor
   */
  public reportApiResult(options: {
    success: boolean;
    status?: number;
    durationMs?: number;
    isTimeoutOrNetworkError?: boolean;
  }) {
    // If browser is offline, let browser offline status handle it
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (this.currentState.status !== 'OFFLINE') {
        this.handleOffline();
      }
      return;
    }

    const { success, status, durationMs, isTimeoutOrNetworkError } = options;

    if (success) {
      this.consecutiveServerFailures = 0;
      this.consecutiveSlowRequests = 0;

      if (this.currentState.status === 'SERVER_UNAVAILABLE' || this.currentState.status === 'OFFLINE') {
        this.triggerRecovery();
      } else if (this.currentState.status === 'DEGRADED') {
        this.updateState('ONLINE', '');
      }
      return;
    }

    // 4xx errors are client/application errors, NOT server/network down
    if (status && status >= 400 && status < 500) {
      return;
    }

    // Server errors (500, 502, 503, 504) or timeout/network unreachable
    if ((status && status >= 500) || isTimeoutOrNetworkError) {
      this.consecutiveServerFailures += 1;

      // Only transition to SERVER_UNAVAILABLE after 2 consecutive server failures
      if (this.consecutiveServerFailures >= 2) {
        this.updateState(
          'SERVER_UNAVAILABLE',
          "Unable to connect to the server. Please check back shortly or try again."
        );
        // Verify server health asynchronously with debounce
        this.verifyServerHealth();
      }
      return;
    }

    // Check for degraded performance (e.g. request taking > 8000ms)
    if (durationMs && durationMs > 8000) {
      this.consecutiveSlowRequests += 1;
      if (this.consecutiveSlowRequests >= 3 && this.currentState.status === 'ONLINE') {
        this.updateState('DEGRADED', 'Server response is taking longer than expected.');
      }
    }
  }

  /**
   * Perform a debounced lightweight backend health check
   */
  public async verifyServerHealth() {
    const now = Date.now();
    // Minimum 30 seconds between health checks to prevent backend hammering
    if (this.healthCheckInProgress || now - this.lastHealthCheckTime < 30000) {
      return;
    }

    this.healthCheckInProgress = true;
    this.lastHealthCheckTime = now;

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const healthUrl = `${baseUrl.replace(/\/+$/, '')}/health`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        this.consecutiveServerFailures = 0;
        if (this.currentState.status === 'SERVER_UNAVAILABLE') {
          this.triggerRecovery();
        }
      } else {
        if (this.currentState.status !== 'OFFLINE') {
          this.updateState(
            'SERVER_UNAVAILABLE',
            "Unable to connect to the server. Please check back shortly or try again."
          );
        }
      }
    } catch {
      if (this.currentState.status !== 'OFFLINE') {
        this.updateState(
          'SERVER_UNAVAILABLE',
          "Unable to connect to the server. Please check back shortly or try again."
        );
      }
    } finally {
      this.healthCheckInProgress = false;
    }
  }

  private triggerRecovery() {
    this.consecutiveServerFailures = 0;
    this.consecutiveSlowRequests = 0;

    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
    }

    this.updateState('RECOVERED', 'Connection restored.');

    // Reset to ONLINE after 4 seconds
    this.recoveryTimer = setTimeout(() => {
      this.updateState('ONLINE', '');
    }, 4000);
  }

  private updateState(status: NetworkStatusType, message: string) {
    const now = Date.now();
    // Deduplicate identical notifications within 10 seconds unless state changed
    if (
      this.currentState.status === status &&
      this.currentState.message === message &&
      now - this.lastNotificationTime < 10000
    ) {
      return;
    }

    this.currentState = {
      status,
      message,
      lastChecked: now,
    };
    this.lastNotificationTime = now;

    this.listeners.forEach((listener) => {
      try {
        listener(this.currentState);
      } catch (err) {
        console.error('Error in NetworkMonitor listener:', err);
      }
    });
  }
}

export const networkMonitor = new NetworkMonitor();
