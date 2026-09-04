import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getHistoryData } from '../utils/api';

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Halo! Saya SAHAJA AI berkolaborasi dengan Infranexia. Ada yang bisa saya bantu terkait analisa data OTDR hari ini?' }
  ]);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isOpen]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = message;
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const historyRes = await getHistoryData();
      const latestData = historyRes.data ? historyRes.data.slice(0, 5) : [];

      const systemPrompt = `Kamu adalah asisten AI Infranexia yang ahli dalam menganalisa jaringan fiber optik dan hasil ukur OTDR. 
      Gunakan data 5 pengukuran terbaru berikut sebagai konteks jika user bertanya soal hasil upload mereka:
      ${JSON.stringify(latestData)}
      
      Aturan menjawab:
      1. Jawab dengan ringkas, profesional, dan to the point.
      2. Gunakan bahasa Indonesia.
      3. Jika ditanya soal data yang tidak ada di konteks, katakan kamu hanya bisa melihat data terbaru.
      4. Gunakan markdown (bold, bullet points) agar jawaban mudah dibaca.`;

      const apiUrl = import.meta.env.VITE_MISTRAL_ENDPOINT;
      const aiModel = import.meta.env.VITE_AI_MODEL;
      const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: aiModel,
          messages: [
            { role: 'system', content: systemPrompt },
            ...chatHistory.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: userMsg }
          ],
          temperature: 0.3
        })
      });

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }]);
      } else {
        throw new Error("Invalid response from Mistral");
      }
    } catch (error) {
      console.error("AI Error:", error);
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Maaf, saya sedang mengalami gangguan koneksi ke server AI Mistral. Pastikan API Key dan Endpoint valid.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div 
        className={`mb-4 transition-all duration-300 origin-bottom-right transform ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        } w-[340px] bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl overflow-hidden flex flex-col`}
        style={{ height: '480px' }}
      >
        <div className="bg-red-600/90 backdrop-blur-md px-4 py-3 flex justify-between items-center text-white border-b border-red-500/50 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-red-100" />
            <h3 className="font-semibold text-sm">SAHAJA AI Assistant</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-red-700 p-1.5 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-gradient-to-b from-white/30 to-transparent scrollbar-thin scrollbar-thumb-gray-300">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`text-sm p-3 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-red-600 text-white rounded-tl-xl rounded-bl-xl rounded-br-xl' 
                  : 'bg-white border border-gray-100 text-gray-700 rounded-tr-xl rounded-bl-xl rounded-br-xl'
              } max-w-[85%] leading-relaxed overflow-wrap-anywhere`}>
                
                {/* INI KUNCI PERUBAHANNYA: Menggunakan ReactMarkdown */}
                <div className="prose prose-sm prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl flex items-center gap-2 shadow-sm text-gray-500">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs">Menganalisa data...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 bg-white/60 border-t border-white/60 backdrop-blur-md">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full pl-4 pr-1.5 py-1.5 shadow-sm focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all">
            <input 
              type="text" 
              placeholder="Tanya soal redaman..." 
              className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button 
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
              className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 disabled:hover:bg-red-600"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="ml-auto flex items-center justify-center w-14 h-14 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full shadow-lg hover:shadow-red-500/30 hover:scale-105 transition-all duration-300"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}