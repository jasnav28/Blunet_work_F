import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Calendar,
  Edit2,
  X,
  Award,
  BarChart2,
  Building2,
  FileCheck,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface IndividualPerformanceModalProps {
  employeeId: string | null;
  onClose: () => void;
}

export const IndividualPerformanceModal: React.FC<IndividualPerformanceModalProps> = ({
  employeeId,
  onClose,
}) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  // Edit Targets Modal State
  const [isEditingTargets, setIsEditingTargets] = useState(false);
  const [dailyLeadTarget, setDailyLeadTarget] = useState('20');
  const [monthlyDealTarget, setMonthlyDealTarget] = useState('7');
  const [savingTargets, setSavingTargets] = useState(false);

  const fetchPerformance = async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const res = await api.get(`/marketing/team/${employeeId}/performance?month=${month}&year=${year}`);
      if (res.data.success) {
        setData(res.data.data);
        setDailyLeadTarget(String(res.data.data.targets?.dailyLeadTarget || 20));
        setMonthlyDealTarget(String(res.data.data.targets?.monthlyDealTarget || 7));
      }
    } catch (err) {
      console.error('Failed to load employee performance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchPerformance();
    }
  }, [employeeId, month, year]);

  const handleSaveTargets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;
    setSavingTargets(true);

    try {
      const res = await api.post(`/marketing/team/${employeeId}/targets`, {
        month,
        year,
        dailyLeadTarget: parseInt(dailyLeadTarget, 10),
        monthlyDealTarget: parseInt(monthlyDealTarget, 10),
      });

      if (res.data.success) {
        setIsEditingTargets(false);
        fetchPerformance();
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update employee targets.');
    } finally {
      setSavingTargets(false);
    }
  };

  if (!employeeId) return null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <Modal isOpen={!!employeeId} onClose={onClose} title="Individual Marketing Performance" maxWidth="2xl">
      <div className="space-y-6 max-h-[85vh] overflow-y-auto pr-1">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[11px] font-mono font-bold">
                {data?.employee?.employeeId || employeeId}
              </span>
              <Badge variant={data?.employee?.organization === 'ANVI' ? 'warning' : 'info'}>
                {data?.employee?.organization || 'BLUNET'}
              </Badge>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">{data?.employee?.name || 'Loading Employee...'}</h2>
            <p className="text-xs text-slate-500">{data?.employee?.designation} • {data?.employee?.email}</p>
          </div>

          {/* Month / Year Selector & Edit Target Button */}
          <div className="flex items-center gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            >
              {monthNames.map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditingTargets(true)}
              icon={<Edit2 className="w-3.5 h-3.5" />}
            >
              Edit Targets
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500">Loading isolated employee workspace performance data...</p>
          </div>
        ) : (
          <>
            {/* KPI METRICS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-slate-50 border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Calls Completed</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{data?.month?.callsCompleted || 0}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">In {monthNames[month - 1]} {year}</div>
              </Card>

              <Card className="bg-emerald-50 border-emerald-200">
                <div className="text-xs text-emerald-700 font-medium">Deals Closed (WON)</div>
                <div className="text-2xl font-bold text-emerald-800 mt-1">
                  {data?.month?.dealsClosed || 0} <span className="text-xs font-semibold text-emerald-600">/ {data?.targets?.monthlyDealTarget || 7}</span>
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  {data?.month?.remainingDeals > 0 ? `${data.month.remainingDeals} deals remaining` : '✓ Target Achieved!'}
                </div>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <div className="text-xs text-blue-700 font-medium">Assigned Leads</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">{data?.month?.leadsAssigned || 0}</div>
                <div className="text-[11px] text-blue-600 mt-0.5">Active assigned queue</div>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <div className="text-xs text-purple-700 font-medium">Conversion Rate</div>
                <div className="text-2xl font-bold text-purple-900 mt-1">{data?.month?.conversionRate || 0}%</div>
                <div className="text-[11px] text-purple-600 mt-0.5">Closed Deals / Completed Calls</div>
              </Card>
            </div>

            {/* TARGET PROGRESS BARS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* TODAY'S CALLING TARGET CARD */}
              <Card
                title="TODAY'S CALLING TARGET"
                subtitle={`Daily lead calling goal: ${data?.targets?.dailyLeadTarget || 20} calls/day`}
                action={
                  <Badge variant={data?.today?.isCompleted ? 'success' : 'warning'}>
                    {data?.today?.isCompleted ? 'Target Completed' : `${data?.today?.remainingCalls || 0} remaining`}
                  </Badge>
                }
              >
                <div className="space-y-3 pt-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {data?.today?.callsCompleted || 0} <span className="text-sm font-semibold text-slate-400">/ {data?.targets?.dailyLeadTarget || 20} Calls</span>
                    </span>
                    <span className="text-sm font-bold text-blue-600">{data?.today?.progressPercentage || 0}%</span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${data?.today?.progressPercentage || 0}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-500">
                    {data?.today?.isCompleted
                      ? '✓ Great job! Today\'s 20-lead calling target has been fully completed.'
                      : `Requires ${data?.today?.remainingCalls || 0} more completed calls today to achieve daily target.`}
                  </p>
                </div>
              </Card>

              {/* MONTHLY CLOSED PROJECT TARGET CARD */}
              <Card
                title="MONTHLY PROJECT CLOSING TARGET"
                subtitle={`Monthly successful project goal: minimum ${data?.targets?.monthlyDealTarget || 7} closed deals`}
                action={
                  <Badge variant={data?.month?.isAchieved ? 'success' : 'primary'}>
                    {data?.month?.isAchieved ? 'Monthly Target Achieved' : `${data?.month?.remainingDeals || 0} deals to target`}
                  </Badge>
                }
              >
                <div className="space-y-3 pt-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {data?.month?.dealsClosed || 0} <span className="text-sm font-semibold text-slate-400">/ {data?.targets?.monthlyDealTarget || 7} Projects</span>
                    </span>
                    <span className="text-sm font-bold text-emerald-600">{data?.month?.progressPercentage || 0}%</span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${data?.month?.progressPercentage || 0}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-500">
                    {data?.month?.isAchieved
                      ? '✓ Monthly target achieved! Minimum 7 closed projects milestone reached.'
                      : `Requires ${data?.month?.remainingDeals || 0} more CLOSED/WON deals this month to reach target.`}
                  </p>
                </div>
              </Card>

            </div>

            {/* LEAD OUTCOME BREAKDOWN */}
            <Card title={`Lead Outcome Breakdown (${monthNames[month - 1]} ${year})`}>
              {!data?.leadOutcomes || data.leadOutcomes.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No call interaction outcomes logged for this period.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {data.leadOutcomes.map((item: any) => (
                    <div key={item.outcome} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-medium text-slate-500 block uppercase tracking-wider">
                        {item.outcome.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xl font-bold text-slate-900 mt-1 block">{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* CLOSED PROJECTS LIST */}
            <Card title={`Closed Deals & Projects (${data?.closedDeals?.length || 0} Projects Credit)`}>
              {!data?.closedDeals || data.closedDeals.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No closed deals registered for this period.</p>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Project Title</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Closed Date</th>
                        <th className="px-4 py-3 text-right">Deal Value (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {data.closedDeals.map((deal: any) => (
                        <tr key={deal.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-bold text-slate-900">{deal.projectName}</td>
                          <td className="px-4 py-3">
                            <Badge variant="success">WON / CLOSED</Badge>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {new Date(deal.closedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-700 font-mono">
                            ₹{(deal.value || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}

      </div>

      {/* EDIT TARGETS MODAL */}
      {isEditingTargets && (
        <Modal
          isOpen={isEditingTargets}
          onClose={() => setIsEditingTargets(false)}
          title={`Edit Targets for ${data?.employee?.name || 'Employee'}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveTargets} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Daily Lead Calling Target (Leads/day)
              </label>
              <input
                type="number"
                required
                min="1"
                value={dailyLeadTarget}
                onChange={(e) => setDailyLeadTarget(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Default business target: 20 leads per working day</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Monthly Closed Projects Target (Projects/month)
              </label>
              <input
                type="number"
                required
                min="1"
                value={monthlyDealTarget}
                onChange={(e) => setMonthlyDealTarget(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Default business target: Minimum 7 successfully closed projects</span>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsEditingTargets(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={savingTargets}>
                Save Target Configuration
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Modal>
  );
};
