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
      setHistoryData(response.data);
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
      <p className="text-gray-500 mb-8">Semua data hasil kalkulasi redaman fiber optik yang tersimpan di sistem.</p>

      {/* State Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-gray-500">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p>Memuat data riwayat...</p>
        </div>
      )}

      {/* State Error */}
      {error && !loading && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* State Kosong */}
      {!loading && !error && historyData.length === 0 && (
        <div className="text-center p-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
          <p className="text-gray-500">Belum ada data riwayat kalkulasi. Silakan lakukan upload terlebih dahulu.</p>
        </div>
      )}

      {/* Tabel Data History */}
      {!loading && !error && historyData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Waktu Upload</th>
                  <th className="px-6 py-4 font-semibold">Nama File</th>
                  <th className="px-6 py-4 font-semibold">ODC</th>
                  <th className="px-6 py-4 font-semibold text-center">Titik Putus</th>
                  <th className="px-6 py-4 font-semibold text-center">Total Bending</th>
                  <th className="px-6 py-4 font-semibold">Loss (dB)</th>
                  <th className="px-6 py-4 font-semibold">Estimasi RX</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historyData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(row.created_at).toLocaleString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{row.filename}</td>
                    <td className="px-6 py-4">{row.odc || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${row.jumlah_titik_putus > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {row.jumlah_titik_putus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">{row.jumlah_bending}</td>
                    <td className="px-6 py-4">{row.loss}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{row.estimasi_rx_onu} dBm</td>
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