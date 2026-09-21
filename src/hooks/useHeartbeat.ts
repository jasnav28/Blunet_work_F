import { useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export const useHeartbeat = () => {
  const { user } = useAuth();
  const lastActivityTime = useRef<number>(Date.now());

  useEffect(() => {
    if (!user) return;

    const handleUserActivity = () => {
      lastActivityTime.current = Date.now();
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);

    // Send heartbeat every 60 seconds
    const interval = setInterval(async () => {
      const idleDuration = (Date.now() - lastActivityTime.current) / 1000;
      const isIdle = idleDuration > 180; // 3 minutes idle threshold

      try {
        await api.post('/activity/heartbeat', {
          isIdle,
          elapsedSeconds: 60,
        });
      } catch (err) {
        console.warn('Heartbeat update skipped:', err);
      }
    }, 60000);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      clearInterval(interval);
    };
  }, [user]);
};
