import { useState, useRef } from 'react';
import { Upload as UploadIcon, FileSpreadsheet, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import Button from '../components/ui/Button';
import { uploadOtdrFile } from '../utils/api';

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const [resultData, setResultData] = useState(null);
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
    
    try {
      const response = await uploadOtdrFile(selectedFile);
      setResultData(response.data);
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
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

      {/* Tampilan Sukses */}
      {status === 'success' && resultData && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-3 text-green-700 mb-4">
            <CheckCircle size={24} />
            <h3 className="text-lg font-bold">Kalkulasi Berhasil!</h3>
          </div>
          <pre className="bg-white p-4 rounded text-sm text-gray-600 overflow-x-auto shadow-inner">
            {JSON.stringify(resultData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}