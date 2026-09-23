import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShieldAlert, Lock, User, Clock } from 'lucide-react';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Security Audit Logs</h2>
        <p className="text-xs text-slate-500 font-medium">System audit trail recording administrative and security actions</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-slate-700 min-w-[640px]">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 sm:px-6 py-3.5">Timestamp</th>
                <th className="px-4 sm:px-6 py-3.5">User</th>
                <th className="px-4 sm:px-6 py-3.5">Action</th>
                <th className="px-4 sm:px-6 py-3.5">Resource</th>
                <th className="px-4 sm:px-6 py-3.5">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors font-mono text-xs">
                  <td className="px-4 sm:px-6 py-4 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 sm:px-6 py-4 font-semibold text-slate-800">{log.user_name || 'System'}</td>
                  <td className="px-4 sm:px-6 py-4 text-indigo-600 font-bold">{log.action}</td>
                  <td className="px-4 sm:px-6 py-4 text-slate-700">{log.resource_type} {log.resource_id ? `#${log.resource_id}` : ''}</td>
                  <td className="px-4 sm:px-6 py-4 text-slate-500">{log.ip_address || '127.0.0.1'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400 text-sm font-sans">
                    No audit logs recorded yet.
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
