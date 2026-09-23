import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Camera, Signal, AlertCircle, RefreshCw, Eye } from 'lucide-react';

export const LiveCCTV = () => {
  const [cameras, setCameras] = useState([]);
  const [selectedCamId, setSelectedCamId] = useState(null);
  const [frameUrl, setFrameUrl] = useState(null);
  const [status, setStatus] = useState('CONNECTING');
  const wsRef = useRef(null);

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const res = await api.get('/cameras');
        setCameras(res.data);
        if (res.data.length > 0) {
          setSelectedCamId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load cameras:', err);
      }
    };
    fetchCameras();
  }, []);

  useEffect(() => {
    if (!selectedCamId) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.host;
    const wsUrl = `${wsProtocol}//${wsHost}/ws/cctv/${selectedCamId}`;

    wsRef.current = new WebSocket(wsUrl);
    wsRef.current.binaryType = 'blob';

    wsRef.current.onopen = () => setStatus('ONLINE');
    wsRef.current.onclose = () => setStatus('OFFLINE');
    wsRef.current.onerror = () => setStatus('ERROR');

    wsRef.current.onmessage = (event) => {
      if (event.data instanceof Blob) {
        const url = URL.createObjectURL(event.data);
        setFrameUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedCamId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            Live CCTV Monitor
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Eye className="w-3.5 h-3.5" /> Active
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">Real-time InsightFace + ArcFace video stream overlay</p>
        </div>

        {/* Camera Selector Tabs */}
        <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
          {cameras.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCamId(c.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                selectedCamId === c.id
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-xs scale-105'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{c.camera_name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CCTV Display Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden relative min-h-[280px] sm:min-h-[480px] flex items-center justify-center shadow-lg">
        {/* Stream Status Overlay Badge */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-slate-200 shadow-md">
          <Signal className={`w-3.5 h-3.5 ${status === 'ONLINE' ? 'text-emerald-600 animate-pulse' : 'text-rose-600'}`} />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-800">
            {status}
          </span>
        </div>

        {frameUrl ? (
          <img src={frameUrl} alt="CCTV Stream" className="w-full h-auto max-h-[640px] object-contain" />
        ) : (
          <div className="text-center space-y-3 p-6 sm:p-8">
            <div className="inline-flex p-3 sm:p-4 bg-slate-900 rounded-full text-slate-600 mb-1 sm:mb-2 border border-slate-800">
              <Camera className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce text-indigo-400" />
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-300">Connecting to CCTV Video Stream...</div>
            <div className="text-[11px] sm:text-xs text-slate-500 max-w-sm mx-auto">
              Please ensure camera background worker is active and stream source is accessible.
            </div>
          </div>
        )}
      </div>

      {/* Overlay Information Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3 shadow-xs">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs shrink-0"></div>
          <div>
            <div className="text-xs font-bold text-slate-900">Green Bounding Box</div>
            <div className="text-[11px] sm:text-xs text-slate-500 font-medium">Confirmed Identity (Attendance Recorded)</div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3 shadow-xs">
          <div className="w-3 h-3 rounded-full bg-amber-500 shadow-xs shrink-0"></div>
          <div>
            <div className="text-xs font-bold text-slate-900">Yellow Bounding Box</div>
            <div className="text-[11px] sm:text-xs text-slate-500 font-medium">Verifying Candidate (Temporal Match in progress)</div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3 shadow-xs">
          <div className="w-3 h-3 rounded-full bg-rose-500 shadow-xs shrink-0"></div>
          <div>
            <div className="text-xs font-bold text-slate-900">Red Bounding Box</div>
            <div className="text-[11px] sm:text-xs text-slate-500 font-medium">Unknown Individual (Attendance Skipped)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
