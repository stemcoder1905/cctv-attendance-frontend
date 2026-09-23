import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { LiveCCTV } from './pages/LiveCCTV';
import { Persons } from './pages/Persons';
import { RegisterPerson } from './pages/RegisterPerson';
import { TodayAttendance } from './pages/TodayAttendance';
import { AttendanceHistory } from './pages/AttendanceHistory';
import { Cameras } from './pages/Cameras';
import { SettingsPage } from './pages/SettingsPage';
import { AuditLogs } from './pages/AuditLogs';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/cctv" element={<ProtectedRoute><LiveCCTV /></ProtectedRoute>} />
          <Route path="/persons" element={<ProtectedRoute><Persons /></ProtectedRoute>} />
          <Route path="/persons/register" element={<ProtectedRoute><RegisterPerson /></ProtectedRoute>} />
          <Route path="/attendance/today" element={<ProtectedRoute><TodayAttendance /></ProtectedRoute>} />
          <Route path="/attendance/history" element={<ProtectedRoute><AttendanceHistory /></ProtectedRoute>} />
          <Route path="/cameras" element={<ProtectedRoute><Cameras /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
