import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  Activity,
  ArrowRight
} from 'lucide-react';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      title: 'Total Registered',
      value: stats?.total_registered ?? 0,
      icon: Users,
      color: 'text-indigo-600',
      bg: 'bg-white border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/20',
      path: '/persons',
      tooltip: 'View all registered students & staff'
    },
    {
      title: 'Present Today',
      value: stats?.present_today ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/50 border-emerald-200/60 hover:border-emerald-400 hover:bg-emerald-50',
      path: '/attendance/today?status=PRESENT',
      tooltip: "View today's PRESENT attendance records"
    },
    {
      title: 'Late Today',
      value: stats?.late_today ?? 0,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50/50 border-amber-200/60 hover:border-amber-400 hover:bg-amber-50',
      path: '/attendance/today?status=LATE',
      tooltip: "View today's LATE attendance records"
    },
    {
      title: 'Absent Today',
      value: stats?.absent_today ?? 0,
      icon: XCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-50/50 border-rose-200/60 hover:border-rose-400 hover:bg-rose-50',
      path: '/attendance/today?status=ABSENT',
      tooltip: "View today's ABSENT cutoff records"
    },
    {
      title: 'Unknown Events',
      value: stats?.unknown_events_today ?? 0,
      icon: HelpCircle,
      color: 'text-purple-600',
      bg: 'bg-purple-50/50 border-purple-200/60 hover:border-purple-400 hover:bg-purple-50',
      path: '/audit-logs',
      tooltip: 'View security audit trail & recognition events'
    },
    {
      title: 'Active Cameras',
      value: stats?.active_cameras ?? 0,
      icon: Camera,
      color: 'text-indigo-600',
      bg: 'bg-white border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/20',
      path: '/cameras',
      tooltip: 'Configure IP cameras & RTSP streams'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            Attendance Dashboard
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">Click any metric card to open detailed filtered reports</p>
        </div>
        <button
          onClick={fetchStats}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs rounded-xl border border-slate-200 transition-all duration-200 shadow-xs active:scale-95 font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Stats</span>
        </button>
      </div>

      {/* KPI Cards Grid - Fully Clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              onClick={() => navigate(c.path)}
              title={c.tooltip}
              className={`group cursor-pointer p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-95 space-y-2 sm:space-y-3 relative overflow-hidden ${c.bg}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{c.title}</span>
                <Icon className={`w-4 h-4 ${c.color} transition-transform group-hover:scale-110`} />
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-black text-slate-900">{c.value}</div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Attendance Rate Banner - Fully Clickable */}
      <div
        onClick={() => navigate('/attendance/history')}
        title="Click to view detailed attendance history & export reports"
        className="group cursor-pointer bg-white hover:bg-slate-50/80 border border-slate-200/80 hover:border-emerald-300 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.99]"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 shadow-xs shrink-0 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Overall Attendance Compliance Rate
              <ArrowRight className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-xs text-slate-500 font-medium">Percentage of registered individuals recognized as Present or Late today</div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 group-hover:bg-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl border border-slate-200/80 group-hover:border-emerald-200 self-end sm:self-auto transition-all">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            {stats?.attendance_rate ?? 0}%
          </div>
        </div>
      </div>
    </div>
  );
};
