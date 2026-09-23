import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Users, Search, UserPlus, Trash2, CheckCircle2, XCircle, ShieldCheck, Pencil, X, Save, Camera, Eye } from 'lucide-react';

export const Persons = () => {
  const [persons, setPersons] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingPerson, setEditingPerson] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    unique_person_id: '',
    department: '',
    roll_number: '',
    employee_number: '',
  });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Image Lightbox State
  const [previewImage, setPreviewImage] = useState(null);

  const fetchPersons = async () => {
    try {
      const res = await api.get('/persons', { params: { search } });
      setPersons(res.data);
    } catch (err) {
      console.error('Failed to fetch persons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersons();
  }, [search]);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    if (cleanPath.startsWith('storage/')) {
      return `http://127.0.0.1:8000/${cleanPath}`;
    }
    return `http://127.0.0.1:8000/storage/${cleanPath}`;
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this person and purge all biometric embeddings?')) {
      // Optimistic UI Update: Instantly remove row from state (0ms delay)
      setPersons((prev) => prev.filter((p) => p.id !== id));

      try {
        await api.delete(`/persons/${id}`);
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to delete person');
        // Rollback on error
        fetchPersons();
      }
    }
  };

  const handleOpenEdit = (p) => {
    setEditingPerson(p);
    setEditForm({
      name: p.name || '',
      unique_person_id: p.unique_person_id || '',
      department: p.department || '',
      roll_number: p.roll_number || '',
      employee_number: p.employee_number || '',
    });
    setEditError('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingPerson) return;
    setSaving(true);
    setEditError('');

    try {
      const payload = {
        name: editForm.name.trim(),
        unique_person_id: editForm.unique_person_id.trim(),
        department: editForm.department ? editForm.department.trim() : null,
        roll_number: editForm.roll_number ? editForm.roll_number.trim() : null,
        employee_number: editForm.employee_number ? editForm.employee_number.trim() : null,
      };

      await api.put(`/persons/${editingPerson.id}`, payload);
      setEditingPerson(null);
      fetchPersons();
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setEditError(detail.map((d) => d.msg).join(', '));
      } else if (typeof detail === 'string') {
        setEditError(detail);
      } else {
        setEditError('Failed to update person details');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Registered Individuals Directory</h2>
          <p className="text-xs text-slate-500 font-medium">Manage students, employees, editable profiles, and captured camera face photos</p>
        </div>

        <Link
          to="/persons/register"
          className="self-start sm:self-auto flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/20 active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Person</span>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, ID, department, roll/employee..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 shadow-xs transition-colors"
        />
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-slate-700 min-w-[720px]">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 sm:px-6 py-3.5">Captured Face Pic</th>
                <th className="px-4 sm:px-6 py-3.5">Person Name</th>
                <th className="px-4 sm:px-6 py-3.5">Unique Person ID</th>
                <th className="px-4 sm:px-6 py-3.5">Department</th>
                <th className="px-4 sm:px-6 py-3.5">Roll/Emp No</th>
                <th className="px-4 sm:px-6 py-3.5">Biometrics</th>
                <th className="px-4 sm:px-6 py-3.5">Status</th>
                <th className="px-4 sm:px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {persons.map((p) => {
                const imgUrl = getImageUrl(p.reference_image_path);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Captured Face Pic Column */}
                    <td className="px-4 sm:px-6 py-3.5">
                      {imgUrl ? (
                        <div
                          onClick={() => setPreviewImage({ url: imgUrl, title: `${p.name} (${p.unique_person_id})` })}
                          className="relative group cursor-pointer w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 shrink-0"
                          title="Click to view full-resolution captured photo"
                        >
                          <img
                            src={imgUrl}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                          <Camera className="w-4 h-4 mb-0.5 text-indigo-400" />
                          <span className="text-[10px] text-indigo-500 font-semibold">No Pic</span>
                        </div>
                      )}
                    </td>

                    {/* Person Name */}
                    <td className="px-4 sm:px-6 py-4 font-semibold text-slate-900">
                      <div>{p.name}</div>
                      <div className="text-xs text-slate-400 font-normal">{p.email || p.phone || '-'}</div>
                    </td>

                    {/* Unique Person ID */}
                    <td className="px-4 sm:px-6 py-4 font-mono text-xs text-indigo-600 font-bold">
                      {p.unique_person_id}
                    </td>

                    {/* Department */}
                    <td className="px-4 sm:px-6 py-4 font-medium text-slate-700">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                        {p.department || 'Auto Registered'}
                      </span>
                    </td>

                    {/* Roll / Emp No */}
                    <td className="px-4 sm:px-6 py-4 text-slate-600">{p.roll_number || p.employee_number || '-'}</td>

                    {/* Biometrics */}
                    <td className="px-4 sm:px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {p.embedding_count} Embedding(s)
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 sm:px-6 py-4">
                      {p.is_active ? (
                        <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold text-xs flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 sm:px-6 py-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-transparent hover:border-indigo-200"
                        title="Edit Name, Unique ID, & Department"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all border border-transparent hover:border-rose-200"
                        title="Purge Person & Biometrics"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {persons.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400 text-sm">
                    No registered persons found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT PERSON MODAL */}
      {editingPerson && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-indigo-600" />
                Edit Person Details
              </h3>
              <button
                onClick={() => setEditingPerson(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-600 uppercase tracking-wider">Person Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 uppercase tracking-wider">Unique Person ID *</label>
                <input
                  type="text"
                  required
                  value={editForm.unique_person_id}
                  onChange={(e) => setEditForm({ ...editForm, unique_person_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-indigo-600 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  placeholder="e.g. STU_2026_001"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 uppercase tracking-wider">Department</label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  placeholder="e.g. Computer Science / Staff"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-600 uppercase tracking-wider">Roll Number</label>
                  <input
                    type="text"
                    value={editForm.roll_number}
                    onChange={(e) => setEditForm({ ...editForm, roll_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-600 uppercase tracking-wider">Employee No</label>
                  <input
                    type="text"
                    value={editForm.employee_number}
                    onChange={(e) => setEditForm({ ...editForm, employee_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPerson(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMAGE PREVIEW LIGHTBOX MODAL */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between text-white border-b border-slate-800 pb-2.5 px-2">
              <span className="text-xs font-bold text-slate-300">{previewImage.title}</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full h-80 rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-800">
              <img src={previewImage.url} alt="Face Preview" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
