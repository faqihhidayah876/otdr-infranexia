import { useState, useRef, useEffect, useContext } from 'react';
import { Upload as UploadIcon, FileSpreadsheet, Loader2, CheckCircle, AlertCircle, X, Download, Search, ChevronLeft, ChevronRight, Sparkles, Bot } from 'lucide-react';
import { uploadOtdrFile } from '../utils/api';
import { AppContext } from '../App'; // 1. IMPORT CONTEXT

// --- KOMPONEN EFEK MENGETIK ALA AI ---
const TypewriterEffect = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    setDisplayedText(''); let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) { setDisplayedText((prev) => prev + text.charAt(i)); i++; } 
      else { clearInterval(timer); }
    }, 25);
    return () => clearInterval(timer);
  }, [text]);
  return <span>{displayedText}</span>;
};

export default function Upload() {
  const { t } = useContext(AppContext); // 2. PANGGIL t
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState('idle'); 
  const [errorMessage, setErrorMessage] = useState('');
  const [resultData, setResultData] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false); 
  const [insightText, setInsightText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const inputRef = useRef(null);

  const validateAndSetFile = (file) => {
    if (file) {
      const fileNameLower = file.name.toLowerCase();
      if (!fileNameLower.endsWith('.xlsx') && !fileNameLower.endsWith('.xls')) {
        setErrorMessage(t('Hanya format Excel (.xlsx / .xls) yang diizinkan.', 'Only Excel formats (.xlsx / .xls) are allowed.'));
        return;
      }
      setSelectedFile(file); setErrorMessage(''); setStatus('idle'); setResultData(null); setSearchTerm(''); setCurrentPage(1); setInsightText('');
    }
  };

  const handleFileSelect = (e) => validateAndSetFile(e.target.files[0]);
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) validateAndSetFile(e.dataTransfer.files[0]);
  };

  // Logika Insight Dwibahasa
  const generateInsight = (data) => {
    let putus = 0; let redamanTinggi = 0;
    data.forEach(row => {
      if (row.events && row.events.includes('end')) putus++;
      if (row.redaman_core > 6.0) redamanTinggi++;
    });

    if (putus > 0 || redamanTinggi > 0) {
      return t(
        `⚠️ Peringatan Kritis: Terdeteksi ${putus} titik core putus dan ${redamanTinggi} core dengan nilai redaman tidak normal (di atas 6 dB). Jaringan ini membutuhkan tindakan perbaikan dan pemeliharaan segera pada titik-titik anomali tersebut.`,
        `⚠️ Critical Warning: Detected ${putus} broken core points and ${redamanTinggi} cores with abnormal attenuation values (above 6 dB). This network requires immediate repair and maintenance actions at these anomaly points.`
      );
    } else {
      return t(
        `✅ Status Jaringan Optimal: Tidak terdeteksi anomali titik putus maupun redaman tinggi yang melebihi batas wajar. Kualitas redaman pada area ini stabil dan memenuhi standar keamanan Infranexia.`,
        `✅ Optimal Network Status: No broken point anomalies or high attenuation exceeding normal limits were detected. The attenuation quality in this area is stable and meets Infranexia's safety standards.`
      );
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setStatus('loading'); setErrorMessage('');
    try {
      const response = await uploadOtdrFile(selectedFile);
      const payload = response.data ? response.data : response;
      setMetadata({ odc: payload.odc || '-', date: payload.date || '-' });
      setResultData(payload.rows); 
      setDownloadUrl(response.download_url || payload.download_url || null);
      setInsightText(generateInsight(payload.rows));
      setStatus('success'); setCurrentPage(1);
    } catch (error) {
      setStatus('error'); setErrorMessage(typeof error === 'string' ? error : t('Gagal memproses file.', 'Failed to process file.'));
    }
  };

  const handleTanyaAI = () => {
    const aiMessage = t(
      `Tolong bantu saya menganalisa lebih dalam hasil kalkulasi data OTDR ini. Ringkasan sistem menunjukkan: "${insightText}"`,
      `Please help me analyze the calculation results of this OTDR data deeper. The system summary shows: "${insightText}"`
    );
    window.dispatchEvent(new CustomEvent('trigger-chatbot', { detail: aiMessage }));
  };

  const filteredResult = resultData?.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (item.filename && item.filename.toLowerCase().includes(searchLower)) || (item.fiber && item.fiber.toLowerCase().includes(searchLower));
  }) || [];
  const totalPages = Math.ceil(filteredResult.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentResult = filteredResult.slice(startIndex, startIndex + itemsPerPage);
  const handleSearch = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };

  return (
    <div className="animate-page space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t('Upload Data OTDR', 'Upload OTDR Data')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base max-w-2xl">{t('Unggah file .xlsx mentah untuk dikonversi secara otomatis.', 'Upload raw .xlsx files to be converted automatically.')}</p>
      </div>

      <div 
        className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center transition-all duration-300 relative z-10 ${isDragging ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20 scale-[1.01]' : selectedFile ? 'border-green-400 bg-green-50/30 dark:bg-green-900/10' : 'border-gray-300 dark:border-gray-700 bg-gray-50/30 dark:bg-[#1A2332]/50 hover:border-red-300 dark:hover:border-red-500 cursor-pointer'}`}
        onClick={() => !selectedFile && inputRef.current?.click()} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
      >
        <input type="file" ref={inputRef} className="hidden" accept=".xlsx, .xls" onChange={handleFileSelect} />
        {!selectedFile ? (
          <>
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 transition-colors shadow-sm ${isDragging ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' : 'bg-white dark:bg-gray-800 text-red-500 border border-gray-100 dark:border-gray-700'}`}><UploadIcon size={36} strokeWidth={1.5} /></div>
            <p className="font-bold text-gray-800 dark:text-gray-200 text-center text-lg">{isDragging ? t('Lepaskan file di sini...', 'Drop file here...') : t('Tarik & Lepas file Excel', 'Drag & Drop Excel file')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">{t('Atau klik untuk mencari file (Maks 10MB)', 'Or click to browse file (Max 10MB)')}</p>
          </>
        ) : (
          <div className="flex items-center gap-4 w-full max-w-md bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-green-100 dark:border-green-900/30 relative z-20">
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400"><FileSpreadsheet size={28} /></div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 dark:text-white truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setStatus('idle'); setResultData(null); setInsightText(''); }} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><X size={20} /></button>
          </div>
        )}
      </div>

      {status === 'error' && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3 relative z-10"><AlertCircle size={20} className="shrink-0" /><p className="font-medium text-sm">{errorMessage}</p></div>
      )}

      {selectedFile && status !== 'success' && (
        <div className="flex justify-end relative z-50">
          <button type="button" onClick={handleUpload} disabled={status === 'loading'} className="flex items-center gap-2 px-6 py-3.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-md shadow-red-600/20 disabled:opacity-50">
            {status === 'loading' ? <Loader2 className="animate-spin" size={20} /> : <UploadIcon size={20} />}
            {status === 'loading' ? t('Memproses Data & Menganalisa...', 'Processing & Analyzing Data...') : t('Mulai Kalkulasi', 'Start Calculation')}
          </button>
        </div>
      )}

      {status === 'success' && resultData && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-[#1e293b] dark:to-[#0f172a] border border-blue-100 dark:border-blue-900/50 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={80} className="text-blue-600" /></div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm border border-blue-100 dark:border-gray-700 shrink-0"><Sparkles size={24} className="text-blue-600 dark:text-blue-400" /></div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-lg">
                  {t('Ringkasan Analisa Sistem', 'System Analysis Summary')}
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 text-[10px] uppercase tracking-wider font-bold">Auto-Generated</span>
                </h3>
                <div className="text-gray-700 dark:text-gray-300 mt-2 text-sm leading-relaxed min-h-[40px] font-medium"><TypewriterEffect text={insightText} /></div>
                <div className="mt-5">
                  <button onClick={handleTanyaAI} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-blue-200 dark:border-gray-700 text-blue-700 dark:text-blue-400 hover:bg-blue-600 hover:dark:bg-blue-600 hover:text-white hover:border-blue-600 rounded-xl transition-all shadow-sm text-sm font-bold group">
                    <Bot size={18} className="group-hover:animate-bounce" /> {t('Analisa dengan AI', 'Analize with AI')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A2332] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1A2332] flex flex-col md:flex-row justify-between gap-4 items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center"><CheckCircle size={20} /></div>
                <div><h3 className="text-base font-bold text-gray-900 dark:text-white">{t('Data Siap!', 'Data Ready!')}</h3>{metadata && <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">STO: <span className="text-gray-800 dark:text-gray-200">{metadata.odc}</span></p>}</div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-60">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={16} className="text-gray-400" /></div>
                  <input type="text" placeholder={t('Cari Kabel / File...', 'Search Cable / File...')} value={searchTerm} onChange={handleSearch} className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                </div>
                {downloadUrl && (
                  <a href={downloadUrl} download className="w-full md:w-auto">
                    <button type="button" className="w-full bg-green-600 hover:bg-green-700 text-white text-sm px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm shadow-green-600/20"><Download size={16} /> {t('Download Laporan', 'Download Report')}</button>
                  </a>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4 font-bold">{t('Nama File', 'File Name')}</th>
                    <th className="px-6 py-4 font-bold text-center">{t('Titik Putus', 'Broken Points')}</th>
                    <th className="px-6 py-4 font-bold text-center">{t('Jml Bending', 'Total Bending')}</th>
                    <th className="px-6 py-4 font-bold text-center">{t('Loss (dB)', 'Loss (dB)')}</th>
                    <th className="px-6 py-4 font-bold text-center">{t('RX ONU', 'RX ONU')}</th>
                    <th className="px-6 py-4 font-bold text-center">{t('Redaman/Core', 'Attenuation/Core')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-[#1A2332]">
                  {currentResult.length > 0 ? currentResult.map((row, index) => {
                    const isPutus = row.events && row.events.includes('end');
                    const isRedamanTinggi = row.redaman_core > 6.0;
                    return (
                      <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{row.filename}</td>
                        <td className="px-6 py-4 text-center"><span className={`px-3 py-1 rounded-full text-xs font-bold ${isPutus ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>{isPutus ? t('Ya', 'Yes') : t('Tidak', 'No')}</span></td>
                        <td className="px-6 py-4 text-center font-semibold text-gray-700 dark:text-gray-300">{row.events ? row.events.filter(e => typeof e === 'number').length : 0}</td>
                        <td className="px-6 py-4 text-center font-medium">{row.loss_db}</td>
                        <td className="px-6 py-4 text-center font-bold text-gray-800 dark:text-gray-200">{row.estimasi_rx_onu} dBm</td>
                        <td className="px-6 py-4 text-center"><span className={`px-3 py-1 rounded-md text-xs font-bold ${isRedamanTinggi ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>{row.redaman_core} dB</span></td>
                      </tr>
                    )
                  }) : (<tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">{t('Tidak ada data kabel yang sesuai dengan pencarian.', 'No cable data matches the search.')}</td></tr>)}
                </tbody>
              </table>
            </div>
            {filteredResult.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-[#1A2332]">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('Hal', 'Page')} <span className="font-bold text-gray-800 dark:text-gray-200">{currentPage}</span> {t('dari', 'of')} <span className="font-bold text-gray-800 dark:text-gray-200">{totalPages}</span></span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"><ChevronLeft size={16} /></button>
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}