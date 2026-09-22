import React, { useState, useEffect } from 'react';
import { AlertCircle, PhoneCall, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export const TargetReminderModal: React.FC = () => {
  const [reminder, setReminder] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const todayStr = new Date().toDateString();
    const dismissedToday = sessionStorage.getItem('blunet_reminder_dismissed_date');

    // Prevent notification spam per session/day
    if (dismissedToday === todayStr) {
      return;
    }

    const checkReminders = async () => {
      try {
        const res = await api.get('/marketing/reminders');
        if (res.data.success && res.data.data.isBehind) {
          setReminder(res.data.data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Failed to check target reminders:', err);
      }
    };

    checkReminders();
  }, []);

  const handleDismiss = () => {
    const todayStr = new Date().toDateString();
    sessionStorage.setItem('blunet_reminder_dismissed_date', todayStr);
    setIsOpen(false);
  };

  if (!isOpen || !reminder) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleDismiss} title="Performance Target Reminder" maxWidth="md">
      <div className="space-y-5 py-1">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-900">Calling & Deal Targets Need Attention</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              You are currently behind your expected progress milestones. Please continue following up on your assigned lead queue.
            </p>
          </div>
        </div>

        {/* Consolidated Daily & Monthly Progress */}
        <div className="space-y-3">
          {reminder.daily?.isBehind && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-700 flex items-center gap-1.5 font-bold">
                  <PhoneCall className="w-4 h-4 text-blue-600" />
                  Today's Lead Calling Progress
                </span>
                <span className="text-blue-600 font-bold">{reminder.daily.progressPercentage}%</span>
              </div>
              <div className="text-lg font-extrabold text-slate-900">
                {reminder.daily.completedCalls} / {reminder.daily.dailyTarget} Calls Completed
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${reminder.daily.progressPercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {reminder.daily.remainingCalls} calls remaining to fulfill today's target.
              </p>
            </div>
          )}

          {reminder.monthly?.isBehind && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-700 flex items-center gap-1.5 font-bold">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Monthly Closed Projects Progress
                </span>
                <span className="text-emerald-600 font-bold">{reminder.monthly.progressPercentage}%</span>
              </div>
              <div className="text-lg font-extrabold text-slate-900">
                {reminder.monthly.dealsClosed} / {reminder.monthly.monthlyTarget} Projects Closed
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${reminder.monthly.progressPercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {reminder.monthly.remainingDeals} closed deals remaining for this month's target.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="secondary" onClick={handleDismiss}>
            Dismiss Reminder
          </Button>
          <Button onClick={handleDismiss} icon={<ArrowRight className="w-4 h-4" />}>
            Go to Lead Caller
          </Button>
        </div>
      </div>
    </Modal>
  );
};
