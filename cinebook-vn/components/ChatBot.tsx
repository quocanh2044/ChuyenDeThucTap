import React, { useState, useRef, useEffect } from 'react';
import { getMovieRecommendation } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Xin chào! Tôi là AI tư vấn phim của CineBook. Bạn đang muốn xem phim thể loại gì hôm nay?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await getMovieRecommendation(input);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-cinema-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in-up">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 flex justify-between items-center">
            <h3 className="font-bold text-black flex items-center gap-2">
              <span>🤖</span> CineBook AI Assistant
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-black/60 hover:text-black">
              ✕
            </button>
          </div>
          
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-cinema-900/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-yellow-500 text-black rounded-tr-none' 
                      : 'bg-cinema-800 border border-gray-700 text-gray-200 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-cinema-800 border border-gray-700 p-3 rounded-2xl rounded-tl-none">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="p-3 bg-cinema-800 border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Hỏi về phim..."
              className="flex-1 bg-cinema-900 border border-gray-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="bg-yellow-500 text-black rounded-full p-2 hover:bg-yellow-400 disabled:opacity-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full p-4 shadow-lg shadow-yellow-500/30 transition-all hover:scale-105"
      >
        <span className="text-2xl">✨</span>
        <span className={`font-bold ${isOpen ? 'hidden' : 'block'}`}>Hỏi AI</span>
      </button>
    </div>
  );
};

export default ChatBot;