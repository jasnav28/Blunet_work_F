import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { getUserSlug } from '../../lib/userSlug';

interface TaskNotification {
  id: string;
  title: string;
  message: string;
  link?: string;
  createdAt?: string;
}

export const TaskNotificationBanner: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activePopup, setActivePopup] = useState<TaskNotification | null>(null);
  
  const knownNotificationIds = useRef<Set<string>>(new Set());
  const knownTaskIds = useRef<Set<string>>(new Set());
  const isInitialized = useRef<boolean>(false);

  // Function to play a realistic two-tone bell chime sound using Web Audio API
  const playBellSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Tone 1: High Bell Chime (C6 ~ 1046.5 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1046.50, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);

      // Tone 2: Harmonic overtone (G6 ~ 1567.98 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1567.98, now);
      gain2.gain.setValueAtTime(0.2, now);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      // Tone 3: Second ding chime (E6 ~ 1318.51 Hz) after 120ms delay
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(1318.51, now + 0.12);
      gain3.gain.setValueAtTime(0.0001, now);
      gain3.gain.setValueAtTime(0.35, now + 0.12);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now + 0.12);

      osc1.stop(now + 1.0);
      osc2.stop(now + 0.8);
      osc3.stop(now + 1.2);
    } catch (err) {
      console.warn('Unable to play task notification bell sound:', err);
    }
  };

  useEffect(() => {
    if (!user) return;

    const checkNewTasks = async () => {
      try {
        // Fetch notifications and my tasks concurrently
        const [notifRes, tasksRes] = await Promise.allSettled([
          api.get('/notifications'),
          api.get('/tasks/my'),
        ]);

        let newNotificationFound: TaskNotification | null = null;

        // Process notifications endpoint
        if (notifRes.status === 'fulfilled' && notifRes.value.data.success) {
          const notifications: Array<{ id: string; title: string; message: string; link?: string }> =
            notifRes.value.data.data.notifications || [];

          if (!isInitialized.current) {
            notifications.forEach((n) => knownNotificationIds.current.add(n.id));
          } else {
            for (const n of notifications) {
              if (!knownNotificationIds.current.has(n.id)) {
                knownNotificationIds.current.add(n.id);
                newNotificationFound = {
                  id: n.id,
                  title: n.title || 'New Task Assigned',
                  message: n.message || 'You have been assigned a new task.',
                  link: n.link || '/tasks',
                };
                break;
              }
            }
          }
        }

        // Process tasks endpoint as fallback
        if (tasksRes.status === 'fulfilled' && tasksRes.value.data.success) {
          const tasks: Array<{ id: string; title: string; description: string; assignedBy?: { name: string } }> =
            tasksRes.value.data.data || [];

          if (!isInitialized.current) {
            tasks.forEach((t) => knownTaskIds.current.add(t.id));
          } else {
            for (const t of tasks) {
              if (!knownTaskIds.current.has(t.id)) {
                knownTaskIds.current.add(t.id);
                if (!newNotificationFound) {
                  newNotificationFound = {
                    id: t.id,
                    title: 'New Task Arrived!',
                    message: `Task "${t.title}" assigned${t.assignedBy?.name ? ` by ${t.assignedBy.name}` : ''}.`,
                    link: '/tasks',
                  };
                }
              }
            }
          }
        }

        if (!isInitialized.current) {
          isInitialized.current = true;
        } else if (newNotificationFound) {
          playBellSound();
          setActivePopup(newNotificationFound);
        }
      } catch (err) {
        console.error('Error checking new task notifications:', err);
      }
    };

    // Initial check
    checkNewTasks();

    // Poll every 8 seconds for real-time task arrival detection
    const interval = setInterval(checkNewTasks, 8000);

    return () => clearInterval(interval);
  }, [user]);

  // Auto-dismiss popup after 10 seconds
  useEffect(() => {
    if (!activePopup) return;
    const timer = setTimeout(() => {
      setActivePopup(null);
    }, 10000);
    return () => clearTimeout(timer);
  }, [activePopup]);

  if (!activePopup || !user) return null;

  const handleNavigateToTasks = () => {
    setActivePopup(null);
    const userSlug = getUserSlug(user);
    const path = activePopup.link || '/tasks';
    const targetUrl = `/${userSlug}${path.startsWith('/') ? path : '/' + path}`;
    navigate(targetUrl);
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-md w-full sm:w-96 bg-white border border-blue-200 rounded-2xl shadow-2xl p-4 text-slate-900 animate-in slide-in-from-top duration-300">
      <div className="flex items-start gap-3">
        {/* Bell Icon with Chime Pulsing Effect */}
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md animate-bounce">
          <Bell className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5" />
              New Task Notification
            </span>
            <button
              onClick={() => setActivePopup(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="font-bold text-sm text-slate-900 mt-1 truncate">{activePopup.title}</h4>
          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">{activePopup.message}</p>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={() => setActivePopup(null)}
              className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={handleNavigateToTasks}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <span>View Task</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
