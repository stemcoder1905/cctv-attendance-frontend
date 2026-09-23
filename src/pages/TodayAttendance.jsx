import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Clock, CheckCircle2, AlertTriangle, XCircle, Play, RefreshCw, Filter } from 'lucide-react';

export const TodayAttendance = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || '';
  const [selectedStatus, setSelectedStatus] = useState(statusParam);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedStatus(statusParam);
  }, [statusParam]);

  const fetchToday = async () => {
    try {
      const params = {};
      if (selectedStatus) {
        params.status = selectedStatus;
      }
      const res = await api.get('/attendance/today', { params });
      setRecords(res.data);
    } catch (err) {
      console.error('Failed to fetch today attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToday();
    const interval = setInterval(fetchToday, 5000);
    return () => clearInterval(interval);
  }, [selectedStatus]);

  const handleStatusFilterChange = (status) => {
    setSelectedStatus(status);
    if (status) {
      setSearchParams({ status });
    } else {
      setSearchParams({});
    }
  };

  const triggerCutoff = async () => {
    if (window.confirm('Trigger end-of-day cutoff job now to mark missing individuals as ABSENT?')) {
      try {
        const res = await api.post('/attendance/trigger-cutoff');
        alert(`Cutoff complete! Generated ${res.data.absent_records_created} ABSENT record(s).`);
        fetchToday();
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to trigger cutoff job.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            Today's Live Attendance
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">First confirmed CCTV recognition of the day determines status</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-600">
            <button
              onClick={() => handleStatusFilterChange('')}
              className={`px-3 py-1 rounded-lg transition-all ${!selectedStatus ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusFilterChange('PRESENT')}
              className={`px-3 py-1 rounded-lg transition-all ${selectedStatus === 'PRESENT' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:text-emerald-700'}`}
            >
              Present
            </button>
            <button
              onClick={() => handleStatusFilterChange('LATE')}
              className={`px-3 py-1 rounded-lg transition-all ${selectedStatus === 'LATE' ? 'bg-amber-600 text-white shadow-xs' : 'hover:text-amber-700'}`}
            >
              Late
            </button>
            <button
              onClick={() => handleStatusFilterChange('ABSENT')}
              className={`px-3 py-1 rounded-lg transition-all ${selectedStatus === 'ABSENT' ? 'bg-rose-600 text-white shadow-xs' : 'hover:text-rose-700'}`}
            >
              Absent
            </button>
          </div>

          <button
            onClick={fetchToday}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs rounded-xl border border-slate-200 transition-all duration-200 shadow-xs active:scale-95 font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={triggerCutoff}
            className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-xs active:scale-95"
          >
            <Play className="w-3.5 h-3.5 text-amber-600" />
            <span>Run Cutoff Job</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-slate-700 min-w-[640px]">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 sm:px-6 py-3.5">Person Name</th>
                <th className="px-4 sm:px-6 py-3.5">Unique ID</th>
                <th className="px-4 sm:px-6 py-3.5">Department</th>
                <th className="px-4 sm:px-6 py-3.5">First Seen Time</th>
                <th className="px-4 sm:px-6 py-3.5">Status</th>
                <th className="px-4 sm:px-6 py-3.5">Camera</th>
                <th className="px-4 sm:px-6 py-3.5">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 sm:px-6 py-4 font-semibold text-slate-900">{r.person_name}</td>
                  <td className="px-4 sm:px-6 py-4 font-mono text-xs text-indigo-600 font-bold">{r.unique_person_id}</td>
                  <td className="px-4 sm:px-6 py-4">{r.department || '-'}</td>
                  <td className="px-4 sm:px-6 py-4 font-mono text-xs text-slate-600">{r.first_seen_time}</td>
                  <td className="px-4 sm:px-6 py-4">
                    {r.status === 'PRESENT' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PRESENT
                      </span>
                    )}
                    {r.status === 'LATE' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> LATE
                      </span>
                    )}
                    {r.status === 'ABSENT' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> ABSENT
                      </span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-xs font-medium text-slate-600">{r.camera_name || 'System/Cutoff'}</td>
                  <td className="px-4 sm:px-6 py-4 font-mono text-xs font-semibold text-slate-700">
                    {r.confidence ? `${(r.confidence * 100).toFixed(1)}%` : '-'}
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                    {selectedStatus ? `No ${selectedStatus} attendance records marked today.` : 'No attendance records marked yet today.'}
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
