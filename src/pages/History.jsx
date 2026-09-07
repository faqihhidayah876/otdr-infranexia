import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { getHistoryData } from '../utils/api';

export default function History() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await getHistoryData();
      const rawData = response.data || [];

      const grouped = rawData.reduce((acc, curr) => {
        const timeKey = curr.created_at.substring(0, 16); 
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

  const filteredData = historyData.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const dateStr = new Date(item.upload_time).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).toLowerCase();
    return (
      (item.odc && item.odc.toLowerCase().includes(searchLower)) ||
      dateStr.includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  return (
    <div className="animate-page space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Riwayat Kalkulasi</h2>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Daftar riwayat file Excel yang telah diproses.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Cari ODC atau Tanggal..." 
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-gray-500">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p>Memuat data riwayat...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-3 shadow-sm">
          <AlertCircle size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && filteredData.length === 0 && (
        <div className="text-center p-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
          <p className="text-gray-500 font-medium">Data tidak ditemukan.</p>
        </div>
      )}

      {!loading && !error && filteredData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
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
                {currentData.map((row) => (
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
                    <td className="px-6 py-4 text-center font-medium">{row.total_bending}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{row.avg_rx} dBm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500">
              Menampilkan <span className="font-medium text-gray-800">{startIndex + 1}</span> - <span className="font-medium text-gray-800">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> dari <span className="font-medium text-gray-800">{filteredData.length}</span> data
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-medium text-gray-600 px-2">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}