import React, { useState, useEffect } from 'react';
import {
  Phone,
  CheckCircle2,
  Lock,
  Clock,
  Send,
  Calendar,
  FileText,
  AlertCircle,
  BarChart2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { api } from '../lib/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Lead, MarketingAnalytics } from '../types';

export const MarketingDashboard: React.FC = () => {
  const [activeLead, setActiveLead] = useState<any | null>(null);
  const [completedLeads, setCompletedLeads] = useState<any[]>([]);
  const [lockedQueue, setLockedQueue] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<MarketingAnalytics | null>(null);
  const [campaignInfo, setCampaignInfo] = useState<{
    totalLeads: number;
    completedLeads: number;
    progressPercentage: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Response Form State
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [outcome, setOutcome] = useState('INTERESTED');
  const [notes, setNotes] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [markingCallMade, setMarkingCallMade] = useState(false);

  const fetchMarketingData = async () => {
    try {
      const [leadRes, queueRes, completedRes, analyticsRes] = await Promise.all([
        api.get('/leads/active'),
        api.get('/leads/queue?limit=5'),
        api.get('/leads/completed?limit=5'),
        api.get('/marketing/analytics'),
      ]);

      if (leadRes.data.success) {
        const leadData = leadRes.data.data.activeLead;
        setActiveLead(leadData);
        setCampaignInfo({
          totalLeads: leadRes.data.data.totalLeads,
          completedLeads: leadRes.data.data.completedLeads,
          progressPercentage: leadRes.data.data.progressPercentage || 0,
        });

        // If lead status is RESPONSE_PENDING from persistent DB state, display response form automatically!
        if (leadData && leadData.status === 'RESPONSE_PENDING') {
          setShowResponseForm(true);
        } else {
          setShowResponseForm(false);
        }
      }

      if (queueRes.data.success) setLockedQueue(queueRes.data.data);
      if (completedRes.data.success) setCompletedLeads(completedRes.data.data.completedLeads);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
    } catch (err) {
      console.error('Failed to load marketing dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketingData();
  }, []);

  const handleCallClick = () => {
    if (!activeLead) return;
    // Open tel dialer link on supported devices
    window.location.href = `tel:${activeLead.phone.replace(/\s+/g, '')}`;
  };

  const handleMarkCallMade = async () => {
    if (!activeLead) return;
    setMarkingCallMade(true);

    try {
      const res = await api.post(`/leads/${activeLead.id}/call-made`);
      if (res.data.success) {
        setShowResponseForm(true);
        fetchMarketingData();
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to confirm call made.');
    } finally {
      setMarkingCallMade(false);
    }
  };

  const handleSaveResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;
    setSubmitting(true);

    try {
      const res = await api.post(`/leads/${activeLead.id}/response`, {
        outcome,
        notes,
        followUpRequired: outcome === 'FOLLOW_UP_REQUIRED' || followUpRequired,
        followUpDate: followUpDate || null,
        followUpNote: followUpNote || null,
        dealValue: dealValue ? parseFloat(dealValue) : 0,
      });

      if (res.data.success) {
        setShowResponseForm(false);
        setNotes('');
        setFollowUpDate('');
        setFollowUpNote('');
        setDealValue('');
        setFollowUpRequired(false);
        // Refresh active lead & campaign progress
        fetchMarketingData();
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to save customer response.');
    } finally {
      setSubmitting(false);
    }
  };

  const targetAchievedPercent = analytics?.achieved.progressPercentage || 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Lead Caller Portal</h1>
          <p className="text-xs text-slate-500">Sequential lead calling workflow & customer response management</p>
        </div>
      </div>

      {/* CAMPAIGN PROGRESS & TARGET METRICS BAR */}
      {campaignInfo && (
        <Card className="bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 text-white border-0 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
            <div>
              <span className="text-blue-300 text-xs font-semibold uppercase tracking-wider">
                Current Campaign Progress
              </span>
              <div className="text-2xl font-bold mt-1">
                {campaignInfo.completedLeads} / {campaignInfo.totalLeads} Leads Completed
                <span className="text-xs font-normal text-slate-300 ml-3">
                  ({campaignInfo.progressPercentage}% Completed)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-xs text-slate-300">Total Calls Logged</div>
                <div className="text-xl font-bold text-white">{analytics?.achieved.completedCalls || 0}</div>
              </div>
              <div className="text-center border-l border-white/20 pl-6">
                <div className="text-xs text-slate-300">Interested Leads</div>
                <div className="text-xl font-bold text-emerald-400">{analytics?.achieved.interestedLeads || 0}</div>
              </div>
              <div className="text-center border-l border-white/20 pl-6">
                <div className="text-xs text-slate-300">Revenue Generated</div>
                <div className="text-xl font-bold text-blue-400">
                  ₹{(analytics?.achieved.revenue || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${campaignInfo.progressPercentage}%` }}
            />
          </div>
        </Card>
      )}

      {/* MAIN WORKFLOW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CURRENT LEAD CARD & WORKFLOW */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="CURRENT ACTIVE LEAD"
            subtitle="Complete current lead response to unlock the next sequential lead in campaign."
            action={
              activeLead && (
                <Badge variant={activeLead.status === 'RESPONSE_PENDING' ? 'warning' : 'primary'}>
                  {activeLead.status === 'RESPONSE_PENDING' ? 'RESPONSE PENDING' : `Lead #${String(activeLead.sequenceNumber).padStart(3, '0')}`}
                </Badge>
              )
            }
          >
            {!activeLead ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">All Leads Completed!</h3>
                <p className="text-xs text-slate-500 mt-1">You have processed all assigned leads in the current campaign.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Lead Details Card */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                        Sequence #{String(activeLead.sequenceNumber).padStart(3, '0')}
                      </span>
                      <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">{activeLead.businessName}</h2>
                      <p className="text-xs text-slate-500">{activeLead.city || 'India'}, {activeLead.state || ''}</p>
                    </div>

                    {/* PHONE CALL ACTION BUTTON */}
                    <button
                      onClick={handleCallClick}
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all shrink-0"
                    >
                      <Phone className="w-5 h-5 fill-current" />
                      <span>CALL: {activeLead.phone}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-4 border-t border-slate-200">
                    <div>
                      <span className="text-slate-400 block">Phone Number</span>
                      <span className="font-semibold text-slate-800 text-sm">{activeLead.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Email Address</span>
                      <span className="font-medium text-slate-700">{activeLead.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* CALL MADE CONFIRMATION OR RESPONSE FORM */}
                {!showResponseForm ? (
                  <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Did you call the customer on your phone?</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        After talking to customer on your phone, click Call Made to enter response.
                      </p>
                    </div>

                    <Button
                      onClick={handleMarkCallMade}
                      loading={markingCallMade}
                      className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                      icon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      CALL MADE
                    </Button>
                  </div>
                ) : (
                  /* RESPONSE FORM */
                  <form onSubmit={handleSaveResponse} className="p-6 bg-white border border-blue-200 rounded-2xl space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        Record Customer Response for Lead #{activeLead.sequenceNumber}
                      </h4>
                      <Badge variant="warning">Response Pending</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Response Outcome</label>
                        <select
                          value={outcome}
                          onChange={(e) => setOutcome(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                        >
                          <option value="INTERESTED">Interested (Potential Prospect)</option>
                          <option value="FOLLOW_UP_REQUIRED">Follow-up Required</option>
                          <option value="NOT_INTERESTED">Not Interested</option>
                          <option value="CLOSED">Deal Closed (Revenue Generated)</option>
                          <option value="CALL_BACK_LATER">Call Back Later</option>
                          <option value="NO_ANSWER">No Answer / Busy</option>
                          <option value="WRONG_NUMBER">Wrong Number</option>
                        </select>
                      </div>

                      {outcome === 'CLOSED' || outcome === 'INTERESTED' ? (
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Deal / Revenue Value (₹)</label>
                          <input
                            type="number"
                            placeholder="e.g. 150000"
                            value={dealValue}
                            onChange={(e) => setDealValue(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Customer Response Notes (Required)</label>
                      <textarea
                        required
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Detail what the customer said (e.g. Asked for quotation, interested in cloud ERP migration)..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Follow-up Required Toggle */}
                    {(outcome === 'FOLLOW_UP_REQUIRED' || outcome === 'CALL_BACK_LATER' || followUpRequired) && (
                      <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3">
                        <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-amber-600" />
                          Follow-up Schedule
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Follow-up Date</label>
                            <input
                              type="date"
                              required={outcome === 'FOLLOW_UP_REQUIRED'}
                              value={followUpDate}
                              onChange={(e) => setFollowUpDate(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Follow-up Reminder Note</label>
                            <input
                              type="text"
                              placeholder="e.g. Call back after 11 AM"
                              value={followUpNote}
                              onChange={(e) => setFollowUpNote(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <Button type="submit" loading={submitting} icon={<Send className="w-4 h-4" />}>
                        SAVE RESPONSE & UNLOCK NEXT LEAD
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </Card>

          {/* UPCOMING LOCKED QUEUE */}
          <Card title="Upcoming Sequential Queue">
            {lockedQueue.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No upcoming leads in queue.</p>
            ) : (
              <div className="space-y-2">
                {lockedQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-between text-xs text-slate-600"
                  >
                    <div className="flex items-center gap-2 font-medium">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Complete Lead #{activeLead?.sequenceNumber || 1} first
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* SIDEBAR: RECENTLY COMPLETED & FUNNEL SUMMARY */}
        <div className="space-y-6">
          <Card title="Recently Completed Leads">
            {completedLeads.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No completed leads yet today.</p>
            ) : (
              <div className="space-y-2.5">
                {completedLeads.map((item) => (
                  <div key={item.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-900">
                        ✓ #{String(item.sequenceNumber).padStart(3, '0')} {item.businessName}
                      </span>
                      <Badge variant={item.outcome === 'INTERESTED' ? 'success' : 'neutral'}>
                        {item.outcome?.replace(/_/g, ' ') || 'Completed'}
                      </Badge>
                    </div>
                    {item.responses?.[0]?.notes && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 bg-slate-50 p-2 rounded">
                        "{item.responses[0].notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Response Breakdown Summary */}
          <Card title="Response Outcome Totals">
            <div className="space-y-2">
              {analytics?.statusBreakdown.map((item) => (
                <div key={item.status} className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 text-xs">
                  <span className="font-medium text-slate-700">{item.status.replace(/_/g, ' ')}</span>
                  <span className="font-bold text-blue-600">{item.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};
