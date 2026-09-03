import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import History from './pages/History';
import Login from './pages/auth/Login';

export default function App() {
  return (
    <Routes>
      {/* URL utama otomatis dilempar ke halaman Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Rute Terproteksi (Akan kita kunci dengan token dari Laravel nantinya) */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/history" element={<History />} />
      </Route>

      {/* Tangani 404 (URL tidak dikenal), kembalikan ke Login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}