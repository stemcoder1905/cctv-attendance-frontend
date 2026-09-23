import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Camera, Plus, Trash2, Signal, CheckCircle2, AlertCircle, RefreshCw, Radio } from 'lucide-react';

export const Cameras = () => {
  const [cameras, setCameras] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    camera_name: '',
    location: '',
    stream_url: '',
  });
  const [loading, setLoading] = useState(false);

  const fetchCameras = async () => {
    try {
      const res = await api.get('/cameras');
      setCameras(res.data);
    } catch (err) {
      console.error('Failed to fetch cameras:', err);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/cameras', formData);
      setShowModal(false);
      setFormData({ camera_name: '', location: '', stream_url: '' });
      fetchCameras();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add camera');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete camera instance?')) {
      try {
        await api.delete(`/cameras/${id}`);
        fetchCameras();
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to delete camera');
      }
    }
  };

  const handleTest = async (id) => {
    try {
      const res = await api.post(`/cameras/${id}/test`);
      alert(res.data.connection_successful ? 'Connection Test SUCCESSFUL!' : 'Connection Test FAILED. Please check camera power and network RTSP stream.');
    } catch (err) {
      alert('Test failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Camera Management</h2>
          <p className="text-xs text-slate-500 font-medium">Configure IP cameras, RTSP streams, NVR channels, and local webcams</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Camera</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cameras.map((c) => (
          <div key={c.id} className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shadow-xs">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{c.camera_name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{c.location || 'Unspecified Location'}</p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                c.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {c.status}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs font-mono text-slate-600 truncate">
              URL: {c.stream_url}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => handleTest(c.id)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition flex items-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5" /> Test Connection
              </button>

              <button
                onClick={() => handleDelete(c.id)}
                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all border border-transparent hover:border-rose-200"
                title="Delete Camera"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Camera Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Add New Camera Stream</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Camera Name *</label>
                <input
                  type="text"
                  required
                  value={formData.camera_name}
                  onChange={(e) => setFormData({ ...formData, camera_name: e.target.value })}
                  placeholder="Camera 1 - Main Entrance"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Gate 1 / Reception"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">RTSP Stream URL or Webcam Index *</label>
                <input
                  type="text"
                  required
                  value={formData.stream_url}
                  onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })}
                  placeholder="rtsp://user:password@192.168.1.100:554/stream or 0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20"
                >
                  Save Camera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
