
import React, { useState } from 'react';
import { Slide } from '../types';

interface SlideViewerProps {
  slides: Slide[];
}

const SlideViewer: React.FC<SlideViewerProps> = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  if (!slides || slides.length === 0) {
    return (
      <div className="bg-slate-900 aspect-[16/9] rounded-2xl flex flex-col items-center justify-center text-slate-500 border border-slate-800 shadow-inner">
        <span className="text-4xl mb-4">🖼️</span>
        <p className="text-sm font-bold uppercase tracking-widest">Visual Deck Staged</p>
        <p className="text-[10px] mt-2 italic">Generate Subsection materials to forge slides.</p>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  const renderText = (text: string) => {
    if (!text) return null;
    return <span dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-400 font-black">$1</strong>') }} />;
  };

  const getLayoutClass = (type?: string) => {
    switch(type) {
      case 'title': return 'justify-center items-center text-center py-20';
      case 'exercise': return 'bg-amber-900/10 border-amber-500/20';
      default: return 'justify-start items-start';
    }
  };

  return (
    <div className="space-y-4 group">
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl aspect-[16/9] flex flex-col border border-slate-800 transition-all duration-500">
        {/* Progress Bar Top */}
        <div className="absolute top-0 left-0 w-full h-1 flex">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 transition-all duration-300 ${i <= currentIndex ? 'bg-amber-500' : 'bg-slate-800'}`}
            />
          ))}
        </div>

        {/* Header Decor */}
        <div className="px-10 pt-8 pb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">Army CourseForge // TRADOC POI</span>
          </div>
          <span className="text-[8px] font-black text-amber-500/50 uppercase tracking-widest px-3 py-1 border border-amber-500/20 rounded-full">
            Unclassified
          </span>
        </div>

        {/* Content Area */}
        <div className={`flex-1 px-16 pb-16 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-500 ${getLayoutClass(currentSlide.layoutType)}`}>
          <h3 className={`font-black text-white leading-tight mb-8 ${currentSlide.layoutType === 'title' ? 'text-5xl tracking-tighter' : 'text-3xl border-l-4 border-amber-500 pl-6'}`}>
            {renderText(currentSlide.title)}
          </h3>
          
          <div className={`grid gap-4 flex-1 ${currentSlide.layoutType === 'comparison' ? 'grid-cols-2' : 'grid-cols-1'}`}>
             <ul className="space-y-6">
                {currentSlide.bulletPoints.map((point, idx) => (
                  <li key={idx} className="text-slate-300 text-lg flex items-start gap-4 group/item">
                    <span className="text-amber-500 mt-1.5 shrink-0 group-hover/item:scale-125 transition-transform duration-300">▹</span>
                    <span className="leading-relaxed font-medium">{renderText(point)}</span>
                  </li>
                ))}
             </ul>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="px-10 py-6 bg-slate-950/50 border-t border-slate-800/50 flex justify-between items-center backdrop-blur-md">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-600 uppercase tabular-nums">
              {String(currentIndex + 1).padStart(2, '0')} <span className="text-slate-800 mx-1">/</span> {String(slides.length).padStart(2, '0')}
            </span>
          </div>

          <div className="flex gap-1.5">
            <button 
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-white rounded-xl transition-all active:scale-90"
            >
              &larr;
            </button>
            <button 
              onClick={() => setCurrentIndex(prev => Math.min(slides.length - 1, prev + 1))}
              disabled={currentIndex === slides.length - 1}
              className="w-10 h-10 flex items-center justify-center bg-amber-600 hover:bg-amber-500 disabled:opacity-20 text-white rounded-xl transition-all shadow-lg active:scale-90"
            >
              &rarr;
            </button>
          </div>
        </div>

        {/* Dynamic Background Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-overlay">
           <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-amber-500 to-transparent blur-3xl"></div>
           <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-slate-500 to-transparent blur-3xl"></div>
        </div>
      </div>

      {/* Instructor Section */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <button 
          onClick={() => setShowNotes(!showNotes)}
          className="w-full px-6 py-4 flex justify-between items-center text-slate-800 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-3">
            <span className="bg-amber-100 p-1.5 rounded-lg text-amber-600">📝</span> 
            Instructor Script & Technical Citations
          </span>
          <span className={`transition-transform duration-300 ${showNotes ? 'rotate-180' : ''}`}>↓</span>
        </button>
        {showNotes && (
          <div className="px-8 pb-8 pt-2 animate-in slide-in-from-top-4 duration-500">
             <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-sm text-slate-600 leading-relaxed italic font-medium">
                  {renderText(currentSlide.instructorNotes)}
                </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlideViewer;
