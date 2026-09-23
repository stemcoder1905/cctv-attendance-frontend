import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield, Camera, Cpu, Menu, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  Users,
  UserPlus,
  Clock,
  FileSpreadsheet,
  Settings,
  ShieldAlert
} from 'lucide-react';

const mobileNavItems = [
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

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition border border-slate-200"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl border border-indigo-100 shadow-xs shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              AI CCTV Attendance
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Cpu className="w-3 h-3" /> AI Engine
              </span>
            </h1>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline-block">InsightFace + ArcFace Biometrics</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">{user?.role || 'User'}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200">
            <div className="text-right hidden xs:block">
              <div className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">{user?.name || 'User'}</div>
              <div className="text-[10px] sm:text-xs text-slate-500">{user?.email}</div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-down Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-2 shadow-lg sticky top-16 z-20 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
