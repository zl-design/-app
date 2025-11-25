
import React, { useState, useRef, useEffect } from 'react';
import { askOracle } from '../services/geminiService';
import { Send, Sparkles, Bot, User, ScrollText, AlertCircle } from 'lucide-react';
import { BaziAnalysis } from '../types';

interface Msg {
    role: 'user' | 'model';
    text: string;
}

interface ChatViewProps {
    currentBazi: BaziAnalysis | null;
    onRequestBazi: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ currentBazi, onRequestBazi }) => {
    const [messages, setMessages] = useState<Msg[]>([
        { role: 'model', text: "欢迎来到玄机阁。我是您的智能玄学助手。关于命运、抉择、或人生困惑，请尽管问我。" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (currentBazi && messages.length === 1) {
            setMessages([
                { role: 'model', text: `欢迎来到玄机阁。我已经读取了您的命盘（${currentBazi.chart.dayMasterElement}命，${currentBazi.chart.structure}），您可以问我关于事业、感情或流年的任何问题，我会结合您的喜忌为您解答。` }
            ]);
        }
    }, [currentBazi]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const response = await askOracle(history, userMsg, currentBazi);
            setMessages(prev => [...prev, { role: 'model', text: response }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'model', text: "连接天机中断，请重试。" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-[calc(100vh-80px)] flex flex-col animate-fade-in relative overflow-hidden">
            {/* Header */}
            <div className="absolute top-0 left-0 w-full p-4 z-10 bg-tech-bg/95 backdrop-blur-md border-b border-white/5 flex flex-col items-center justify-center gap-1">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-tech-purple" />
                    <h2 className="text-base font-bold text-white">天机问答</h2>
                </div>
                {currentBazi ? (
                    <div className="flex items-center gap-2 text-[10px] text-emerald-400">
                        <ScrollText className="w-3 h-3" />
                        <span>已加载：{currentBazi.chart.dayMasterElement}命 / {currentBazi.chart.structure}</span>
                    </div>
                ) : (
                    <button onClick={onRequestBazi} className="flex items-center gap-1 text-[10px] text-amber-500 hover:text-amber-400">
                        <AlertCircle className="w-3 h-3" />
                        <span>未加载命盘，回答仅供参考 (点击排盘)</span>
                    </button>
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 pt-24 pb-24 space-y-6">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                            <div className="w-8 h-8 rounded-full bg-tech-purple/20 flex items-center justify-center border border-tech-purple/30 shrink-0 mt-1">
                                <Bot className="w-4 h-4 text-tech-purple" />
                            </div>
                        )}
                        
                        <div className={`
                            max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg
                            ${msg.role === 'user' 
                                ? 'bg-gradient-to-br from-tech-blue to-blue-700 text-white rounded-tr-sm' 
                                : 'glass-panel text-slate-200 rounded-tl-sm'}
                        `}>
                            {msg.text}
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 shrink-0 mt-1">
                                <User className="w-4 h-4 text-slate-300" />
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start gap-3">
                         <div className="w-8 h-8 rounded-full bg-tech-purple/20 flex items-center justify-center border border-tech-purple/30 shrink-0">
                                <Sparkles className="w-4 h-4 text-tech-purple animate-spin" />
                        </div>
                        <div className="glass-panel px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Bar */}
            <div className="absolute bottom-[80px] md:bottom-0 left-0 w-full p-4 bg-tech-bg/90 backdrop-blur-lg border-t border-white/10">
                <div className="relative max-w-3xl mx-auto">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={currentBazi ? "基于您的命盘提问..." : "请输入您的问题..."}
                        className="w-full bg-slate-800/50 border border-white/10 rounded-full py-3.5 pl-5 pr-14 text-white outline-none focus:border-tech-purple focus:bg-slate-800 transition-all placeholder:text-slate-500"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={loading || !input}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-tech-purple rounded-full text-white hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:bg-slate-700"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
