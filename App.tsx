
import React, { useState } from 'react';
import { BaziView } from './components/BaziView';
import { DailyAlmanac } from './components/DailyAlmanac';
import { ChatView } from './components/ChatView';
import { Landing } from './components/Landing';
import { CompatibilityView } from './components/CompatibilityView';
import { BaziAnalysis } from './types';
import { Home, Scroll, Calendar, MessageCircle, HeartHandshake } from 'lucide-react';

type ViewState = 'landing' | 'bazi' | 'almanac' | 'chat' | 'match';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  
  // Global state to hold the currently active/viewed Bazi for context in other tabs
  const [currentBazi, setCurrentBazi] = useState<BaziAnalysis | null>(null);

  // Mobile Bottom Tab Bar
  const Navigation = () => (
    <nav className="fixed bottom-0 left-0 w-full glass-nav z-50 pb-safe pt-2 px-2 md:max-w-xl md:left-1/2 md:-translate-x-1/2 md:rounded-t-2xl md:bottom-4 md:border md:border-white/10">
      <div className="flex justify-between items-center h-16">
            <button 
              onClick={() => setCurrentView('landing')} 
              className={`flex flex-col items-center justify-center w-14 space-y-1 transition-colors ${currentView === 'landing' ? 'text-tech-blue' : 'text-slate-500'}`}
            >
              <Home className={`w-5 h-5 ${currentView === 'landing' ? 'fill-tech-blue/20' : ''}`} />
              <span className="text-[9px] font-medium">首页</span>
            </button>
            
            <button 
              onClick={() => setCurrentView('bazi')}
              className={`flex flex-col items-center justify-center w-14 space-y-1 transition-colors ${currentView === 'bazi' ? 'text-tech-blue' : 'text-slate-500'}`}
            >
              <Scroll className={`w-5 h-5 ${currentView === 'bazi' ? 'fill-tech-blue/20' : ''}`} />
              <span className="text-[9px] font-medium">排盘</span>
            </button>

             <button 
              onClick={() => setCurrentView('match')}
              className={`flex flex-col items-center justify-center w-14 space-y-1 transition-colors ${currentView === 'match' ? 'text-tech-blue' : 'text-slate-500'}`}
            >
              <HeartHandshake className={`w-5 h-5 ${currentView === 'match' ? 'fill-tech-blue/20' : ''}`} />
              <span className="text-[9px] font-medium">合盘</span>
            </button>

            <button 
              onClick={() => setCurrentView('almanac')}
              className={`flex flex-col items-center justify-center w-14 space-y-1 transition-colors ${currentView === 'almanac' ? 'text-tech-blue' : 'text-slate-500'}`}
            >
              <Calendar className={`w-5 h-5 ${currentView === 'almanac' ? 'fill-tech-blue/20' : ''}`} />
              <span className="text-[9px] font-medium">黄历</span>
            </button>

             <button 
              onClick={() => setCurrentView('chat')}
              className={`flex flex-col items-center justify-center w-14 space-y-1 transition-colors ${currentView === 'chat' ? 'text-tech-blue' : 'text-slate-500'}`}
            >
              <MessageCircle className={`w-5 h-5 ${currentView === 'chat' ? 'fill-tech-blue/20' : ''}`} />
              <span className="text-[9px] font-medium">问答</span>
            </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-tech-bg text-slate-200 font-sans pb-20 relative overflow-hidden selection:bg-tech-purple/30">
      
      {/* Ambient Background Effects */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-blue-900/10 blur-[100px] animate-float"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-purple-900/10 blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <main className="container mx-auto">
        {currentView === 'landing' && <Landing onNavigate={setCurrentView} />}
        {currentView === 'bazi' && (
            <BaziView 
                onAnalysisComplete={setCurrentBazi}
            />
        )}
        {currentView === 'match' && <CompatibilityView />}
        {currentView === 'almanac' && <DailyAlmanac currentBazi={currentBazi} onRequestBazi={() => setCurrentView('bazi')} />}
        {currentView === 'chat' && <ChatView currentBazi={currentBazi} onRequestBazi={() => setCurrentView('bazi')} />}
      </main>

      <Navigation />
    </div>
  );
};

export default App;
