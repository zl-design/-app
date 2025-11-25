
import React, { useState } from 'react';
import { analyzeCompatibility } from '../services/geminiService';
import { calculateBaziLocal } from '../services/baziCalculator';
import { CompatibilityAnalysis, Gender, CalendarType } from '../types';
import { HeartHandshake, Loader2, Info, ArrowRightLeft, User, Sparkles } from 'lucide-react';

const InputGroup: React.FC<{ 
    label: string; 
    data: any; 
    onChange: (key: string, val: any) => void 
}> = ({ label, data, onChange }) => (
    <div className="glass-panel p-4 rounded-xl space-y-3">
        <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-tech-purple" />
            <h3 className="text-sm font-bold text-white">{label}</h3>
        </div>
        
        <input 
            type="text" 
            placeholder="姓名/代号"
            className="w-full bg-slate-900/50 border border-glass-border rounded-lg p-3 text-sm text-white focus:border-tech-blue outline-none"
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
        />
        
        <div className="flex bg-slate-900/50 rounded-lg p-1 border border-glass-border">
            <button 
                onClick={() => onChange('calendar', CalendarType.SOLAR)}
                className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${data.calendar === CalendarType.SOLAR ? 'bg-tech-blue text-white' : 'text-slate-400'}`}
            >
                公历
            </button>
            <button 
                onClick={() => onChange('calendar', CalendarType.LUNAR)}
                className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${data.calendar === CalendarType.LUNAR ? 'bg-tech-purple text-white' : 'text-slate-400'}`}
            >
                农历
            </button>
        </div>
        
        <input 
            type="date" 
            className="w-full bg-slate-900/50 border border-glass-border rounded-lg p-3 text-sm text-white focus:border-tech-blue outline-none"
            value={data.date}
            onChange={(e) => onChange('date', e.target.value)}
        />
        
        <input 
            type="time" 
            className="w-full bg-slate-900/50 border border-glass-border rounded-lg p-3 text-sm text-white focus:border-tech-blue outline-none"
            value={data.time}
            onChange={(e) => onChange('time', e.target.value)}
        />
        
        <div className="flex bg-slate-900/50 rounded-lg p-1 border border-glass-border">
             <button 
                onClick={() => onChange('gender', Gender.MALE)}
                className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${data.gender === Gender.MALE ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
            >
                男
            </button>
            <button 
                onClick={() => onChange('gender', Gender.FEMALE)}
                className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${data.gender === Gender.FEMALE ? 'bg-rose-500 text-white' : 'text-slate-400'}`}
            >
                女
            </button>
        </div>
    </div>
);

const ResultCard: React.FC<{ title: string; data: any }> = ({ title, data }) => (
    <div className="glass-panel p-4 rounded-xl border-l-2 border-l-tech-purple">
        <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-bold text-white">{title}</h4>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${data.score > 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {data.score}分
            </span>
        </div>
        <p className="text-xs text-slate-300 mb-2">{data.description}</p>
        <div className="bg-white/5 p-2 rounded text-[10px] font-mono text-slate-400 border border-white/5">
            <span className="text-tech-purple">命理依据：</span> {data.technicalReason}
        </div>
    </div>
);

export const CompatibilityView: React.FC = () => {
    const [p1, setP1] = useState({ name: '甲方', date: '', time: '12:00', gender: Gender.MALE, calendar: CalendarType.SOLAR });
    const [p2, setP2] = useState({ name: '乙方', date: '', time: '12:00', gender: Gender.FEMALE, calendar: CalendarType.SOLAR });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<CompatibilityAnalysis | null>(null);

    const handleCalculate = async () => {
        if (!p1.date || !p2.date) return;
        setLoading(true);
        try {
            // 1. Calculate Charts Locally first to ensure accuracy
            const c1 = calculateBaziLocal(p1.date, p1.time, p1.gender, p1.calendar);
            const c2 = calculateBaziLocal(p2.date, p2.time, p2.gender, p2.calendar);

            // 2. Send calculated charts to AI for comparison
            const data = await analyzeCompatibility(c1, p1, c2, p2);
            setResult(data);
        } catch (e) {
            console.error(e);
            alert('计算失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto p-4 animate-fade-in pb-24">
            <div className="glass-panel p-4 rounded-2xl flex items-center gap-3 mb-6">
                 <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400">
                    <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">双人合盘</h2>
                    <p className="text-xs text-slate-400">八字合婚 · 缘分深浅 · 相处之道</p>
                </div>
            </div>

            {!result ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                        <InputGroup label="甲方信息" data={p1} onChange={(k, v) => setP1({...p1, [k]: v})} />
                        <InputGroup label="乙方信息" data={p2} onChange={(k, v) => setP2({...p2, [k]: v})} />
                    </div>
                    
                    <button 
                        onClick={handleCalculate}
                        disabled={loading || !p1.date || !p2.date}
                        className="w-full bg-gradient-to-r from-rose-600 to-purple-600 text-white py-4 rounded-xl font-bold tracking-wider shadow-lg flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <ArrowRightLeft className="w-5 h-5" />}
                        {loading ? '缘分推演中...' : '开始合盘'}
                    </button>
                    <p className="text-center text-[10px] text-slate-500">注意：系统自动进行真太阳时与农阳历转换，确保排盘精准</p>
                </div>
            ) : (
                <div className="space-y-5 animate-slide-up">
                    {/* Score Hero */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900 to-slate-900 p-6 text-center border border-white/10">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 blur-[50px] rounded-full"></div>
                         <h3 className="text-sm text-slate-400 uppercase tracking-widest mb-1">综合契合度</h3>
                         <div className="text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-purple-300 mb-4">
                             {result.overallScore}
                         </div>
                         <p className="text-sm text-slate-200 leading-relaxed max-w-xs mx-auto relative z-10">
                             {result.synopsis}
                         </p>
                         <button 
                            onClick={() => setResult(null)}
                            className="mt-4 text-xs text-white/50 underline hover:text-white"
                         >
                            重新测试
                         </button>
                    </div>

                    <div className="space-y-3">
                        <ResultCard title="日主关系 (核心吸引力)" data={result.dayMasterRelation} />
                        <ResultCard title="生肖/根基 (家庭观念)" data={result.zodiacRelation} />
                        <ResultCard title="五行互补 (能量平衡)" data={result.elementalBalance} />
                        <ResultCard title="夫妻宫 (亲密相处)" data={result.spousePalace} />
                    </div>

                    <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-emerald-500">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-sm font-bold text-white">大师建议</h3>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            {result.advice}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
