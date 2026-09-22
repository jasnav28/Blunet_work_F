import React, { useState, useEffect, useRef } from 'react';
import { Users, UserPlus, Trash2, PhoneCall, Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, BarChart2, Eye, TrendingUp, Target, Award } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { api } from '../lib/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { UserProfile } from '../types';
import { IndividualPerformanceModal } from '../components/marketing/IndividualPerformanceModal';

export const MarketingTeamPage: React.FC = () => {
  const [marketingMembers, setMarketingMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerformanceId, setSelectedPerformanceId] = useState<string | null>(null);

  // Team Performance & Period Filter State
  const [period, setPeriod] = useState<'today' | 'this_week' | 'this_month' | 'prev_month'>('this_month');
  const [teamPerf, setTeamPerf] = useState<any>(null);
  const [perfLoading, setPerfLoading] = useState(true);

  // Independent Graph Modes: Calls graph defaults to Daily (Day), Deals graph defaults to Monthly (Month)
  const [callGraphMode, setCallGraphMode] = useState<'daily' | 'monthly'>('daily');
  const [dealGraphMode, setDealGraphMode] = useState<'monthly' | 'daily'>('monthly');

  // Add Marketing Member Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('Marketing Executive');
  const [temporaryPassword, setTemporaryPassword] = useState('Password123!');
  const [creating, setCreating] = useState(false);

  // Delete Member Modal
  const [selectedForDelete, setSelectedForDelete] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Lead File Importer State
  const [file, setFile] = useState<File | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<any | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setPreview(null);
      setImportMsg('');
    }
  };

  const isAnvi = window.location.pathname.startsWith('/8328246413');
  const targetOrg = isAnvi ? 'ANVI' : 'BLUNET';

  const fetchMarketingTeam = async () => {
    try {
      const res = await api.get(`/marketing/team?org=${targetOrg}`);
      if (res.data.success) {
        setMarketingMembers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load marketing team summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamPerformance = async () => {
    try {
      setPerfLoading(true);
      const res = await api.get(`/marketing/team/performance?period=${period}&org=${targetOrg}`);
      if (res.data.success) {
        setTeamPerf(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch team performance overview:', err);
    } finally {
      setPerfLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketingTeam();
  }, []);

  useEffect(() => {
    fetchTeamPerformance();
  }, [period]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      await api.post('/employees', {
        name,
        email,
        phone,
        role: 'MARKETING_HEAD',
        designation,
        temporaryPassword,
        organization: targetOrg,
      });

      setIsAddOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      fetchMarketingTeam();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to add marketing team member.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedForDelete) return;
    setDeleting(true);

    try {
      const res = await api.delete(`/employees/${selectedForDelete.id}`);
      if (res.data.success) {
        setSelectedForDelete(null);
        fetchMarketingTeam();
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete marketing team member.');
    } finally {
      setDeleting(false);
    }
  };

  const handleAnalyzeFile = async () => {
    if (!file) return;
    setAnalyzing(true);
    setImportMsg('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/leads/import/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setPreview(res.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to parse lead contact file.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!preview || preview.validLeads.length === 0) return;
    setImporting(true);

    try {
      const res = await api.post('/leads/import/confirm', {
        campaignName: campaignName || file?.name.replace(/\.[^/.]+$/, '') || `${targetOrg} Campaign`,
        leads: preview.validLeads,
        organization: targetOrg,
      });

      if (res.data.success) {
        setImportMsg(res.data.message);
        setPreview(null);
        setFile(null);
        setCampaignName('');
        fetchMarketingTeam();
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to import lead contacts.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Marketing Team & Individual Performance</h1>
          <p className="text-xs text-slate-500">Manage marketing team members, inspect isolated employee performance data, and upload lead files</p>
        </div>

        <Button onClick={() => setIsAddOpen(true)} icon={<UserPlus className="w-4 h-4" />}>
          Add Marketing Member
        </Button>
      </div>

      {/* PERIOD SELECTOR & OVERALL TEAM KPI SECTION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              Overall Team Performance & Target Overview
            </h2>
            <p className="text-xs text-slate-500">Real-time team aggregate performance and individual targets</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: 'this_week', label: 'This Week' },
                { id: 'this_month', label: 'This Month' },
                { id: 'prev_month', label: 'Previous Month' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  period === p.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* TEAM TOP KPI CARDS */}
        {teamPerf?.team && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                <span>Total Active Staff</span>
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{teamPerf.team.totalMembers}</div>
              <div className="text-[11px] text-slate-500">Isolated Marketing Workspaces</div>
            </div>

            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
              <div className="flex justify-between items-center text-xs text-blue-800 font-medium">
                <span>Calls Completed vs Target</span>
                <PhoneCall className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-950">
                {teamPerf.team.callsCompleted} <span className="text-xs text-blue-700 font-normal">/ {teamPerf.team.callTarget}</span>
              </div>
              <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, teamPerf.team.callProgress)}%` }}
                />
              </div>
              <div className="text-[11px] text-blue-700 font-semibold pt-0.5">{teamPerf.team.callProgress}% Call Target Achieved</div>
            </div>

            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
              <div className="flex justify-between items-center text-xs text-emerald-800 font-medium">
                <span>Total Deals Closed</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-950">
                {teamPerf.team.dealsClosed} <span className="text-xs text-emerald-700 font-normal">/ {teamPerf.team.dealTarget}</span>
              </div>
              <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, teamPerf.team.dealProgress)}%` }}
                />
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold pt-0.5">
                {teamPerf.team.dealsAboveTarget > 0 ? `+${teamPerf.team.dealsAboveTarget} above target!` : `${teamPerf.team.dealProgress}% Deal Target`}
              </div>
            </div>

            <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1">
              <div className="flex justify-between items-center text-xs text-purple-800 font-medium">
                <span>Team Goal Status</span>
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-xl font-extrabold text-purple-950 mt-1">
                {teamPerf.team.isDealTargetAchieved ? '🎯 Target Surpassed' : `${teamPerf.team.dealProgress}% Achieved`}
              </div>
              <p className="text-[11px] text-purple-700 mt-1">
                {teamPerf.team.dealsClosed >= teamPerf.team.dealTarget
                  ? 'Excellent team closing rate!'
                  : `${Math.max(0, teamPerf.team.dealTarget - teamPerf.team.dealsClosed)} deals remaining to hit target`}
              </p>
            </div>
          </div>
        )}

        {/* PERFORMANCE GRAPHS */}
        {teamPerf?.members && teamPerf.members.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Calls Completed vs Target Chart (DAILY / DAY PERIOD BY DEFAULT) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Calls Completed vs Target per Member
                  </h3>
                  <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                    PERIOD: {callGraphMode === 'daily' ? 'TODAY (DAILY TARGET)' : 'THIS MONTH (MONTHLY TARGET)'}
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg">
                  <button
                    onClick={() => setCallGraphMode('daily')}
                    className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${
                      callGraphMode === 'daily' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Today (Daily)
                  </button>
                  <button
                    onClick={() => setCallGraphMode('monthly')}
                    className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${
                      callGraphMode === 'monthly' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamPerf.members} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar
                      dataKey={callGraphMode === 'daily' ? 'todayCalls' : 'callsCompleted'}
                      name={callGraphMode === 'daily' ? 'Calls Completed Today' : 'Calls Completed'}
                      fill="#2563eb"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey={callGraphMode === 'daily' ? 'dailyCallTarget' : 'callTarget'}
                      name={callGraphMode === 'daily' ? 'Daily Call Target (20)' : 'Monthly Call Target'}
                      fill="#94a3b8"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Deals Closed vs Target Chart (MONTHLY / MONTH PERIOD BY DEFAULT) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Deals Closed vs Target per Member
                  </h3>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                    PERIOD: {dealGraphMode === 'monthly' ? 'THIS MONTH (MONTHLY TARGET)' : 'TODAY (DAILY)'}
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg">
                  <button
                    onClick={() => setDealGraphMode('monthly')}
                    className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${
                      dealGraphMode === 'monthly' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => setDealGraphMode('daily')}
                    className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${
                      dealGraphMode === 'daily' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Today
                  </button>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamPerf.members} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar
                      dataKey={dealGraphMode === 'monthly' ? 'monthDeals' : 'dealsClosed'}
                      name={dealGraphMode === 'monthly' ? 'Deals Closed This Month' : 'Deals Closed Today'}
                      fill="#059669"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey={dealGraphMode === 'monthly' ? 'monthlyDealTarget' : 'dealTarget'}
                      name={dealGraphMode === 'monthly' ? 'Monthly Deal Target (7)' : 'Target'}
                      fill="#cbd5e1"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MARKETING TEAM MEMBER CARDS & PERFORMANCE SUMMARY */}
      <Card title={`Marketing Team Members (${marketingMembers.length} Active Staff)`}>
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading marketing team workspace...</div>
        ) : marketingMembers.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No marketing members registered.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketingMembers.map((member) => (
              <div
                key={member.id}
                className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-400 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded-full">
                        {member.employeeId}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{member.name}</h3>
                      <p className="text-xs text-slate-500">{member.designation} • {member.email}</p>
                    </div>
                    <Badge variant={member.isActive ? 'success' : 'neutral'}>
                      {member.isActive ? 'Active' : 'Deactivated'}
                    </Badge>
                  </div>

                  {/* Summary Metric Rows */}
                  <div className="grid grid-cols-3 gap-2 py-3 bg-slate-50 rounded-xl px-3 border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium uppercase">Calls Today</span>
                      <span className="font-bold text-slate-900 text-sm">{member.todayCalls || 0} / {member.dailyLeadTarget || 20}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium uppercase">Monthly Deals</span>
                      <span className="font-bold text-emerald-700 text-sm">{member.monthlyDeals || 0} / {member.monthlyDealTarget || 7}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium uppercase">Leads Queue</span>
                      <span className="font-bold text-blue-700 text-sm">{member.assignedLeads || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedPerformanceId(member.id)}
                    icon={<Eye className="w-3.5 h-3.5 text-blue-600" />}
                  >
                    VIEW PERFORMANCE
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setSelectedForDelete(member)}
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* EXCEL / CSV / PDF LEAD FILE UPLOADER */}
      <Card title="Upload Lead File (Excel / CSV / PDF)">
        {importMsg && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium text-sm">{importMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed transition-colors rounded-xl p-8 text-center cursor-pointer ${
              isDragging ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-500 bg-slate-50/50'
            }`}
          >
            <Upload className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-800">
              Drag & Drop Excel / CSV / PDF lead file here, or click to browse
            </p>
            <p className="text-xs text-slate-400 mt-1">Supports Excel (.xlsx, .xls), CSV, or PDF with business names & contact numbers</p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,application/pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                  setPreview(null);
                  setImportMsg('');
                }
              }}
              className="hidden"
            />
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Choose Excel / File
              </Button>
            </div>
          </div>

          {file && (
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="text-sm font-bold text-slate-900">{file.name}</div>
                  <div className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>

              <Button onClick={handleAnalyzeFile} loading={analyzing}>
                Parse Contact Leads
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* PREVIEW & CONFIRM IMPORT */}
      {preview && (
        <Card title="Lead Contacts Import Preview">
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-slate-50 border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Leads Detected</div>
                <div className="text-2xl font-bold text-slate-900">{preview.detected}</div>
              </Card>
              <Card className="bg-emerald-50 border-emerald-200">
                <div className="text-xs text-emerald-700 font-medium">Valid Leads</div>
                <div className="text-2xl font-bold text-emerald-800">{preview.validCount}</div>
              </Card>
              <Card className="bg-amber-50 border-amber-200">
                <div className="text-xs text-amber-700 font-medium">Duplicates Filtered</div>
                <div className="text-2xl font-bold text-amber-800">{preview.duplicateCount}</div>
              </Card>
              <Card className="bg-rose-50 border-rose-200">
                <div className="text-xs text-rose-700 font-medium">Invalid Records</div>
                <div className="text-2xl font-bold text-rose-800">{preview.invalidCount}</div>
              </Card>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Campaign Title</label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g. September Enterprise PDF Leads"
                className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setPreview(null)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmImport} loading={importing} icon={<ArrowRight className="w-4 h-4" />}>
                Confirm Import of {preview.validCount} Valid Contact Leads
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ADD MARKETING MEMBER MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Marketing Team Member"
        maxWidth="md"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Sneha Patel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="sneha@blunet.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Designation</label>
            <input
              type="text"
              required
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Initial Password</label>
            <input
              type="text"
              required
              value={temporaryPassword}
              onChange={(e) => setTemporaryPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={creating}>
              Add Marketing Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE MEMBER MODAL */}
      {selectedForDelete && (
        <Modal
          isOpen={!!selectedForDelete}
          onClose={() => setSelectedForDelete(null)}
          title="Confirm Delete Marketing Member"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>
                Are you sure you want to delete marketing team member <strong>{selectedForDelete.name}</strong> ({selectedForDelete.employeeId})?
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setSelectedForDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteMember} loading={deleting}>
                Delete Marketing Member
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* INDIVIDUAL EMPLOYEE PERFORMANCE MODAL */}
      <IndividualPerformanceModal
        employeeId={selectedPerformanceId}
        onClose={() => setSelectedPerformanceId(null)}
      />
    </div>
  );
};
