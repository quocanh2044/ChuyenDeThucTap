import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { getMovieRecommendation, CINEBOOK_MOVIES } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatBot: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Chào bạn! Mình là CineBot. Bạn muốn tìm phim hay hay đặt vé phim nào hôm nay? 🍿' }
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
    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await getMovieRecommendation(currentMessages);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);

      // LOGIC CHUYỂN TRANG
      const movieMatch = responseText.match(/\[\[(.*?)\]\]/);
      if (movieMatch && movieMatch[1]) {
        const movieName = movieMatch[1].trim();
        const targetMovie = CINEBOOK_MOVIES.find(
          m => m.title.toLowerCase() === movieName.toLowerCase()
        );

        setTimeout(() => {
          if (targetMovie) {
            // Chuyển thẳng vào ID phim khớp với Route /movie/:id
            navigate(`/movie/${targetMovie.id}`); 
          } else {
            navigate(`/search?q=${encodeURIComponent(movieName)}`);
          }
          setIsOpen(false);
        }, 2000);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Dạ, em bị nghẽn mạng chút ạ!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 flex justify-between items-center text-black font-bold">
            <span>🤖 CineBook Assistant</span>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <div className="h-96 overflow-y-auto p-4 bg-gray-950">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-white'
                  }`}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          </div>
          <div className="p-3 bg-gray-900 flex gap-2 border-t border-white/5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-gray-800 rounded-xl px-4 py-2 text-white outline-none"
              placeholder="Nhắn tin..."
            />
            <button onClick={handleSend} className="bg-yellow-500 p-2 rounded-xl">🚀</button>
          </div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="bg-yellow-500 p-4 rounded-full shadow-lg text-2xl">
        {isOpen ? '✕' : '✨'}
      </button>
    </div>
  );
};

export default ChatBot;