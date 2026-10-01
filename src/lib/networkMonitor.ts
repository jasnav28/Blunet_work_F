/**
 * Centralized Network & Server Health Monitor
 * 
 * Strict Error Classification:
 * - ONLINE: Default healthy state (No user notification)
 * - OFFLINE: Browser is offline (navigator.onLine === false or offline event)
 * - SERVER_UNAVAILABLE: Browser is online, but Railway backend is unreachable (502/503/504/Health probe failure)
 * - RECOVERED: Connection restored after being OFFLINE or SERVER_UNAVAILABLE
 * 
 * Note: Slow API response time (latency) is NEVER classified as "Poor Internet Connection".
 */

export type NetworkStatusType = 'ONLINE' | 'OFFLINE' | 'SERVER_UNAVAILABLE' | 'RECOVERED';

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
  private lastHealthCheckTime = 0;
  private healthCheckInProgress = false;
  private recoveryTimer: ReturnType<typeof setTimeout> | null = null;
  private lastNotificationTime = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);

      if (!navigator.onLine) {
        this.updateState('OFFLINE', "No Internet Connection. Please check your network.");
      }
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
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
    this.updateState('OFFLINE', "No Internet Connection. Please check your network.");
  };

  /**
   * Report API call execution result from Axios interceptor
   */
  public reportApiResult(options: {
    success: boolean;
    status?: number;
    durationMs?: number;
    isTimeoutOrNetworkError?: boolean;
  }) {
    // 1. If browser is offline, prioritize OFFLINE state
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (this.currentState.status !== 'OFFLINE') {
        this.handleOffline();
      }
      return;
    }

    const { success, status, isTimeoutOrNetworkError } = options;

    if (success) {
      this.consecutiveServerFailures = 0;
      if (this.currentState.status === 'SERVER_UNAVAILABLE' || this.currentState.status === 'OFFLINE') {
        this.triggerRecovery();
      }
      return;
    }

    // 2. 4xx errors (400, 401, 403, 404, 409) mean the server IS reachable and functioning properly.
    if (status && status >= 400 && status < 500) {
      this.consecutiveServerFailures = 0;
      return;
    }

    // 3. True server unavailability (502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout, or server crash)
    if ((status && status >= 500) || isTimeoutOrNetworkError) {
      this.consecutiveServerFailures += 1;

      // Require 3 consecutive failures before displaying SERVER_UNAVAILABLE to avoid single-error noise
      if (this.consecutiveServerFailures >= 3 && this.currentState.status !== 'SERVER_UNAVAILABLE') {
        this.updateState(
          'SERVER_UNAVAILABLE',
          'Unable to connect to the server. Please try again.'
        );
        this.verifyServerHealth();
      }
    }
  }

  /**
   * Debounced lightweight backend health check (GET /api/health)
   */
  public async verifyServerHealth() {
    const now = Date.now();
    // Minimum 30s interval between health checks to prevent API hammering
    if (this.healthCheckInProgress || now - this.lastHealthCheckTime < 30000) {
      return;
    }

    this.healthCheckInProgress = true;
    this.lastHealthCheckTime = now;

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const healthUrl = `${baseUrl.replace(/\/+$/, '')}/health`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

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
        if (typeof navigator !== 'undefined' && navigator.onLine) {
          this.updateState('SERVER_UNAVAILABLE', 'Unable to connect to the server. Please try again.');
        }
      }
    } catch {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        this.updateState('SERVER_UNAVAILABLE', 'Unable to connect to the server. Please try again.');
      }
    } finally {
      this.healthCheckInProgress = false;
    }
  }

  private triggerRecovery() {
    this.consecutiveServerFailures = 0;

    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
    }

    this.updateState('RECOVERED', 'Connection restored.');

    this.recoveryTimer = setTimeout(() => {
      this.updateState('ONLINE', '');
    }, 4000);
  }

  private updateState(status: NetworkStatusType, message: string) {
    const now = Date.now();
    if (
      this.currentState.status === status &&
      this.currentState.message === message &&
      now - this.lastNotificationTime < 15000
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
