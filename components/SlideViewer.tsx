
import React, { useState } from 'react';
import { Slide } from '../types';

interface SlideViewerProps {
  slides: Slide[];
}

const SlideViewer: React.FC<SlideViewerProps> = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  return (
    <div className="space-y-4">
      <div className="relative bg-slate-800 rounded-xl overflow-hidden shadow-2xl aspect-[16/9] flex flex-col border-4 border-slate-900">
        {/* Slide Header */}
        <div className="bg-slate-900 px-6 py-3 flex justify-between items-center border-b border-slate-700">
          <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Unclassified</span>
          <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Army CourseForge v1.0</span>
        </div>

        {/* Slide Content */}
        <div className="flex-1 p-10 flex flex-col">
          <h3 className="text-3xl font-bold text-amber-400 mb-8 border-b-2 border-amber-400/30 pb-4">
            {currentSlide.title}
          </h3>
          <ul className="space-y-4 flex-1">
            {currentSlide.bulletPoints.map((point, idx) => (
              <li key={idx} className="text-slate-100 text-lg flex items-start gap-3">
                <span className="text-amber-500 mt-1.5">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Slide Footer */}
        <div className="bg-slate-900 px-6 py-2 flex justify-between items-center border-t border-slate-700 text-[10px] font-bold text-slate-500">
          <span>{currentIndex + 1} / {slides.length}</span>
          <span className="uppercase tracking-widest">Unclassified</span>
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-6 right-6 flex gap-2">
          <button 
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white p-2 rounded backdrop-blur-sm transition-all"
          >
            &larr;
          </button>
          <button 
            onClick={() => setCurrentIndex(prev => Math.min(slides.length - 1, prev + 1))}
            disabled={currentIndex === slides.length - 1}
            className="bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white p-2 rounded backdrop-blur-sm transition-all"
          >
            &rarr;
          </button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg overflow-hidden">
        <button 
          onClick={() => setShowNotes(!showNotes)}
          className="w-full px-4 py-3 flex justify-between items-center text-amber-900 font-bold text-sm"
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">📋</span> Instructor Briefing Notes
          </span>
          <span>{showNotes ? 'Hide' : 'Show'}</span>
        </button>
        {showNotes && (
          <div className="px-4 pb-4 text-sm text-amber-800 leading-relaxed italic border-t border-amber-200 pt-3">
            {currentSlide.instructorNotes}
          </div>
        )}
      </div>
    </div>
  );
};

export default SlideViewer;
