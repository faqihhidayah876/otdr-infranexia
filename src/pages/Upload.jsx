import { useState, useRef } from 'react';
import { Upload as UploadIcon, FileSpreadsheet, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import Button from '../components/ui/Button';
import { uploadOtdrFile } from '../utils/api';

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const [resultData, setResultData] = useState(null);
  const [metadata, setMetadata] = useState(null); // Menyimpan ODC dan Tanggal
  const [downloadUrl, setDownloadUrl] = useState(null);

  const inputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
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

  const handleUpload = async () => {
    if (!selectedFile) return;
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const response = await uploadOtdrFile(selectedFile);
      setMetadata({ odc: response.data.odc, date: response.data.date });
      setResultData(response.data.rows); 
      setDownloadUrl(response.download_url);
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(typeof error === 'string' ? error : error.message || 'Terjadi kesalahan yang tidak diketahui.');
    }
  };

  return (
   <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">Upload Data OTDR</h2>
      <p className="text-gray-500 mt-2 mb-8">Unggah file .xlsx mentah untuk dikonversi menjadi laporan redaman jaringan.</p>

      {/* Area Dropzone */}
      <div 
        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors bg-white ${
          selectedFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-red-400 hover:bg-red-50 cursor-pointer'
        }`}
        onClick={() => !selectedFile && inputRef.current?.click()}
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
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <UploadIcon size={32} />
            </div>
            <p className="font-semibold text-gray-700">Klik untuk memilih file Excel</p>
            <p className="text-sm text-gray-400 mt-1">Maksimal ukuran file 10MB</p>
          </>
        ) : (
          <div className="flex items-center gap-4 w-full max-w-md bg-white p-4 rounded-lg shadow-sm border border-green-200">
            <FileSpreadsheet className="text-green-600" size={32} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setStatus('idle'); }} className="text-gray-400 hover:text-red-500">
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Notifikasi Error */}
      {status === 'error' && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Tombol Aksi */}
      {selectedFile && status !== 'success' && (
        <div className="mt-8 flex justify-end">
          <Button onClick={handleUpload} disabled={status === 'loading'} className="flex items-center gap-2">
            {status === 'loading' ? <Loader2 className="animate-spin" size={20} /> : <UploadIcon size={20} />}
            {status === 'loading' ? 'Memproses Data...' : 'Mulai Kalkulasi'}
          </Button>
        </div>
      )}

      {/* Tampilan Sukses dengan Tabel - dengan max-height dan sticky header */}
      {status === 'success' && resultData && (
        <div className="mt-8 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-green-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle size={24} />
              <div>
                <h3 className="text-lg font-bold">Kalkulasi Selesai!</h3>
                {metadata && <p className="text-sm text-green-600">ST0: {metadata.odc} | Tanggal: {metadata.date}</p>}
              </div>
            </div>
            {downloadUrl && (
              <a href={downloadUrl} download>
                <Button className="bg-green-600 hover:bg-green-700 text-sm py-1.5 whitespace-nowrap">
                  Download File Excel (.xlsx)
                </Button>
              </a>
            )}
          </div>
          
          {/* MODIFIKASI: wrapper dengan batas tinggi dan scroll vertikal */}
          <div className="max-h-[400px] overflow-y-auto overflow-x-auto border-t border-gray-100">
            <table className="w-full text-sm text-left text-gray-600 relative">
              {/* MODIFIKASI: thead sticky dengan shadow */}
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
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${row.events.includes('end') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {row.events.includes('end') ? '1' : '0'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.events.filter(e => typeof e === 'number').length}
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