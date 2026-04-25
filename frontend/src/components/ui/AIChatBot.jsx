import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import clsx from 'clsx';

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am Silver Finn AI. Ask me about specs, fluids, torque settings, or predictive alerts for the current vehicle.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const currentSession = useStore(state => state.currentSession);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          vehicleId: currentSession?.vehicle?.id,
          history: messages.slice(1).map(m => ({ role: m.role, content: m.content }))
        })
      });
      
      const data = await res.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to parse AI response.' }]);
      }
      
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to Silver Finn API.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-105 transition-transform z-50 text-metallic-900"
        >
          <MessageSquare size={24} fill="currentColor" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[400px] h-[550px] glass-panel-active rounded-2xl flex flex-col overflow-hidden z-50 shadow-2xl animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-metallic-900 p-4 border-b border-metallic-700/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center border border-gold-500/50">
                <Bot size={18} className="text-gold-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white tracking-wide text-sm">Silver Finn AI</h3>
                <p className="text-[10px] text-gold-400 font-semibold tracking-widest uppercase">Gemini 2.0 Powered</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={clsx("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                <div className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                  msg.role === 'user' ? "bg-metallic-700 border-metallic-600" : "bg-gold-500/10 border-gold-500/30"
                )}>
                  {msg.role === 'user' ? <User size={16} className="text-slate-300" /> : <Bot size={16} className="text-gold-400" />}
                </div>
                <div className={clsx(
                  "p-3 rounded-2xl max-w-[80%] text-sm",
                  msg.role === 'user' 
                    ? "bg-metallic-700 text-white rounded-tr-sm" 
                    : "bg-metallic-800/80 border border-metallic-700/50 text-slate-300 rounded-tl-sm leading-relaxed"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-gold-400" />
                </div>
                <div className="p-3 bg-metallic-800/80 rounded-2xl rounded-tl-sm border border-metallic-700/50 flex items-center gap-2 text-slate-400 text-sm">
                  <Loader2 size={14} className="animate-spin" /> Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-metallic-900 border-t border-metallic-700/50">
            {currentSession && (
               <div className="mb-2 px-2 text-[10px] text-gold-400/80 flex items-center gap-1 font-mono">
                 Context: {currentSession.vehicle.make} {currentSession.vehicle.model}
               </div>
            )}
            <form onSubmit={handleSend} className="relative flex items-center">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about torque specs, fluids..."
                className="w-full bg-metallic-800 border border-metallic-700 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-gold-500/50 transition-colors"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 text-gold-500 hover:text-gold-400 disabled:text-metallic-600 disabled:hover:text-metallic-600 transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
