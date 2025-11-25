
import React, { useState, useEffect } from 'react';
import { analyzeBazi } from '../services/geminiService';
import { calculateBaziLocal } from '../services/baziCalculator';
import { saveLocalRecord, getLocalHistory, deleteLocalRecord } from '../services/storageService';
import { BaziAnalysis, Gender, CalendarType, DetailedAnalysis, LocalHistoryItem } from '../types';
import { Loader2, Scroll, Sparkles, MapPin, AlertTriangle, Info, History, Trash2, ArrowRight } from 'lucide-react';

const PillarCard: React.FC<{ title: string; data: any }> = ({ title, data }) => {
    if (!data) return null;
    
    const getElementColor = (el: string) => {
        if (el.includes('木') || el.includes('Wood')) return 'text-emerald-400 bg-emerald-900/20 border-emerald-500/30';
        if (el.includes('火') || el.includes('Fire')) return 'text-rose-400 bg-rose-900/20 border-rose-500/30';
        if (el.includes('土') || el.includes('Earth')) return 'text-amber-400 bg-amber-900/20 border-amber-500/30';
        if (el.includes('金') || el.includes('Metal')) return 'text-slate-200 bg-slate-700/20 border-slate-400/30';
        if (el.includes('水') || el.includes('Water')) return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
        return 'text-slate-300 bg-slate-800/20 border-slate-600/30';
    };

    return (
        <div className={`flex flex-col items-center p-3 rounded-xl border backdrop-blur-md w-full relative overflow-hidden ${getElementColor(data.element)}`}>
            <span className="text-[10px] opacity-70 mb-1 tracking-widest">{title}</span>
            <div className="flex flex-col items-center space-y-1 z-10">
                <span className="text-2xl font-serif font-bold">{data.gan}</span>
                <span className="text-2xl font-serif font-bold">{data.zhi}</span>
            </div>
            <span className="text-[10px] mt-1 opacity-80 z-10">{data.animal}</span>
            <div className={`absolute -bottom-4 -right-4 w-12 h-12 rounded-full opacity-20 blur-lg ${data.element.includes('火') ? 'bg-rose-500' : 'bg-white'}`}></div>
        </div>
    );
};

