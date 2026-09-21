import React, { useState, useEffect } from 'react';
import { Building2, TrendingUp, Users, CheckSquare, PhoneCall, DollarSign, Award } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { api } from '../lib/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { CompanyReport, MarketingAnalytics } from '../types';

export const FounderDashboard: React.FC = () => {
  const [report, setReport] = useState<CompanyReport | null>(null);
  const [analytics, setAnalytics] = useState<MarketingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFounderData = async () => {
    try {
      const [repRes, mktRes] = await Promise.all([
        api.get('/reports/company'),
        api.get('/marketing/analytics'),
      ]);
      if (repRes.data.success) setReport(repRes.data.data);
      if (mktRes.data.success) setAnalytics(mktRes.data.data);
    } catch (err) {
      console.error('Failed to load founder report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFounderData();
  }, []);

  const COLORS = ['#2563EB', '#16A34A', '#D97706', '#DC2626', '#9333EA'];

  const revenueData = [
    {
      name: 'Current Month Target',
      Target: report?.marketing.targetRevenue || 1000000,
      Achieved: report?.marketing.revenue || 0,
    },
  ];

  const funnelData = analytics?.statusBreakdown.map((item) => ({
    name: item.status.replace('_', ' '),
    value: item.count,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Executive Overview</span>
          <h1 className="text-2xl font-bold mt-1">Founder & CEO Visibility Console</h1>
          <p className="text-slate-300 text-xs mt-0.5">High-level enterprise performance metrics for BluNet IT Services</p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-4 py-2 rounded-xl text-xs font-semibold border border-white/20">
          <Award className="w-4 h-4 text-blue-400" />
          <span>Executive Read-Only Visibility</span>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Achieved Revenue</div>
            <div className="text-2xl font-bold text-slate-900">
              ₹{(report?.marketing.revenue || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {report?.marketing.targetAchievement}% of Target
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Deals Closed</div>
            <div className="text-2xl font-bold text-slate-900">{report?.marketing.closedDeals}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">From {report?.marketing.totalCalls} Calls</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Task Completion</div>
            <div className="text-2xl font-bold text-slate-900">{report?.tasks.completionRate}%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{report?.tasks.completed} / {report?.tasks.total} Tasks</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Staffing Count</div>
            <div className="text-2xl font-bold text-slate-900">{report?.employees.total}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{report?.employees.active} Active Employees</div>
          </div>
        </Card>
      </div>

      {/* Recharts Performance Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Target vs Actual */}
        <Card title="Monthly Revenue Target vs Actual Achieved">
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(val: number) => `₹${val.toLocaleString('en-IN')}`} />
                <Legend />
                <Bar dataKey="Target" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Achieved" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Marketing Lead Conversion Breakdown */}
        <Card title="Marketing Lead Response Distribution">
          <div className="h-72 w-full pt-4 flex items-center justify-center">
            {funnelData.length === 0 ? (
              <p className="text-xs text-slate-400">No marketing calls recorded yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={funnelData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
