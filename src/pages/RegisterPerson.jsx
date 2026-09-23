import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { UserPlus, Upload, CheckCircle2, AlertCircle, Camera, ShieldCheck, ArrowRight, RefreshCw, Video, Sparkles } from 'lucide-react';

export const RegisterPerson = () => {
  const [formData, setFormData] = useState({
    unique_person_id: '',
    name: '',
    roll_number: '',
    employee_number: '',
    department: '',
    email: '',
    phone: '',
    designation: '',
  });

  const [mode, setMode] = useState('upload'); // 'upload' or 'webcam'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);
  const [stepText, setStepText] = useState('');

  // Webcam states & refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [webcamActive, setWebcamActive] = useState(false);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setStatusMsg({ type: '', msg: '' });
    }
  };

  const startWebcam = async () => {
    try {
      setWebcamActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Unable to access camera: ' + err.message);
      setWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setWebcamActive(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `webcam_register_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        stopWebcam();
      }
    }, 'image/jpeg', 0.95);
  };

  const handleAutoID = () => {
    const autoId = `REG_${Date.now().toString().slice(-6)}`;
    setFormData((prev) => ({ ...prev, unique_person_id: autoId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setStatusMsg({ type: 'error', msg: 'Please upload a photo or capture a live camera snapshot.' });
      return;
    }

    setLoading(true);
    setStatusMsg({ type: '', msg: '' });
    setStepText('Step 1/2: Registering person metadata...');

    let createdPersonId = null;

    try {
      // Clean payload
      const payload = {
        unique_person_id: formData.unique_person_id.trim(),
        name: formData.name.trim(),
        department: formData.department.trim() || null,
        roll_number: formData.roll_number.trim() || null,
        employee_number: formData.employee_number.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        designation: formData.designation.trim() || null,
      };

      const personRes = await api.post('/persons', payload);
      createdPersonId = personRes.data.id;

      setStepText('Step 2/2: Validating face quality & extracting 512D ArcFace embedding...');

      const form = new FormData();
      form.append('file', selectedFile);

      const faceRes = await api.post(`/persons/${createdPersonId}/face`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setStatusMsg({
        type: 'success',
        msg: `Registration Successful! Person registered cleanly. Quality Score: ${(faceRes.data.quality_score * 100).toFixed(1)}%`,
      });

      setTimeout(() => navigate('/persons'), 1800);
    } catch (err) {
      // Clean up orphan person record if face upload failed
      if (createdPersonId) {
        try {
          await api.delete(`/persons/${createdPersonId}`);
        } catch (delErr) {
          console.error('Failed to cleanup orphan person:', delErr);
        }
      }

      let errorDetail = 'Failed to complete registration.';
      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        errorDetail = detail.map((d) => (typeof d === 'string' ? d : d.msg || JSON.stringify(d))).join(', ');
      } else if (typeof detail === 'string') {
        errorDetail = detail;
      } else if (typeof detail === 'object' && detail !== null) {
        errorDetail = JSON.stringify(detail);
      }

      setStatusMsg({
        type: 'error',
        msg: errorDetail,
      });
    } finally {
      setLoading(false);
      setStepText('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Register New Individual</h2>
        <p className="text-xs text-slate-500 font-medium">Add student/employee profile and extract 512D ArcFace biometric face embedding</p>
      </div>

      {statusMsg.msg && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center gap-3 shadow-xs animate-in fade-in duration-200 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
              : 'bg-rose-50 border-rose-200 text-rose-800 font-semibold'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.msg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Unique Person ID */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Unique ID *</label>
              <button
                type="button"
                onClick={handleAutoID}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Auto Gen
              </button>
            </div>
            <input
              type="text"
              required
              value={formData.unique_person_id}
              onChange={(e) => setFormData({ ...formData, unique_person_id: e.target.value })}
              placeholder="e.g. EMP001 or ROLL101"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-indigo-600 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            />
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Deepak Mishra"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            />
          </div>

          {/* Roll / Employee Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Roll / Employee Number</label>
            <input
              type="text"
              value={formData.employee_number}
              onChange={(e) => setFormData({ ...formData, employee_number: e.target.value })}
              placeholder="100928"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            />
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="Engineering / CS"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Biometric Image Source Tabs */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> Biometric Face Photo *
            </label>

            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setMode('upload'); stopWebcam(); }}
                className={`px-3 py-1 rounded-lg transition-all ${mode === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => { setMode('webcam'); startWebcam(); }}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${mode === 'webcam' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <Video className="w-3.5 h-3.5" /> Live Camera
              </button>
            </div>
          </div>

          {/* Upload File Mode */}
          {mode === 'upload' && (
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 rounded-2xl p-6 text-center transition-all duration-200 flex flex-col items-center justify-center gap-3">
              {previewUrl ? (
                <div className="relative group">
                  <img src={previewUrl} alt="Registration Preview" className="w-36 h-36 rounded-2xl object-cover border-2 border-indigo-500 shadow-md" />
                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                    Ready
                  </span>
                </div>
              ) : (
                <div className="p-4 bg-white rounded-2xl text-indigo-600 border border-slate-200 shadow-xs">
                  <Camera className="w-8 h-8" />
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="face-file" />
              <label
                htmlFor="face-file"
                className="cursor-pointer bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-200 transition shadow-xs active:scale-95"
              >
                {previewUrl ? 'Change Photo' : 'Select Image File'}
              </label>
              <span className="text-xs text-slate-400 font-medium max-w-xs">
                Must contain exactly 1 front-facing clear face. Blurry or multi-face photos are automatically rejected.
              </span>
            </div>
          )}

          {/* Live Webcam Mode */}
          {mode === 'webcam' && (
            <div className="bg-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3 border border-slate-800">
              <div className="relative w-full max-w-sm h-64 bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={captureSnapshot}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Photo</span>
                </button>
              </div>

              {previewUrl && (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 pt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Live Photo Captured Successfully!</span>
                </div>
              )}
            </div>
          )}
        </div>

        {stepText && (
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold flex items-center gap-2 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            <span>{stepText}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all duration-200 shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 group disabled:opacity-50 active:scale-98"
        >
          <span>{loading ? 'Processing Registration...' : 'Complete Person Registration'}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </form>
    </div>
  );
};
