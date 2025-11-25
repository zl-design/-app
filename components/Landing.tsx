
import React from 'react';
import { Scroll, Calendar, MessageCircle, Sparkles, HeartHandshake } from 'lucide-react';

interface LandingProps {
    onNavigate: (view: string) => void;
}

export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
    return (
        <div className="flex flex-col items-center justify-start min-h-[85vh] pt-10 px-4 space-y-10 animate-fade-in">
            {/* Hero Section */}
            <div className="relative text-center space-y-4 w-full">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-tech-blue/20 rounded-full blur-[60px] animate-pulse-slow"></div>
                <h1 className="relative text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-purple-200 tracking-wider mb-2 z-10">
                    玄机阁
                </h1>
                <h2 className="relative text-sm text-tech-blue/80 tracking-[0.5em] uppercase font-light z-10">
                    XUAN JI GE
                </h2>
                <p className="relative text-slate-400 text-sm max-w-xs mx-auto leading-relaxed z-10 pt-4">
                    赛博玄学 · 数据命理 · 专属定制
                    <br />
                    <span className="text-xs opacity-60">融合古老智慧与未来科技</span>
                </p>
            </div>

            {/* Grid Navigation */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-lg pb-20">
                <button onClick={() => onNavigate('bazi')} className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-white/5 active:scale-95 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-4 bg-blue-500/20 rounded-full text-blue-300 group-hover:text-white group-hover:bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                        <Scroll className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-white">八字排盘</h3>
                        <p className="text-xs text-slate-400 mt-1">深度推理 · 缺补分析</p>
                    </div>
                </button>

                <button onClick={() => onNavigate('match')} className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-white/5 active:scale-95 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-4 bg-pink-500/20 rounded-full text-pink-300 group-hover:text-white group-hover:bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all">
                        <HeartHandshake className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-white">双人合盘</h3>
                        <p className="text-xs text-slate-400 mt-1">八字合婚 · 缘分测试</p>
                    </div>
                </button>

                <button onClick={() => onNavigate('almanac')} className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-white/5 active:scale-95 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-4 bg-rose-500/20 rounded-full text-rose-300 group-hover:text-white group-hover:bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-white">专属黄历</h3>
                        <p className="text-xs text-slate-400 mt-1">命理交互 · 吉凶宜忌</p>
                    </div>
                </button>

                <button onClick={() => onNavigate('chat')} className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-white/5 active:scale-95 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-4 bg-purple-500/20 rounded-full text-purple-300 group-hover:text-white group-hover:bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all">
                        <MessageCircle className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-white">天机问答</h3>
                        <p className="text-xs text-slate-400 mt-1">基于命盘 · 智能解惑</p>
                    </div>
                </button>
            </div>
            
            <div className="flex items-center justify-center gap-2 opacity-50">
                 <Sparkles className="w-4 h-4 text-tech-purple" />
                 <span className="text-xs text-slate-500">AI 驱动 · 玄学引擎 V4.0</span>
            </div>
        </div>
    );
};
