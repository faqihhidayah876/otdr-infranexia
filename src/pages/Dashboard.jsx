import { useState, useEffect } from 'react';
import { Activity, FileText, AlertTriangle, TrendingDown, Loader2, GitCommit } from 'lucide-react';
import { getHistoryData } from '../utils/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalFileUploads: 0,
    totalCore: 0,
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
        
        // Kelompokkan berdasarkan menit upload & ODC
        const uniqueUploads = new Set(data.map(item => item.created_at.substring(0, 16) + '_' + item.odc)).size;
        
        const totalCore = data.length;
        const totalPutus = data.reduce((acc, curr) => acc + (curr.jumlah_titik_putus > 0 ? 1 : 0), 0);
        const totalBending = data.reduce((acc, curr) => acc + (curr.jumlah_bending || 0), 0);
        const sumRx = data.reduce((acc, curr) => acc + (curr.estimasi_rx_onu || 0), 0);
        const avgRxOnu = totalCore > 0 ? (sumRx / totalCore).toFixed(2) : 0;

        setStats({ totalFileUploads: uniqueUploads, totalCore, totalPutus, totalBending, avgRxOnu });
      } catch (error) {
        console.error("Gagal memuat data dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // StatCard dengan desain baru (glassmorphism, vertikal, efek cahaya)
  const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
    <div className="bg-white/50 backdrop-blur-xl border border-white/60 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(220,38,38,0.1)] hover:bg-white/70 relative overflow-hidden">
      {/* Efek kilau cahaya di sudut */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-2xl"></div>
      
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div className="relative z-10">
        <h4 className="text-3xl font-extrabold text-gray-800 tracking-tight">{value}</h4>
        <p className="text-sm text-gray-500 font-medium mt-1">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-2 font-medium">{subtitle}</p>}
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
    <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Utama</h2>
        <p className="text-gray-500 mt-1">Ringkasan performa jaringan fiber optik dari data OTDR.</p>
      </div>

      {/* Grid Kartu Statistik - 5 kolom */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard 
          title="Total File Upload" 
          value={stats.totalFileUploads} 
          icon={FileText} 
          colorClass="bg-blue-100 text-blue-600"
          subtitle="File Excel diproses"
        />
        <StatCard 
          title="Total Data Core" 
          value={stats.totalCore} 
          icon={GitCommit} 
          colorClass="bg-purple-100 text-purple-600"
          subtitle="Baris fiber dianalisa"
        />
        <StatCard 
          title="Core Putus" 
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
          subtitle="Event redaman tinggi"
        />
        <StatCard 
          title="Rata-rata RX ONU" 
          value={`${stats.avgRxOnu} dBm`} 
          icon={Activity} 
          colorClass="bg-green-100 text-green-600"
          subtitle="Kualitas daya terima"
        />
      </div>

      {/* Area Panduan Penggunaan Sistem (tetap) */}
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