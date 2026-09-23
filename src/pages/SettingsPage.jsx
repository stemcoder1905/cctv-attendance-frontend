import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Settings, Save, CheckCircle2, Sliders, Clock, Globe, RotateCcw, Sparkles } from 'lucide-react';

export const SettingsPage = () => {
  const [settings, setSettings] = useState({
    attendance_start_time: '08:00',
    late_after_time: '09:15',
    attendance_cutoff_time: '17:00',
    timezone: 'Asia/Kolkata',
    face_match_threshold: 0.55,
    min_confirmation_frames: 3,
  });

  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Format HH:MM:SS string to HH:MM for HTML time input compatibility
  const formatTimeForInput = (val) => {
    if (!val) return '08:00';
    const parts = val.split(':');
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return val;
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      setSettings({
        ...res.data,
        attendance_start_time: formatTimeForInput(res.data.attendance_start_time),
        late_after_time: formatTimeForInput(res.data.late_after_time),
        attendance_cutoff_time: formatTimeForInput(res.data.attendance_cutoff_time),
      });
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleApplyPreset = (start, late, cutoff) => {
    setSettings({
      ...settings,
      attendance_start_time: start,
      late_after_time: late,
      attendance_cutoff_time: cutoff,
    });
  };

  const handleResetDefaults = () => {
    setSettings({
      attendance_start_time: '08:00',
      late_after_time: '09:15',
      attendance_cutoff_time: '17:00',
      timezone: 'Asia/Kolkata',
      face_match_threshold: 0.55,
      min_confirmation_frames: 3,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setErrorMsg('');

    try {
      const payload = {
        attendance_start_time: formatTimeForInput(settings.attendance_start_time),
        late_after_time: formatTimeForInput(settings.late_after_time),
        attendance_cutoff_time: formatTimeForInput(settings.attendance_cutoff_time),
        timezone: settings.timezone,
        face_match_threshold: parseFloat(settings.face_match_threshold),
        min_confirmation_frames: parseInt(settings.min_confirmation_frames, 10),
      };

      const res = await api.put('/settings', payload);
      setSettings({
        ...res.data,
        attendance_start_time: formatTimeForInput(res.data.attendance_start_time),
        late_after_time: formatTimeForInput(res.data.late_after_time),
        attendance_cutoff_time: formatTimeForInput(res.data.attendance_cutoff_time),
      });

      setMsg('System timing policies & AI biometric rules updated successfully!');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update system settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
          System Timing & AI Rules
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Editable
          </span>
        </h2>
        <p className="text-xs text-slate-500 font-medium">Configure official work schedules, late arrival cutoffs, and ArcFace biometric matching rules</p>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2.5 font-semibold shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2.5 font-semibold shadow-xs animate-in fade-in duration-200">
          <span className="font-bold">Error:</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm">
        
        {/* Attendance Timing Schedule */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" /> Attendance Timing Schedule
            </h3>
            
            {/* Shift Presets */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] text-slate-400 font-semibold mr-1">Presets:</span>
              <button
                type="button"
                onClick={() => handleApplyPreset('08:00', '09:15', '17:00')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-lg font-semibold transition-all"
              >
                Standard (08:00 - 17:00)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('09:00', '09:30', '18:00')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-lg font-semibold transition-all"
              >
                Corporate (09:00 - 18:00)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                Official Start Time <span className="text-indigo-600">*</span>
              </label>
              <input
                type="time"
                value={settings.attendance_start_time}
                onChange={(e) => setSettings({ ...settings, attendance_start_time: e.target.value })}
                required
                className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">First arrival threshold for Present status</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                Late After Time <span className="text-amber-600">*</span>
              </label>
              <input
                type="time"
                value={settings.late_after_time}
                onChange={(e) => setSettings({ ...settings, late_after_time: e.target.value })}
                required
                className="w-full bg-amber-50/40 hover:bg-white focus:bg-white border border-amber-200/80 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/10 transition-all cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Arrivals past this time are marked LATE</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                Cutoff ABSENT Time <span className="text-rose-600">*</span>
              </label>
              <input
                type="time"
                value={settings.attendance_cutoff_time}
                onChange={(e) => setSettings({ ...settings, attendance_cutoff_time: e.target.value })}
                required
                className="w-full bg-rose-50/40 hover:bg-white focus:bg-white border border-rose-200/80 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">End of day cutoff for ABSENT records</p>
            </div>
          </div>

          {/* Timezone Selection */}
          <div className="pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 mb-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-600" /> System Time Zone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="America/New_York">America/New_York (EST/EDT)</option>
              <option value="Europe/London">Europe/London (GMT/BST)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST +09:00)</option>
            </select>
          </div>
        </div>

        {/* Biometric AI Matching Rules */}
        <div className="space-y-5 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-600" /> Biometric AI Recognition Parameters
            </h3>
            <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              ArcFace 512D Engine
            </span>
          </div>

          <div className="space-y-6">
            {/* ArcFace Cosine Threshold */}
            <div className="space-y-2 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  ArcFace Cosine Match Threshold: 
                  <span className="px-2.5 py-0.5 bg-indigo-600 text-white rounded-lg text-xs font-extrabold shadow-xs">
                    {settings.face_match_threshold}
                  </span>
                </span>
                <span className="text-slate-400 font-medium">(Default: 0.55)</span>
              </div>
              <input
                type="range"
                min="0.30"
                max="0.85"
                step="0.01"
                value={settings.face_match_threshold}
                onChange={(e) => setSettings({ ...settings, face_match_threshold: parseFloat(e.target.value) })}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] font-semibold text-slate-400 pt-1">
                <span>0.30 (Relaxed Match)</span>
                <span>0.55 (Recommended)</span>
                <span>0.85 (Strict Verification)</span>
              </div>
            </div>

            {/* Minimum Confirmation Frames */}
            <div className="space-y-2 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  Minimum Confirmation Frames: 
                  <span className="px-2.5 py-0.5 bg-purple-600 text-white rounded-lg text-xs font-extrabold shadow-xs">
                    {settings.min_confirmation_frames} Frames
                  </span>
                </span>
                <span className="text-slate-400 font-medium">(Default: 3 Frames)</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={settings.min_confirmation_frames}
                onChange={(e) => setSettings({ ...settings, min_confirmation_frames: parseInt(e.target.value, 10) })}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[11px] font-semibold text-slate-400 pt-1">
                <span>1 Frame (Instant Recognition)</span>
                <span>3 Frames (Balanced Stability)</span>
                <span>10 Frames (High Anti-Spoof Protection)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset to Defaults</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm transition-all duration-200 shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Saving Changes...' : 'Save System Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
