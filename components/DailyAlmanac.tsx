import React, { useEffect, useState } from 'react';
import { getDailyFortune } from '../services/geminiService';
import { DailyFortune, BaziAnalysis } from '../types';
import { Calendar, CheckCircle2, XCircle, Sparkles, UserCheck, AlertCircle } from 'lucide-react';

interface DailyAlmanacProps {
    currentBazi: BaziAnalysis | null;
    onRequestBazi: () => void;
}

export const DailyAlmanac: React.FC<DailyAlmanacProps> = ({ currentBazi, onRequestBazi }) => {
    const [fortune, setFortune] = useState<DailyFortune | null>(null);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchFortune = async (targetDate: string) => {
        setLoading(true);
        try {
            const data = await getDailyFortune(currentBazi, targetDate);
            setFortune(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFortune(date);
    }, [date, currentBazi]);

    return (
        <div className="w-full max-w-lg mx-auto p-4 animate-fade-in pb-24">
            {/* Header Date Picker */}
             <div className="glass-panel p-4 rounded-2xl mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-white">每日运势</h2>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-transparent text-xs text-slate-400 outline-none mt-0.5 font-mono"
                        />
                    </div>
                </div>
                {currentBazi ? (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-full border border-emerald-500/30">
                        <UserCheck className="w-3 h-3" />
                        <span>专属定制</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
                        <span>通用运势</span>
                    </div>
                )}
            </div>

            {!currentBazi && (
                <div 
                    onClick={onRequestBazi}
                    className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-900/10 flex items-center gap-3 cursor-pointer hover:bg-amber-900/20 transition-all"
                >
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-amber-100">未关联命盘</h4>
                        <p className="text-xs text-amber-200/70 mt-1">点击此处先进行八字排盘，获取基于您命理（喜忌、生肖冲合）的专属吉凶预测。</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="w-12 h-12 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
                    <p className="text-rose-400 text-xs tracking-widest animate-pulse">
                        {currentBazi ? '推演命理交互中...' : '星象解读中...'}
                    </p>
                </div>
            ) : fortune ? (
                <div className="space-y-5">
                    {/* Hero Summary Card */}
                    <div className="bg-gradient-to-br from-rose-900/40 to-purple-900/40 backdrop-blur-md border border-rose-500/30 p-6 rounded-2xl shadow-xl relative overflow-hidden text-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-[50px] rounded-full"></div>
                        
                        <div className="text-xs text-rose-300/80 mb-2 font-mono">{fortune.ganZhi}日 · {fortune.solarTerm}</div>
                        
                        <h3 className="text-white font-serif text-lg mb-4 leading-relaxed relative z-10">
                            运势评分: <span className="text-3xl font-bold text-rose-400">{fortune.score}</span>
                        </h3>
                        
                        <div className="bg-black/20 p-3 rounded-xl border border-white/5 mb-4 text-left">
                            <span className="text-[10px] uppercase text-rose-400 block mb-1">今日运程详解</span>
                            <p className="text-slate-200 text-sm leading-relaxed">{fortune.personalImpact}</p>
                        </div>
                        
                        <div className="flex justify-center gap-3 text-xs relative z-10">
                            <div className="bg-black/30 px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
                                <span className="text-slate-400">吉位</span>
                                <span className="text-rose-300 font-bold">{fortune.luckyDirection}</span>
                            </div>
                            <div className="bg-black/30 px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
                                <span className="text-slate-400">幸运色</span>
                                <span className="text-rose-300 font-bold">{fortune.luckyColor}</span>
                            </div>
                        </div>
                    </div>

                    {/* Yi / Ji Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        {/* Auspicious */}
                        <div className="glass-panel border-l-4 border-l-emerald-500 rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-serif font-bold">
                                    宜
                                </div>
                                <span className="text-emerald-400 font-bold text-sm tracking-widest">AUSPICIOUS</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {fortune.auspicious.map((item, idx) => (
                                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-100 text-sm border border-emerald-500/20 flex items-center gap-2">
                                        <CheckCircle2 className="w-3 h-3 opacity-70" />
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Inauspicious */}
                        <div className="glass-panel border-l-4 border-l-rose-500 rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 font-serif font-bold">
                                    忌
                                </div>
                                <span className="text-rose-400 font-bold text-sm tracking-widest">AVOID</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {fortune.inauspicious.map((item, idx) => (
                                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-100 text-sm border border-rose-500/20 flex items-center gap-2">
                                        <XCircle className="w-3 h-3 opacity-70" />
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};