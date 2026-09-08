import { useState, useEffect, useContext } from 'react';
import { Loader2, AlertCircle, Search, ChevronLeft, ChevronRight, X, FileSpreadsheet, Activity, AlertTriangle } from 'lucide-react';
import { getHistoryData } from '../utils/api';
import { AppContext } from '../App';

export default function History() {
  const { t, lang } = useContext(AppContext);
  const [rawData, setRawData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [modalSearch, setModalSearch] = useState('');
  const [modalPage, setModalPage] = useState(1);
  const modalItemsPerPage = 8;

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await getHistoryData();
      const raw = response.data || [];
      setRawData(raw);

      const grouped = raw.reduce((acc, curr) => {
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
            sum_rx: 0,
          };
        }
        acc[key].jumlah_core += 1;
        acc[key].total_putus += curr.jumlah_titik_putus > 0 ? 1 : 0;
        acc[key].total_bending += curr.jumlah_bending;
        acc[key].sum_rx += curr.estimasi_rx_onu;
        return acc;
      }, {});

      const historyArray = Object.values(grouped)
        .map((item) => ({
          ...item,
          avg_rx: (item.sum_rx / item.jumlah_core).toFixed(2),
        }))
        .sort((a, b) => new Date(b.upload_time) - new Date(a.upload_time));

      setHistoryData(historyArray);
      setError('');
    } catch (err) {
      setError(
        typeof err === 'string'
          ? err
          : t('Gagal memuat data riwayat.', 'Failed to load history data.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (summaryRow) => {
    const timeKey = summaryRow.id.split('_')[0];
    const detailRows = rawData.filter(
      (item) =>
        item.created_at.substring(0, 16) === timeKey && item.odc === summaryRow.odc
    );
    setSelectedDetail({ summary: summaryRow, details: detailRows });
    setModalSearch('');
    setModalPage(1);
  };

  const filteredData = historyData.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const dateStr = new Date(item.upload_time).toLocaleString(
      lang === 'id' ? 'id-ID' : 'en-US',
      { day: '2-digit', month: 'short', year: 'numeric' }
    ).toLowerCase();
    return (
      (item.odc && item.odc.toLowerCase().includes(searchLower)) ||
      dateStr.includes(searchLower)
    );
  });
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const filteredModalDetails =
    selectedDetail?.details.filter((item) => {
      const search = modalSearch.toLowerCase();
      return (
        (item.filename && item.filename.toLowerCase().includes(search)) ||
        (item.fiber && item.fiber.toLowerCase().includes(search))
      );
    }) || [];
  const modalTotalPages = Math.ceil(filteredModalDetails.length / modalItemsPerPage);
  const modalStartIndex = (modalPage - 1) * modalItemsPerPage;
  const currentModalData = filteredModalDetails.slice(
    modalStartIndex,
    modalStartIndex + modalItemsPerPage
  );

  return (
    <>
      <div className="animate-page space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {t('Riwayat Kalkulasi', 'Calculation History')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base">
              {t(
                'Daftar riwayat file Excel yang telah diproses. Klik baris untuk melihat detail.',
                'List of processed Excel files history. Click a row to view details.'
              )}
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('Cari ODC atau Tanggal...', 'Search ODC or Date...')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1A2332] border border-gray-200 dark:border-gray-800 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* LOADING: hanya tulisan */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-20 text-gray-500 dark:text-gray-400">
            <p className="font-medium text-lg">
              {t('Memuat data riwayat...', 'Loading history data...')}
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3 animate-in fade-in">
            <AlertCircle size={20} />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white dark:bg-[#1A2332] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4 font-bold">
                      {t('Waktu Upload', 'Upload Time')}
                    </th>
                    <th className="px-6 py-4 font-bold">
                      {t('Lokasi (ODC)', 'Location (ODC)')}
                    </th>
                    <th className="px-6 py-4 font-bold text-center">
                      {t('Total Core', 'Total Core')}
                    </th>
                    <th className="px-6 py-4 font-bold text-center">
                      {t('Core Putus', 'Broken Core')}
                    </th>
                    <th className="px-6 py-4 font-bold">
                      {t('Rata-rata RX ONU', 'Average RX ONU')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {currentData.length > 0 ? (
                    currentData.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => handleRowClick(row)}
                        className="hover:bg-red-50/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                        title={t('Klik untuk melihat detail kabel', 'Click to view cable details')}
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700 dark:text-gray-300">
                          {new Date(row.upload_time).toLocaleString(
                            lang === 'id' ? 'id-ID' : 'en-US',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                          {row.odc || '-'}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-blue-600 dark:text-blue-400">
                          {row.jumlah_core}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              row.total_putus > 0
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            }`}
                          >
                            {row.total_putus > 0
                              ? `${row.total_putus} ${t('Putus', 'Broken')}`
                              : t('Aman', 'Safe')}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">
                          {row.avg_rx} dBm
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center text-gray-500 font-medium"
                      >
                        {t('Data tidak ditemukan.', 'No data found.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredData.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-[#1A2332]">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('Hal', 'Page')}{' '}
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {currentPage}
                  </span>{' '}
                  /{' '}
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {totalPages}
                  </span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL DETAIL POP-UP */}
      {selectedDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A2332] rounded-3xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white dark:border-gray-700">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 shadow-sm">
                  <FileSpreadsheet size={24} />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">
                    {t('Detail Laporan OTDR', 'OTDR Report Details')}
                  </h3>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    STO:{' '}
                    <span className="text-gray-800 dark:text-gray-200 font-bold">
                      {selectedDetail.summary.odc}
                    </span>{' '}
                    • {t('Tanggal:', 'Date:')}{' '}
                    {new Date(selectedDetail.summary.upload_time).toLocaleDateString(
                      lang === 'id' ? 'id-ID' : 'en-US'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder={t('Cari kabel...', 'Search cable...')}
                    value={modalSearch}
                    onChange={(e) => {
                      setModalSearch(e.target.value);
                      setModalPage(1);
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  />
                </div>
                <button
                  onClick={() => setSelectedDetail(null)}
                  className="p-2 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-gray-200 dark:border-gray-700 hover:border-red-200 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-0">
              <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50/80 dark:bg-gray-800/80 sticky top-0 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-10">
                  <tr>
                    <th className="px-6 py-4 font-bold">
                      {t('Kabel / Fiber', 'Cable / Fiber')}
                    </th>
                    <th className="px-6 py-4 font-bold text-center">
                      {t('Titik Putus', 'Broken Points')}
                    </th>
                    <th className="px-6 py-4 font-bold text-center">
                      {t('Bending', 'Bending')}
                    </th>
                    <th className="px-6 py-4 font-bold text-center">
                      {t('RX ONU', 'RX ONU')}
                    </th>
                    <th className="px-6 py-4 font-bold text-center">
                      {t('Redaman/Core', 'Attenuation/Core')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {currentModalData.length > 0 ? (
                    currentModalData.map((row, index) => {
                      // Fallback untuk nilai redaman
                      const redamanValue = row.redaman_core ?? row.loss ?? 0;
                      const isPutus = row.jumlah_titik_putus > 0;
                      const isRedamanTinggi = redamanValue > 6.0;

                      return (
                        <tr
                          key={index}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {row.filename}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {row.fiber}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                isPutus
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                              }`}
                            >
                              {isPutus ? t('Ya', 'Yes') : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-gray-700 dark:text-gray-300">
                            {row.jumlah_bending}
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white">
                            {row.estimasi_rx_onu} dBm
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center">
                              <span
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${
                                  isRedamanTinggi
                                    ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700/50'
                                    : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                                }`}
                              >
                                {isRedamanTinggi ? (
                                  <AlertTriangle
                                    size={14}
                                    className="text-yellow-600 dark:text-yellow-500"
                                  />
                                ) : (
                                  <Activity
                                    size={14}
                                    className="text-blue-500 dark:text-blue-400"
                                  />
                                )}
                                {redamanValue} dB
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        {t(
                          'Tidak ada detail kabel yang cocok.',
                          'No matching cable details found.'
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center shrink-0">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {t('Menampilkan', 'Showing')} {currentModalData.length}{' '}
                {t('dari', 'of')} {filteredModalDetails.length}{' '}
                {t('baris data', 'rows of data')}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setModalPage((prev) => Math.max(prev - 1, 1))}
                  disabled={modalPage === 1}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() =>
                    setModalPage((prev) => Math.min(prev + 1, modalTotalPages))
                  }
                  disabled={modalPage === modalTotalPages}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}