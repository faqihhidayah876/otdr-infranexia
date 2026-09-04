import { useState, useEffect } from 'react';
import { Activity, FileText, AlertTriangle, TrendingDown, Loader2 } from 'lucide-react';
import { getHistoryData } from '../utils/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalPutus: 0,
    totalBending: 0,
    avgRxOnu: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getHistoryData();
        const data = response.data || [];
        
        // Kalkulasi Statistik
        const totalFiles = data.length;
        const totalPutus = data.reduce((acc, curr) => acc + (curr.jumlah_titik_putus || 0), 0);
        const totalBending = data.reduce((acc, curr) => acc + (curr.jumlah_bending || 0), 0);
        const sumRx = data.reduce((acc, curr) => acc + (curr.estimasi_rx_onu || 0), 0);
        const avgRxOnu = totalFiles > 0 ? (sumRx / totalFiles).toFixed(2) : 0;

        setStats({ totalFiles, totalPutus, totalBending, avgRxOnu });
      } catch (error) {
        console.error("Gagal memuat data dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Komponen Kartu Statistik agar kode lebih rapi
  const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${colorClass}`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p>Menyiapkan Dashboard Infranexia...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <Activity className="text-red-600" size={32} />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Utama</h2>
          <p className="text-gray-500 mt-1">Ringkasan performa jaringan fiber optik dari data OTDR.</p>
        </div>
      </div>

      {/* Grid Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total File Diproses" 
          value={stats.totalFiles} 
          icon={FileText} 
          colorClass="bg-blue-100 text-blue-600"
          subtitle="File Excel hasil konversi"
        />
        <StatCard 
          title="Total Titik Putus" 
          value={stats.totalPutus} 
          icon={AlertTriangle} 
          colorClass="bg-red-100 text-red-600"
          subtitle="Titik EOF terdeteksi"
        />
        <StatCard 
          title="Total Bending" 
          value={stats.totalBending} 
          icon={TrendingDown} 
          colorClass="bg-yellow-100 text-yellow-600"
          subtitle="Event redaman signifikan"
        />
        <StatCard 
          title="Rata-rata Estimasi RX" 
          value={`${stats.avgRxOnu} dBm`} 
          icon={Activity} 
          colorClass="bg-green-100 text-green-600"
          subtitle="Kualitas daya terima ONU"
        />
      </div>

      {/* Area Informasi Tambahan */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Panduan Penggunaan Sistem</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm">
          <li>Pilih menu <strong>Upload Data</strong> untuk mengubah file Excel mentah dari alat ukur OTDR menjadi format laporan Infranexia.</li>
          <li>Sistem secara otomatis akan mendeteksi titik putus (End of Fiber) dan event bending.</li>
          <li>Klik tombol <strong>Simpan Laporan (Excel)</strong> setelah kalkulasi selesai untuk mengunduh rekapitulasi data.</li>
          <li>Semua riwayat pengujian tersimpan secara otomatis dan dapat dipantau di menu <strong>History</strong>.</li>
        </ul>
      </div>
    </div>
  );
}