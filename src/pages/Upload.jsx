import { useState, useRef } from 'react';
import { Upload as UploadIcon, FileSpreadsheet, Loader2, CheckCircle, AlertCircle, X, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { uploadOtdrFile } from '../utils/api';

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState('idle'); 
  const [errorMessage, setErrorMessage] = useState('');
  const [resultData, setResultData] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false); 

  // State untuk Fitur Search & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const inputRef = useRef(null);

  const validateAndSetFile = (file) => {
    if (file) {
      const fileNameLower = file.name.toLowerCase();
      if (!fileNameLower.endsWith('.xlsx') && !fileNameLower.endsWith('.xls')) {
        setErrorMessage('Hanya format Excel (.xlsx / .xls) yang diizinkan.');
        return;
      }
      setSelectedFile(file);
      setErrorMessage('');
      setStatus('idle');
      setResultData(null); // Reset hasil tabel jika file baru dipilih
      setSearchTerm('');
      setCurrentPage(1);
    }
  };

  const handleFileSelect = (e) => validateAndSetFile(e.target.files[0]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Silakan pilih file terlebih dahulu.");
      return;
    }
    
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const response = await uploadOtdrFile(selectedFile);
      const payload = response.data ? response.data : response;

      if (!payload || !payload.rows) {
        throw new Error("Struktur data dari server tidak sesuai.");
      }

      setMetadata({ 
        odc: payload.odc || '-', 
        date: payload.date || '-' 
      });
      setResultData(payload.rows); 
      setDownloadUrl(response.download_url || payload.download_url || null);
      
      setStatus('success');
      setCurrentPage(1); // Reset page saat hasil baru muncul
    } catch (error) {
      setStatus('error');
      setErrorMessage(typeof error === 'string' ? error : error.message || 'Gagal menghubungi server. Periksa koneksi atau URL API.');
    }
  };

  // Logika Filter & Pencarian untuk Tabel Hasil
  const filteredResult = resultData?.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (item.filename && item.filename.toLowerCase().includes(searchLower)) ||
      (item.fiber && item.fiber.toLowerCase().includes(searchLower))
    );
  }) || [];

  // Logika Pagination untuk Tabel Hasil
  const totalPages = Math.ceil(filteredResult.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentResult = filteredResult.slice(startIndex, startIndex + itemsPerPage);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-5xl mx-auto relative animate-page">
      <h2 className="text-2xl font-bold text-gray-800">Upload Data OTDR</h2>
      <p className="text-gray-500 mt-2 mb-8">Unggah file .xlsx mentah untuk dikonversi menjadi laporan redaman jaringan.</p>

      {/* Area Dropzone */}
      <div 
        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all duration-300 relative z-10 ${
          isDragging ? 'border-red-500 bg-red-50 scale-[1.02]' 
            : selectedFile ? 'border-green-500 bg-green-50' 
            : 'border-gray-300 hover:border-red-400 hover:bg-red-50/50 cursor-pointer'
        }`}
        onClick={() => !selectedFile && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={inputRef} 
          className="hidden" 
          accept=".xlsx, .xls"
          onChange={handleFileSelect}
        />

        {!selectedFile ? (
          <>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-red-200 text-red-700' : 'bg-red-100 text-red-600'}`}>
              <UploadIcon size={32} />
            </div>
            <p className="font-semibold text-gray-700 text-center">
              {isDragging ? 'Lepaskan file di sini...' : 'Tarik & Lepas (Drag & Drop) file Excel ke sini'}
            </p>
            <p className="text-sm text-gray-400 mt-1">Atau klik untuk mencari file (Maks 10MB)</p>
          </>
        ) : (
          <div className="flex items-center gap-4 w-full max-w-md bg-white p-4 rounded-lg shadow-sm border border-green-200 relative z-20">
            <FileSpreadsheet className="text-green-600" size={32} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button 
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                setSelectedFile(null); 
                setStatus('idle'); 
                setResultData(null);
                if (inputRef.current) inputRef.current.value = ''; 
              }} 
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      {status === 'error' && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-3 relative z-10">
          <AlertCircle size={20} className="shrink-0" />
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      {selectedFile && status !== 'success' && (
        <div className="mt-8 flex justify-end relative z-50">
          <button 
            type="button"
            onClick={handleUpload} 
            disabled={status === 'loading'} 
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? <Loader2 className="animate-spin" size={20} /> : <UploadIcon size={20} />}
            {status === 'loading' ? 'Memproses Data...' : 'Mulai Kalkulasi'}
          </button>
        </div>
      )}

      {/* Tampilan Sukses (Dengan Tabel) */}
      {status === 'success' && resultData && (
        <div className="mt-8 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden relative z-10 flex flex-col">
          <div className="p-6 border-b border-gray-200 bg-green-50 flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle size={28} />
              <div>
                <h3 className="text-lg font-bold">Kalkulasi Selesai!</h3>
                {metadata && <p className="text-sm text-green-600 font-medium">ST0: {metadata.odc} | Tanggal: {metadata.date}</p>}
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Input Pencarian Khusus di Tabel Hasil */}
              <div className="relative w-full md:w-60">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Cari Kabel / File..." 
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
                />
              </div>

              {downloadUrl ? (
                <a href={downloadUrl} download className="w-full md:w-auto">
                  <button type="button" className="w-full bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors">
                    <Download size={16} /> Download Excel
                  </button>
                </a>
              ) : (
                <button type="button" className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold">
                  <CheckCircle size={16} /> Laporan Tersimpan
                </button>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto border-t border-gray-100">
            <table className="w-full text-sm text-left text-gray-600 relative">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nama File</th>
                  <th className="px-6 py-4 font-semibold">Fiber</th>
                  <th className="px-6 py-4 font-semibold text-center">Titik Putus</th>
                  <th className="px-6 py-4 font-semibold text-center">Jml Bending</th>
                  <th className="px-6 py-4 font-semibold">Loss (dB)</th>
                  <th className="px-6 py-4 font-semibold">Estimasi RX ONU</th>
                  <th className="px-6 py-4 font-semibold">Redaman/Core</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {currentResult.length > 0 ? currentResult.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{row.filename}</td>
                    <td className="px-6 py-4">{row.fiber || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${row.events && row.events.includes('end') ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                        {row.events && row.events.includes('end') ? '1' : '0'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-gray-700">{row.events ? row.events.filter(e => typeof e === 'number').length : 0}</span>
                    </td>
                    <td className="px-6 py-4">{row.loss_db}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{row.estimasi_rx_onu} dBm</td>
                    <td className="px-6 py-4">{row.redaman_core} dB</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500 font-medium bg-gray-50/50">
                      Tidak ada data kabel yang sesuai dengan pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Kontrol Pagination */}
          {filteredResult.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="text-sm text-gray-500">
                Menampilkan <span className="font-medium text-gray-800">{startIndex + 1}</span> - <span className="font-medium text-gray-800">{Math.min(startIndex + itemsPerPage, filteredResult.length)}</span> dari <span className="font-medium text-gray-800">{filteredResult.length}</span> baris
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
                  Hal {currentPage} / {totalPages}
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
          )}
        </div>
      )}
    </div>
  );
}