const AnalysisSection: React.FC<{ title: string; color: string; data: DetailedAnalysis }> = ({ title, color, data }) => {
    const getColorClass = (c: string) => {
         if (c === 'purple') return 'text-tech-purple border-l-tech-purple bg-tech-purple';
         if (c === 'amber') return 'text-amber-500 border-l-amber-500 bg-amber-500';
         if (c === 'rose') return 'text-rose-500 border-l-rose-500 bg-rose-500';
         if (c === 'emerald') return 'text-emerald-500 border-l-emerald-500 bg-emerald-500';
         if (c === 'blue') return 'text-blue-500 border-l-blue-500 bg-blue-500';
         return 'text-white border-l-white bg-white';
    };

    return (
        <div className={`glass-panel p-5 rounded-2xl border-l-4 ${getColorClass(color).split(' ')[1]}`}>
            <div className="flex items-center justify-between mb-3">
                <h3 className={`${getColorClass(color).split(' ')[0]} text-sm font-bold flex items-center gap-2`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getColorClass(color).split(' ')[2]}`}></span> 
                    {title}
                </h3>
                <div className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                    指数: <span className="text-white">{data.score}</span>
                </div>
            </div>
            
            <div className="space-y-4">
                <div className="bg-white/5 p-3 rounded-lg">
                    <span className="text-[10px] uppercase text-slate-400 block mb-1">结论详解</span>
                    <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{data.conclusion}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <span className="text-[10px] uppercase text-slate-500 block mb-1">命理依据</span>
                        <p className="text-slate-400 text-xs leading-relaxed font-mono opacity-80">{data.reasoning}</p>
                    </div>
                    <div>
                        <span className="text-[10px] uppercase text-emerald-500/70 block mb-1">建议与行动</span>
                        <p className="text-emerald-400/90 text-xs leading-relaxed">{data.actionableAdvice}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface BaziViewProps {
    onAnalysisComplete: (data: BaziAnalysis) => void;
}

export const BaziView: React.FC<BaziViewProps> = ({ onAnalysisComplete }) => {
    // Inputs
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('12:00');
    const [birthLocation, setBirthLocation] = useState('');
    const [gender, setGender] = useState<Gender>(Gender.MALE);
    const [calendarType, setCalendarType] = useState<CalendarType>(CalendarType.SOLAR);
    
    // State
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [result, setResult] = useState<BaziAnalysis | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [historyList, setHistoryList] = useState<LocalHistoryItem[]>([]);

    useEffect(() => {
        setHistoryList(getLocalHistory());
    }, []);

    const handleAnalyze = async () => {
        setErrorMsg('');
        if (!birthDate) {
            setErrorMsg("请选择出生日期");
            return;
        }
        if (!birthTime) {
            setErrorMsg("请选择出生时间");
            return;
        }
        if (!birthLocation) {
            setErrorMsg("请输入出生地点");
            return;
        }
        
        setLoading(true);
        try {
            // 1. Deterministic Calculation (Stable)
            const fixedChart = calculateBaziLocal(birthDate, birthTime, gender, calendarType);
            
            // 2. AI Interpretation (Using the fixed chart)
            const analysisData = await analyzeBazi(fixedChart, {
                date: birthDate,
                time: birthTime,
                location: birthLocation,
                gender
            });
            
            setResult(analysisData);
            onAnalysisComplete(analysisData);

            // 3. Save to History
            const newRecord: LocalHistoryItem = {
                id: Date.now().toString(),
                name: name || '我的命盘',
                timestamp: Date.now(),
                birthDate,
                birthTime,
                gender,
                calendarType,
                chart: analysisData.chart,
                analysis: analysisData
            };
            saveLocalRecord(newRecord);
            setHistoryList(getLocalHistory());

        } catch (e: any) {
            console.error(e);
            setErrorMsg(e.message || "连接天机失败，请稍后再试。");
        } finally {
            setLoading(false);
        }
    };

    const loadHistoryItem = (item: LocalHistoryItem) => {
        setResult(item.analysis);
        onAnalysisComplete(item.analysis);
        setShowHistory(false);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const updated = deleteLocalRecord(id);
        setHistoryList(updated);
    };

    return (
        <div className="w-full max-w-lg mx-auto p-4 space-y-6 animate-fade-in pb-24 relative">
            {/* Header */}
            <div className="glass-panel p-4 rounded-2xl flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Scroll className="w-5 h-5 text-tech-blue" />
                        八字排盘
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">深度推理 · 稳定排盘 · 永久存档</p>
                </div>
                <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors border border-white/10"
                >
                    <History className="w-5 h-5 text-slate-300" />
                </button>
            </div>

             {/* History Drawer */}
             {showHistory && (
                <div className="absolute top-20 right-4 left-4 z-50 glass-panel border-glass-border bg-[#0f172a] shadow-2xl rounded-2xl max-h-[400px] overflow-y-auto animate-slide-up p-4">
                    <h3 className="text-sm font-bold text-white mb-3 flex justify-between items-center">
                        历史记录 ({historyList.length})
                        <button onClick={() => setShowHistory(false)} className="text-xs text-slate-400">关闭</button>
                    </h3>
                    {historyList.length === 0 ? (
                        <p className="text-xs text-slate-500 py-4 text-center">暂无记录</p>
                    ) : (
                        <div className="space-y-2">
                            {historyList.map(item => (
                                <div 
                                    key={item.id}
                                    onClick={() => loadHistoryItem(item)}
                                    className="p-3 rounded-xl bg-slate-900/50 border border-white/5 hover:border-tech-blue/50 cursor-pointer transition-all flex justify-between items-center group"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-slate-200">{item.name}</span>
                                            <span className={`text-[10px] px-1.5 rounded ${item.gender === Gender.MALE ? 'bg-blue-900/50 text-blue-300' : 'bg-rose-900/50 text-rose-300'}`}>
                                                {item.gender === Gender.MALE ? '男' : '女'}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-1">
                                            {item.birthDate} ({item.calendarType === CalendarType.LUNAR ? '阴' : '阳'})
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-tech-blue" />
                                        <button onClick={(e) => handleDelete(e, item.id)} className="p-1 hover:text-rose-400 text-slate-600 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Input Form */}
            {!result && (
                <div className="glass-panel p-6 rounded-2xl space-y-5 animate-slide-up">
                    <div className="bg-slate-900/50 p-1 rounded-xl flex border border-glass-border">
                        <button 
                            onClick={() => setCalendarType(CalendarType.SOLAR)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${calendarType === CalendarType.SOLAR ? 'bg-tech-blue text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            阳历 (公历)
                        </button>
                        <button 
                            onClick={() => setCalendarType(CalendarType.LUNAR)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${calendarType === CalendarType.LUNAR ? 'bg-tech-purple text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            阴历 (农历)
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-tech-blue uppercase tracking-wider font-bold">姓名 / 代号</label>
                        <input 
                            type="text" 
                            placeholder="请输入姓名方便记录"
                            className="w-full bg-slate-900/50 border border-glass-border rounded-xl p-4 text-white focus:border-tech-blue focus:ring-1 focus:ring-tech-blue outline-none transition-all placeholder:text-slate-600"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs text-tech-blue uppercase tracking-wider font-bold">出生日期</label>
                            {calendarType === CalendarType.LUNAR && (
                                <div className="flex items-center gap-1 text-[10px] text-tech-purple">
                                    <Info className="w-3 h-3" />
                                    <span>请选择农历对应日期</span>
                                </div>
                            )}
                        </div>
                        <input 
                            type="date" 
                            className="w-full bg-slate-900/50 border border-glass-border rounded-xl p-4 text-white focus:border-tech-blue focus:ring-1 focus:ring-tech-blue outline-none transition-all"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                        />
                        {calendarType === CalendarType.LUNAR && (
                            <p className="text-[10px] text-slate-500 pl-1">
                                注：选阴历时，系统会自动将您选择的日期转换为真太阳时干支，无需您手动换算。
                            </p>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs text-tech-blue uppercase tracking-wider font-bold">出生时间</label>
                            <input 
                                type="time" 
                                className="w-full bg-slate-900/50 border border-glass-border rounded-xl p-4 text-white focus:border-tech-blue outline-none transition-all"
                                value={birthTime}
                                onChange={(e) => setBirthTime(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-tech-blue uppercase tracking-wider font-bold">性别</label>
                            <div className="flex bg-slate-900/50 rounded-xl p-1 border border-glass-border h-[58px]">
                                <button 
                                    onClick={() => setGender(Gender.MALE)}
                                    className={`flex-1 rounded-lg text-sm font-medium transition-all ${gender === Gender.MALE ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                                >
                                    男
                                </button>
                                <button 
                                    onClick={() => setGender(Gender.FEMALE)}
                                    className={`flex-1 rounded-lg text-sm font-medium transition-all ${gender === Gender.FEMALE ? 'bg-rose-500 text-white' : 'text-slate-400'}`}
                                >
                                    女
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-tech-blue uppercase tracking-wider font-bold">出生地点</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                                type="text" 
                                placeholder="用于经纬度校正 (省/市)"
                                className="w-full bg-slate-900/50 border border-glass-border rounded-xl p-4 pl-10 text-white focus:border-tech-blue focus:ring-1 focus:ring-tech-blue outline-none transition-all placeholder:text-slate-600"
                                value={birthLocation}
                                onChange={(e) => setBirthLocation(e.target.value)}
                            />
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center flex items-center justify-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            {errorMsg}
                        </div>
                    )}

                    <button 
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="w-full mt-4 bg-gradient-to-r from-tech-blue to-tech-purple hover:from-blue-600 hover:to-purple-600 text-white py-4 rounded-xl font-bold tracking-wider shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        {loading ? '精密排盘中...' : '开始排盘'}
                    </button>
                </div>
            )}

            {/* Results */}
            {result && (
                <div className="space-y-6 animate-slide-up">
                    {/* Pillars Chart */}
                    <div className="glass-panel p-4 rounded-2xl">
                        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                            <div>
                                <h3 className="text-sm font-bold text-white">八字乾坤</h3>
                                <p className="text-[10px] text-slate-400 mt-0.5">{birthDate} · {birthTime} · {result.chart.zodiac}</p>
                            </div>
                            <button onClick={() => setResult(null)} className="text-xs text-tech-blue border border-tech-blue/30 px-3 py-1 rounded-full">返回</button>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mb-4">
                            <PillarCard title="年柱" data={result.chart.year} />
                            <PillarCard title="月柱" data={result.chart.month} />
                            <PillarCard title="日主" data={result.chart.day} />
                            <PillarCard title="时柱" data={result.chart.hour} />
                        </div>
                        
                        {/* Core Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                             <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                <span className="text-[10px] text-slate-400 block">日元</span>
                                <span className="text-white font-bold">{result.chart.dayMasterElement} ({result.chart.strength})</span>
                             </div>
                             <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                <span className="text-[10px] text-slate-400 block">格局</span>
                                <span className="text-white font-bold">{result.chart.structure}</span>
                             </div>
                             <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                <span className="text-[10px] text-slate-400 block">属相</span>
                                <span className="text-white font-bold">{result.chart.zodiac}</span>
                             </div>
                        </div>

                         {/* Missing Elements Warning */}
                        {result.chart.missingElements && result.chart.missingElements.length > 0 && (
                            <div className="mb-4 bg-rose-900/20 border border-rose-500/30 p-3 rounded-xl flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-rose-500" />
                                <div>
                                    <span className="text-xs text-rose-400 font-bold block">五行缺损</span>
                                    <span className="text-xs text-slate-300">
                                        命中缺：<span className="text-white font-bold">{result.chart.missingElements.join('、')}</span>
                                        。建议在生活、穿着中补足相关属性。
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Five Elements Bar */}
                        <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5">
                            <span className="text-[10px] text-slate-400 block mb-2">五行能量分布</span>
                            <div className="flex h-3 rounded-full overflow-hidden bg-slate-800">
                                {result.chart.fiveElements.map((el, idx) => (
                                    <div 
                                        key={idx}
                                        style={{ width: `${el.percentage}%` }}
                                        className={`h-full ${
                                            el.name.includes('木') ? 'bg-emerald-500' :
                                            el.name.includes('火') ? 'bg-rose-500' :
                                            el.name.includes('土') ? 'bg-amber-500' :
                                            el.name.includes('金') ? 'bg-slate-300' :
                                            'bg-blue-500'
                                        }`}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                                {result.chart.fiveElements.map(el => (
                                    <span key={el.name}>{el.name} {el.percentage}%</span>
                                ))}
                            </div>
                        </div>

                         <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                             <div className="bg-emerald-900/10 p-2 rounded-lg border border-emerald-500/20">
                                <span className="text-emerald-400 block mb-1 font-bold">喜用神 (利)</span>
                                <span className="text-slate-300 font-mono">{result.chart.favorableElements.join('、')}</span>
                                <div className="mt-2 text-[10px] text-slate-500">
                                    幸运色: {result.chart.luckyColors?.join(', ') || '红, 绿'}
                                </div>
                             </div>
                             <div className="bg-rose-900/10 p-2 rounded-lg border border-rose-500/20">
                                <span className="text-rose-400 block mb-1 font-bold">忌仇神 (弊)</span>
                                <span className="text-slate-300 font-mono">{result.chart.unfavorableElements.join('、')}</span>
                             </div>
                        </div>
                    </div>

                    {/* Global Comment */}
                    <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles className="w-20 h-20 text-white" />
                        </div>
                        <h3 className="text-base font-bold text-white mb-3">大师总评</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">{result.globalComment}</p>
                    </div>

                    {/* Detailed Interpretation Grid */}
                    <div className="space-y-4">
                        <AnalysisSection title="性格心理" color="purple" data={result.personality} />
                        <AnalysisSection title="事业成就" color="amber" data={result.career} />
                        <AnalysisSection title="财富机缘" color="emerald" data={result.wealth} />
                        <AnalysisSection title="情感婚姻" color="rose" data={result.relationships} />
                        <AnalysisSection title="健康疾厄" color="blue" data={result.health} />
                    </div>
                </div>
            )}
        </div>
    );
};
