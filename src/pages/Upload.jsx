import { useState, useRef } from 'react';
import { Upload as UploadIcon, FileSpreadsheet, Loader2, CheckCircle, AlertCircle, X, Download } from 'lucide-react';
import Button from '../components/ui/Button'; 
import { uploadOtdrFile } from '../utils/api';

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const [resultData, setResultData] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  
  // State untuk efek Drag & Drop
  const [isDragging, setIsDragging] = useState(false); 

  const inputRef = useRef(null);

  // Fungsi validasi file (dipakai saat diklik atau saat drag & drop)
  const validateAndSetFile = (file) => {
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setErrorMessage('Hanya format Excel (.xlsx / .xls) yang diizinkan.');
        return;
      }
      setSelectedFile(file);
      setErrorMessage('');
      setStatus('idle');
    }
  };

  const handleFileSelect = (e) => validateAndSetFile(e.target.files[0]);

  // --- LOGIKA DRAG AND DROP ---
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };
  // -----------------------------

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setStatus('loading');
    setErrorMessage('');
    
    try {
      console.log("Mengirim file ke server...");
      const response = await uploadOtdrFile(selectedFile);
      console.log("Respon asli dari server:", response);
      
      // PERBAIKAN FATAL: Membaca struktur respons dengan aman
      // Jika di api.js sudah mereturn 'response.data', maka variabel 'response' di sini ADALAH datanya
      const payload = response.data ? response.data : response;

      // Cek apakah data baris (rows) benar-benar ada
      if (!payload || !payload.rows) {
        throw new Error("Gagal membaca struktur tabel dari server.");
      }

      setMetadata({ 
        odc: payload.odc || 'ODC Tidak Diketahui', 
        date: payload.date || '-' 
      });
      setResultData(payload.rows); 
      
      // Ambil URL download (antisipasi kalau letaknya di root atau di dalam data)
      setDownloadUrl(response.download_url || payload.download_url || null);
      
      setStatus('success');
    } catch (error) {
      console.error("Detail Error Upload:", error);
      setStatus('error');
      setErrorMessage(typeof error === 'string' ? error : error.message || 'Terjadi kesalahan saat memproses data ke server.');
    }
  };

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">Upload Data OTDR</h2>
      <p className="text-gray-500 mt-2 mb-8">Unggah file .xlsx mentah untuk dikonversi menjadi laporan redaman jaringan.</p>

      {/* Area Dropzone dengan Drag & Drop */}
      <div 
        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all duration-300 relative ${
          isDragging 
            ? 'border-red-500 bg-red-50 scale-[1.02]' 
            : selectedFile 
              ? 'border-green-500 bg-green-50' 
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
          <div className="flex items-center gap-4 w-full max-w-md bg-white p-4 rounded-lg shadow-sm border border-green-200">
            <FileSpreadsheet className="text-green-600" size={32} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setSelectedFile(null); 
                setStatus('idle'); 
                if (inputRef.current) inputRef.current.value = ''; 
              }} 
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Notifikasi Error */}
      {status === 'error' && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Tombol Aksi (Menggunakan komponen kustom bawaanmu) */}
      {selectedFile && status !== 'success' && (
        <div className="mt-8 flex justify-end">
          <Button onClick={handleUpload} disabled={status === 'loading'} className="flex items-center gap-2 px-6 py-3">
            {status === 'loading' ? <Loader2 className="animate-spin" size={20} /> : <UploadIcon size={20} />}
            {status === 'loading' ? 'Memproses Data...' : 'Mulai Kalkulasi'}
          </Button>
        </div>
      )}

      {/* Tampilan Sukses (Dengan Tabel Scrollable) */}
      {status === 'success' && resultData && (
        <div className="mt-8 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-green-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle size={28} />
              <div>
                <h3 className="text-lg font-bold">Kalkulasi Selesai!</h3>
                {metadata && <p className="text-sm text-green-600 font-medium">ST0: {metadata.odc} | Tanggal: {metadata.date}</p>}
              </div>
            </div>
            
            {/* Tombol Download Laporan Excel */}
            {downloadUrl ? (
              <a href={downloadUrl} download>
                <Button className="bg-green-600 hover:bg-green-700 text-sm py-2 flex items-center gap-2">
                  <Download size={16} /> Download File Excel
                </Button>
              </a>
            ) : (
              <Button className="bg-green-600 hover:bg-green-700 text-sm py-2 flex items-center gap-2">
                <CheckCircle size={16} /> Laporan Tersimpan
              </Button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto overflow-x-auto border-t border-gray-100">
            <table className="w-full text-sm text-left text-gray-600 relative">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10 shadow-sm">
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
                {resultData.map((row, index) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}