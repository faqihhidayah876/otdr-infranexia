import { useState, useEffect } from 'react';
import { Clock, Loader2, AlertCircle } from 'lucide-react';
import { getHistoryData } from '../utils/api';

export default function History() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await getHistoryData();
      const rawData = response.data || [];

      // Kelompokkan data berdasarkan menit upload dan ODC
      const grouped = rawData.reduce((acc, curr) => {
        const timeKey = curr.created_at.substring(0, 16); // YYYY-MM-DD HH:mm
        const key = `${timeKey}_${curr.odc}`;

        if (!acc[key]) {
          acc[key] = {
            id: key,
            upload_time: curr.created_at,
            odc: curr.odc,
            jumlah_core: 0,
            total_putus: 0,
            total_bending: 0,
            sum_rx: 0
          };
        }
        
        acc[key].jumlah_core += 1;
        acc[key].total_putus += (curr.jumlah_titik_putus > 0 ? 1 : 0);
        acc[key].total_bending += curr.jumlah_bending;
        acc[key].sum_rx += curr.estimasi_rx_onu;
        
        return acc;
      }, {});

      // Ubah menjadi array dan hitung rata-rata RX
      const historyArray = Object.values(grouped).map(item => ({
        ...item,
        avg_rx: (item.sum_rx / item.jumlah_core).toFixed(2)
      })).sort((a, b) => new Date(b.upload_time) - new Date(a.upload_time));

      setHistoryData(historyArray);
      setError('');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Gagal memuat data riwayat.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Clock className="text-red-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">Riwayat Kalkulasi</h2>
      </div>
      <p className="text-gray-500 mb-8">Daftar riwayat file Excel yang telah diunggah dan diproses oleh sistem.</p>

      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-gray-500">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p>Memuat data riwayat...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && historyData.length === 0 && (
        <div className="text-center p-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
          <p className="text-gray-500">Belum ada data riwayat kalkulasi. Silakan lakukan upload terlebih dahulu.</p>
        </div>
      )}

      {!loading && !error && historyData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Waktu Upload</th>
                  <th className="px-6 py-4 font-semibold">Lokasi (ODC)</th>
                  <th className="px-6 py-4 font-semibold text-center">Total Core</th>
                  <th className="px-6 py-4 font-semibold text-center">Core Putus</th>
                  <th className="px-6 py-4 font-semibold text-center">Total Bending</th>
                  <th className="px-6 py-4 font-semibold">Rata-rata RX ONU</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historyData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(row.upload_time).toLocaleString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{row.odc || '-'}</td>
                    <td className="px-6 py-4 text-center font-bold text-blue-600">
                      {row.jumlah_core} Data
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${row.total_putus > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {row.total_putus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">{row.total_bending}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{row.avg_rx} dBm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}