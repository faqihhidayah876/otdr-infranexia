import { useState, useEffect, useContext } from 'react';
import { FileSpreadsheet, Cable, AlertTriangle, TrendingDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getHistoryData } from '../utils/api';
import { AppContext } from '../App'; // 1. IMPORT CONTEXT

export default function Dashboard() {
  const { t, lang } = useContext(AppContext); // 2. PANGGIL FUNGSI t & lang
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalFiles: 0, totalCore: 0, totalPutus: 0, avgRxOnu: 0 });
  const [trendData, setTrendData] = useState([]);
  const [coreData, setCoreData] = useState([]);

  useEffect(() => { fetchRealData(); }, [lang]); // Render ulang jika bahasa berubah (untuk tanggal grafik)

  const fetchRealData = async () => {
    try {
      setLoading(true);
      const response = await getHistoryData();
      const rawData = response.data || [];

      let totalCore = 0; let totalPutus = 0; let sumRx = 0;
      const uniqueFiles = new Set(); 
      rawData.forEach(item => {
        uniqueFiles.add(`${item.created_at.substring(0, 16)}_${item.odc}`);
      });
      rawData.forEach(row => {
        totalCore += 1;
        if (row.jumlah_titik_putus > 0) totalPutus += 1;
        sumRx += row.estimasi_rx_onu;
      });
      const avgRx = totalCore > 0 ? (sumRx / totalCore).toFixed(2) : 0;
      setStats({ totalFiles: uniqueFiles.size, totalCore, totalPutus, avgRxOnu: avgRx });

      const rxByDate = {};
      rawData.forEach(row => {
        const dateStr = row.created_at.substring(0, 10);
        if (!rxByDate[dateStr]) rxByDate[dateStr] = { sum: 0, count: 0 };
        rxByDate[dateStr].sum += row.estimasi_rx_onu;
        rxByDate[dateStr].count += 1;
      });

      const trendArray = Object.keys(rxByDate)
        .sort((a, b) => new Date(a) - new Date(b)).slice(-7)
        .map(date => ({
          // Format tanggal disesuaikan dengan bahasa yang dipilih
          name: new Date(date).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short' }),
          rx_onu: Number((rxByDate[date].sum / rxByDate[date].count).toFixed(2))
        }));
      setTrendData(trendArray);

      const coreByOdc = {};
      rawData.forEach(row => {
        const odc = row.odc || "UNKNOWN";
        if (!coreByOdc[odc]) coreByOdc[odc] = { normal: 0, putus: 0 };
        if (row.jumlah_titik_putus > 0) coreByOdc[odc].putus += 1;
        else coreByOdc[odc].normal += 1;
      });
      const coreArray = Object.keys(coreByOdc)
        .map(odc => ({
          name: odc.length > 8 ? odc.substring(0, 8) + ".." : odc,
          normal: coreByOdc[odc].normal,
          putus: coreByOdc[odc].putus,
          total: coreByOdc[odc].normal + coreByOdc[odc].putus
        })).sort((a, b) => b.total - a.total).slice(0, 5);
      setCoreData(coreArray);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 pt-32 transition-colors">
        <p className="font-semibold text-lg animate-pulse">{t('Memuat visualisasi data...', 'Loading data visualization...')}</p>
      </div>
    );
  }

  return (
    <div className="animate-page space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-colors">
          {t('Dashboard Utama', 'Main Dashboard')}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base transition-colors">
          {t('Ringkasan performa dan telemetri jaringan fiber optik dari data OTDR.', 'Performance summary and telemetry of fiber optic networks from OTDR data.')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* KARTU 1 */}
        <div className="bg-white dark:bg-[#1A2332] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4"><FileSpreadsheet size={24} /></div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white transition-colors">{stats.totalFiles}</h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{t('Total File Upload', 'Total Files Uploaded')}</p>
          </div>
        </div>
        {/* KARTU 2 */}
        <div className="bg-white dark:bg-[#1A2332] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4"><Cable size={24} /></div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white transition-colors">{stats.totalCore}</h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{t('Total Data Core', 'Total Core Data')}</p>
          </div>
        </div>
        {/* KARTU 3 */}
        <div className="bg-white dark:bg-[#1A2332] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mb-4"><AlertTriangle size={24} /></div>
            <h3 className="text-3xl font-black text-red-600 dark:text-red-500 transition-colors">{stats.totalPutus}</h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{t('Total Titik Putus', 'Total Broken Cores')}</p>
          </div>
        </div>
        {/* KARTU 4 */}
        <div className="bg-white dark:bg-[#1A2332] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mb-4"><TrendingDown size={24} /></div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white transition-colors">{stats.avgRxOnu} <span className="text-lg font-bold text-gray-400 dark:text-gray-500">dBm</span></h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{t('Rata-rata RX ONU', 'Average RX ONU')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* GRAFIK 1 */}
        <div className="bg-white dark:bg-[#1A2332] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm transition-colors">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('Tren Rata-rata RX ONU', 'RX ONU Average Trend')}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('Pergerakan kualitas sinyal dari waktu ke waktu', 'Signal quality movement over time')}</p>
          </div>
          <div className="h-72 w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', backgroundColor: 'var(--tw-colors-gray-800)' }} labelStyle={{ fontWeight: 'bold' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  <Line type="monotone" name="RX ONU (dBm)" dataKey="rx_onu" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#dc2626' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm font-medium">{t('Data tren belum tersedia.', 'Trend data not available yet.')}</div>
            )}
          </div>
        </div>

        {/* GRAFIK 2 */}
        <div className="bg-white dark:bg-[#1A2332] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm transition-colors">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('Distribusi Status Core per ODC', 'Core Status Distribution per ODC')}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('5 Lokasi ODC dengan jumlah pengerjaan terbanyak', 'Top 5 ODC locations by workload')}</p>
          </div>
          <div className="h-72 w-full">
            {coreData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coreData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f8fafc', opacity: 0.1}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  <Bar dataKey="normal" name={t('Core Normal', 'Normal Core')} fill="#3b82f6" radius={[4, 4, 4, 4]} />
                  <Bar dataKey="putus" name={t('Core Putus', 'Broken Core')} fill="#ef4444" radius={[4, 4, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-gray-400 text-sm font-medium">{t('Data lokasi belum tersedia.', 'Location data not available yet.')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}