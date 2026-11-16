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
  PhoneCall,
  ArrowRight,
  Search,
  RotateCcw,
  Building,
  MapPin,
  Mail,
  User,
  DollarSign,
  Check,
} from 'lucide-react';
import { api } from '../lib/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Lead, MarketingAnalytics } from '../types';
import { TargetReminderModal } from '../components/marketing/TargetReminderModal';

export const MarketingDashboard: React.FC = () => {
  const [activeLead, setActiveLead] = useState<any | null>(null);
  const [completedLeads, setCompletedLeads] = useState<any[]>([]);
  const [lockedQueue, setLockedQueue] = useState<any[]>([]);
  const [pendingLeads, setPendingLeads] = useState<any[]>([]);
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
  const [markingLater, setMarkingLater] = useState(false);

  // Outcome Details Modal State
  const [selectedOutcomeForModal, setSelectedOutcomeForModal] = useState<string | null>(null);
  const [outcomeModalLeads, setOutcomeModalLeads] = useState<any[]>([]);
  const [outcomeModalLoading, setOutcomeModalLoading] = useState(false);
  const [outcomeSearchQuery, setOutcomeSearchQuery] = useState('');
  const [callingAgainId, setCallingAgainId] = useState<string | null>(null);

  const fetchMarketingData = async (targetLeadId?: string) => {
    try {
      // 1. Check if user was previously on a specific lead (stored in localStorage)
      const storedLeadId = targetLeadId || localStorage.getItem('blunet_active_lead_id') || undefined;

      const [leadRes, queueRes, completedRes, analyticsRes] = await Promise.all([
        api.get('/leads/active', { params: storedLeadId ? { leadId: storedLeadId } : {} }),
        api.get('/leads/queue?limit=15'),
        api.get('/leads/completed?limit=10'),
        api.get('/marketing/analytics'),
      ]);

      if (leadRes.data.success) {
        const leadData = leadRes.data.data.activeLead;
        setActiveLead(leadData);
        if (leadData) {
          localStorage.setItem('blunet_active_lead_id', leadData.id);
        }
        setPendingLeads(leadRes.data.data.pendingLeads || []);
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

  const handleSelectLead = async (leadId: string) => {
    localStorage.setItem('blunet_active_lead_id', leadId);
    await fetchMarketingData(leadId);
  };

  // Option 1: Mark Call Made & Enter Notes immediately
  const handleMarkCallMade = async () => {
    if (!activeLead) return;
    setMarkingCallMade(true);

    try {
      const res = await api.post(`/leads/${activeLead.id}/call-made`);
      if (res.data.success) {
        setShowResponseForm(true);
        fetchMarketingData(activeLead.id);
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to confirm call made.');
    } finally {
      setMarkingCallMade(false);
    }
  };

  // Option 2: Mark Call Made & Advance to Next Lead (Mark response notes later)
  const handleMarkCallMadeAndNext = async () => {
    if (!activeLead) return;
    setMarkingLater(true);

    try {
      const res = await api.post(`/leads/${activeLead.id}/mark-later`);
      if (res.data.success) {
        if (res.data.data.nextLead) {
          const nextLeadId = res.data.data.nextLead.id;
          localStorage.setItem('blunet_active_lead_id', nextLeadId);
          await fetchMarketingData(nextLeadId);
        } else {
          await fetchMarketingData();
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to move to next lead.');
    } finally {
      setMarkingLater(false);
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

        // Advance to next lead in localStorage so page refresh stays on the new lead!
        if (res.data.data.nextLeadId) {
          localStorage.setItem('blunet_active_lead_id', res.data.data.nextLeadId);
          await fetchMarketingData(res.data.data.nextLeadId);
        } else {
          localStorage.removeItem('blunet_active_lead_id');
          await fetchMarketingData();
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to save customer response.');
    } finally {
      setSubmitting(false);
    }
  };

  // Clickable Outcome Handlers
  const handleOpenOutcomeModal = async (outcomeStatus: string) => {
    setSelectedOutcomeForModal(outcomeStatus);
    setOutcomeModalLoading(true);
    setOutcomeSearchQuery('');

    try {
      const res = await api.get(`/leads/outcome/${outcomeStatus}`);
      if (res.data.success) {
        setOutcomeModalLeads(res.data.data.leads || []);
      }
    } catch (err) {
      console.error('Failed to load outcome leads:', err);
      // Fallback from loaded completed leads
      const localFiltered = completedLeads.filter((l) => l.outcome === outcomeStatus);
      setOutcomeModalLeads(localFiltered);
    } finally {
      setOutcomeModalLoading(false);
    }
  };

  const handleCallAgain = async (lead: any) => {
    setCallingAgainId(lead.id);
    try {
      await api.post(`/leads/${lead.id}/call-again`);
      localStorage.setItem('blunet_active_lead_id', lead.id);
      setSelectedOutcomeForModal(null);
      await fetchMarketingData(lead.id);
      window.location.href = `tel:${lead.phone.replace(/\s+/g, '')}`;
    } catch (err: any) {
      console.error('Call again failed:', err);
      localStorage.setItem('blunet_active_lead_id', lead.id);
      setActiveLead({ ...lead, status: 'RESPONSE_PENDING' });
      setShowResponseForm(true);
      setSelectedOutcomeForModal(null);
      window.location.href = `tel:${lead.phone.replace(/\s+/g, '')}`;
    } finally {
      setCallingAgainId(null);
    }
  };

  const getOutcomeBadgeVariant = (out: string): 'success' | 'warning' | 'primary' | 'neutral' => {
    switch (out) {
      case 'INTERESTED':
        return 'success';
      case 'FOLLOW_UP_REQUIRED':
      case 'CALL_BACK_LATER':
        return 'warning';
      case 'CLOSED':
        return 'primary';
      default:
        return 'neutral';
    }
  };

  const filteredOutcomeLeads = outcomeModalLeads.filter((l) => {
    const q = outcomeSearchQuery.toLowerCase();
    return (
      l.businessName?.toLowerCase().includes(q) ||
      l.phone?.toLowerCase().includes(q) ||
      l.city?.toLowerCase().includes(q) ||
      l.responses?.[0]?.notes?.toLowerCase().includes(q)
    );
  });

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

      {/* PENDING RESPONSES QUICK BAR (when caller chose 'Mark Later') */}
      {pendingLeads.length > 0 && (
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-xs font-bold text-amber-900">
                {pendingLeads.length} Lead{pendingLeads.length > 1 ? 's' : ''} Called — Awaiting Response Notes
              </span>
            </div>
            <span className="text-[11px] text-amber-700 font-medium">Click any lead below to record its notes:</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {pendingLeads.map((p) => {
              const isCurrent = activeLead?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectLead(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                    isCurrent
                      ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400'
                      : 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/80'
                  }`}
                >
                  <span className="font-mono text-[11px]">#{String(p.sequenceNumber).padStart(3, '0')}</span>
                  <span>{p.businessName}</span>
                  <FileText className="w-3.5 h-3.5 opacity-80" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MAIN WORKFLOW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CURRENT LEAD CARD & WORKFLOW */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="CURRENT ACTIVE LEAD"
            subtitle="Complete current lead response or move to next number and record notes later."
            action={
              activeLead && (
                <div className="flex items-center gap-2">
                  <Badge variant={activeLead.status === 'RESPONSE_PENDING' ? 'warning' : 'primary'}>
                    {activeLead.status === 'RESPONSE_PENDING' ? 'RESPONSE PENDING' : `Lead #${String(activeLead.sequenceNumber).padStart(3, '0')}`}
                  </Badge>
                  {activeLead.outcome && (
                    <Badge variant={getOutcomeBadgeVariant(activeLead.outcome)}>
                      {activeLead.outcome.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>
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
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
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

                  {/* Previous Notes Box if lead was called before */}
                  {activeLead.responses && activeLead.responses.length > 0 && (
                    <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Previous Call History ({activeLead.responses.length} recorded)
                      </span>
                      <p className="text-slate-700 italic">"{activeLead.responses[0].notes}"</p>
                      {activeLead.responses[0].followUpDate && (
                        <div className="mt-1.5 flex items-center gap-2 text-amber-700 text-[11px] font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Follow-up: {new Date(activeLead.responses[0].followUpDate).toLocaleDateString()}</span>
                          {activeLead.responses[0].followUpNote && (
                            <span>— {activeLead.responses[0].followUpNote}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* CALL MADE CONFIRMATION OR RESPONSE FORM */}
                {!showResponseForm ? (
                  <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Did you call the customer on your phone?</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Choose whether to record response notes immediately, or advance to the next number and mark notes later.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto shrink-0">
                      <Button
                        onClick={handleMarkCallMadeAndNext}
                        loading={markingLater}
                        variant="outline"
                        className="w-full sm:w-auto px-4 py-2.5 text-xs text-slate-700 hover:text-blue-700 hover:border-blue-300"
                        icon={<ArrowRight className="w-4 h-4" />}
                      >
                        CALL NEXT (MARK LATER)
                      </Button>
                      <Button
                        onClick={handleMarkCallMade}
                        loading={markingCallMade}
                        className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                        icon={<CheckCircle2 className="w-4 h-4" />}
                      >
                        RECORD RESPONSE NOW
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* RESPONSE FORM */
                  <form onSubmit={handleSaveResponse} className="p-6 bg-white border border-blue-200 rounded-2xl space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        Record Customer Response for Lead #{activeLead.sequenceNumber} ({activeLead.businessName})
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

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleMarkCallMadeAndNext}
                        loading={markingLater}
                        className="text-xs text-slate-600 hover:text-blue-600"
                        icon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        Mark Notes Later & Go to Next Number
                      </Button>

                      <Button type="submit" loading={submitting} icon={<Send className="w-4 h-4" />}>
                        SAVE RESPONSE & UNLOCK NEXT LEAD
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </Card>

          {/* UPCOMING SEQUENTIAL QUEUE & NAVIGATOR */}
          <Card title="Sequential Queue & Lead Progress" subtitle="Click any unlocked lead to switch active dialer">
            {lockedQueue.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No upcoming leads in queue.</p>
            ) : (
              <div className="space-y-2">
                {lockedQueue.map((item) => {
                  const isCurrent = activeLead?.id === item.id;
                  const isLocked = item.status === 'LOCKED';
                  return (
                    <div
                      key={item.id}
                      onClick={() => !isLocked && handleSelectLead(item.id)}
                      className={`p-3 rounded-xl flex items-center justify-between text-xs transition-all ${
                        isLocked
                          ? 'bg-slate-50 border border-dashed border-slate-300 text-slate-400 cursor-not-allowed'
                          : isCurrent
                          ? 'bg-blue-50/80 border border-blue-400 text-blue-900 font-semibold ring-1 ring-blue-400/50 cursor-pointer'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50/70 cursor-pointer shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-medium">
                        {isLocked ? (
                          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : item.status === 'RESPONSE_PENDING' ? (
                          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                        ) : item.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                        )}
                        <span>{item.label}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-100/70 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                        {isLocked ? (
                          <span className="text-[10px] text-slate-400 font-mono">Locked</span>
                        ) : (
                          <span className="text-[10px] text-blue-600 font-medium hover:underline">
                            {isCurrent ? '' : 'Select Lead →'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* SIDEBAR: RECENTLY COMPLETED & CLICKABLE OUTCOME TOTALS */}
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
                      <Badge variant={getOutcomeBadgeVariant(item.outcome)}>
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

          {/* RESPONSE OUTCOME TOTALS (CLICKABLE CARDS MATCHING SCREENSHOT) */}
          <Card
            title="Response Outcome Totals"
            subtitle="Click any category to view leads and call again"
          >
            <div className="space-y-2">
              {analytics?.statusBreakdown.map((item) => (
                <button
                  key={item.status}
                  type="button"
                  onClick={() => handleOpenOutcomeModal(item.status)}
                  className="w-full flex justify-between items-center p-3 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/70 hover:border-blue-300 transition-all text-xs group cursor-pointer text-left shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-full text-[11px]">
                      {item.count}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

      </div>

      {/* OUTCOME LEADS DETAILS & CALL AGAIN MODAL */}
      <Modal
        isOpen={!!selectedOutcomeForModal}
        onClose={() => setSelectedOutcomeForModal(null)}
        title={`${selectedOutcomeForModal?.replace(/_/g, ' ')} Leads (${outcomeModalLeads.length})`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Click <strong className="text-slate-800">Call Again</strong> on any lead to load them into the dialer and record an updated follow-up response.
          </p>

          {/* Search bar inside modal */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by business name, phone, city, notes..."
              value={outcomeSearchQuery}
              onChange={(e) => setOutcomeSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {outcomeModalLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading leads...</div>
          ) : filteredOutcomeLeads.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl">
              <p className="text-xs text-slate-500">No leads recorded under this outcome category yet.</p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
              {filteredOutcomeLeads.map((lead) => {
                const latestResponse = lead.responses?.[0];
                return (
                  <div
                    key={lead.id}
                    className="p-4 bg-white border border-slate-200 hover:border-blue-300 rounded-2xl space-y-3 shadow-2xs transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            #{String(lead.sequenceNumber).padStart(3, '0')}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{lead.businessName}</h4>
                          <Badge variant={getOutcomeBadgeVariant(lead.outcome)}>
                            {lead.outcome?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5">
                          <span className="font-semibold text-slate-800">{lead.phone}</span>
                          {lead.email && <span>{lead.email}</span>}
                          {(lead.city || lead.state) && (
                            <span>{lead.city || ''}{lead.city && lead.state ? ', ' : ''}{lead.state || ''}</span>
                          )}
                        </div>
                      </div>

                      {/* CALL AGAIN BUTTON */}
                      <Button
                        size="sm"
                        variant="primary"
                        loading={callingAgainId === lead.id}
                        onClick={() => handleCallAgain(lead)}
                        icon={<PhoneCall className="w-3.5 h-3.5" />}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow-xs cursor-pointer text-xs"
                      >
                        Call Again
                      </Button>
                    </div>

                    {/* Response details */}
                    {latestResponse && (
                      <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-100">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          <span>Recorded Notes</span>
                          {latestResponse.createdAt && (
                            <span>{new Date(latestResponse.createdAt).toLocaleDateString()}</span>
                          )}
                        </div>
                        <p className="text-slate-700 italic">"{latestResponse.notes}"</p>

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                          {latestResponse.followUpDate && (
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                              <Calendar className="w-3 h-3" />
                              Follow-up: {new Date(latestResponse.followUpDate).toLocaleDateString()}
                              {latestResponse.followUpNote ? ` (${latestResponse.followUpNote})` : ''}
                            </span>
                          )}

                          {latestResponse.dealValue > 0 && (
                            <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                              <DollarSign className="w-3 h-3" />
                              Deal Value: ₹{latestResponse.dealValue.toLocaleString('en-IN')}
                            </span>
                          )}

                          {latestResponse.user?.name && (
                            <span className="text-slate-400 ml-auto">
                              Caller: {latestResponse.user.name}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* TARGET REMINDER SYSTEM */}
      <TargetReminderModal />
    </div>
  );
};
