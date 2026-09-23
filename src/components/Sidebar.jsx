import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  Users,
  UserPlus,
  Clock,
  FileSpreadsheet,
  Camera,
  Settings,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/cctv', label: 'Live CCTV', icon: Video },
  { path: '/persons', label: 'Persons Directory', icon: Users },
  { path: '/persons/register', label: 'Register Person', icon: UserPlus },
  { path: '/attendance/today', label: "Today's Attendance", icon: Clock },
  { path: '/attendance/history', label: 'Reports & History', icon: FileSpreadsheet },
  { path: '/cameras', label: 'Camera Setup', icon: Camera },
  { path: '/settings', label: 'Timing & Rules', icon: Settings },
  { path: '/audit-logs', label: 'Audit Logs', icon: ShieldAlert },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)] shadow-xs">
      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-1.5 shadow-xs">
        <div className="font-semibold text-slate-800 flex items-center justify-between">
          <span>Engine Status</span>
          <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-100 px-1.5 py-0.5 rounded">v1.0</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-700 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>ArcFace Biometrics Active</span>
        </div>
      </div>
    </aside>
  );
};
