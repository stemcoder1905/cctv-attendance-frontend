import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FileSpreadsheet, Download, Filter, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export const AttendanceHistory = () => {
  const [records, setRecords] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');

  const fetchHistory = async () => {
    try {
      const res = await api.get('/attendance/history', {
        params: {
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          department: department || undefined,
          status: status || undefined,
        },
      });
      setRecords(res.data);
    } catch (err) {
      console.error('Failed to fetch attendance history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleExport = (fmt) => {
    const params = new URLSearchParams();
    params.append('format', fmt);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (department) params.append('department', department);
    if (status) params.append('status', status);

    const token = localStorage.getItem('token');
    window.open(`/api/v1/attendance/export?${params.toString()}&token=${token}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Attendance Reports & History</h2>
          <p className="text-xs text-slate-500 font-medium">Search, filter, and export official attendance records</p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs px-3.5 py-2 rounded-xl transition-all duration-200 font-semibold shadow-xs active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs px-3.5 py-2 rounded-xl transition-all duration-200 font-semibold shadow-xs active:scale-95"
          >
            <Download className="w-3.5 h-3.5" /> Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs px-3.5 py-2 rounded-xl transition-all duration-200 font-semibold shadow-xs active:scale-95"
          >
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end shadow-xs">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Department</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g. Engineering"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
          >
            <option value="">All Statuses</option>
            <option value="PRESENT">PRESENT</option>
            <option value="LATE">LATE</option>
            <option value="ABSENT">ABSENT</option>
          </select>
        </div>

        <button
          onClick={fetchHistory}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/20 active:scale-95"
        >
          <Filter className="w-3.5 h-3.5" /> Apply Filters
        </button>
      </div>

      {/* History Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-slate-700 min-w-[640px]">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 sm:px-6 py-3.5">Date</th>
                <th className="px-4 sm:px-6 py-3.5">Person Name</th>
                <th className="px-4 sm:px-6 py-3.5">Unique ID</th>
                <th className="px-4 sm:px-6 py-3.5">Department</th>
                <th className="px-4 sm:px-6 py-3.5">First Seen</th>
                <th className="px-4 sm:px-6 py-3.5">Status</th>
                <th className="px-4 sm:px-6 py-3.5">Camera Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 sm:px-6 py-4 font-mono text-xs text-slate-600">{r.attendance_date}</td>
                  <td className="px-4 sm:px-6 py-4 font-semibold text-slate-900">{r.person_name}</td>
                  <td className="px-4 sm:px-6 py-4 font-mono text-xs text-indigo-600 font-bold">{r.unique_person_id}</td>
                  <td className="px-4 sm:px-6 py-4">{r.department || '-'}</td>
                  <td className="px-4 sm:px-6 py-4 font-mono text-xs text-slate-600">{r.first_seen_time}</td>
                  <td className="px-4 sm:px-6 py-4">
                    {r.status === 'PRESENT' && <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded">PRESENT</span>}
                    {r.status === 'LATE' && <span className="text-amber-700 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded">LATE</span>}
                    {r.status === 'ABSENT' && <span className="text-rose-700 font-bold text-xs bg-rose-50 px-2 py-0.5 rounded">ABSENT</span>}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-xs text-slate-500 font-medium">{r.camera_name || 'System/Cutoff'}</td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-400 text-sm">
                    No attendance history matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
