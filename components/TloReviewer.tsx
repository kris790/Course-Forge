
import React from 'react';
import { TloSuggestion, Course } from '../types';

interface TloReviewerProps {
  suggestions: TloSuggestion[];
  course: Course;
  onApply: (suggestion: TloSuggestion) => void;
  onClose: () => void;
}

const TloReviewer: React.FC<TloReviewerProps> = ({ suggestions, course, onApply, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
          <div>
            <h3 className="font-black uppercase tracking-widest text-sm text-amber-500">Compliance Review</h3>
            <h2 className="text-xl font-bold">TLO Improvement Suggestions</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex gap-4 items-start">
            <span className="text-2xl">💡</span>
            <div className="text-sm text-blue-800 leading-relaxed">
              The AI has reviewed your Terminal Learning Objectives against <strong>TRADOC Pam 350-70-14</strong> standards. 
              Review the suggested improvements for Action verbs (Bloom's Level 5+), specific Conditions, and measurable Standards.
            </div>
          </div>

          {suggestions.map((sug, idx) => {
            const lesson = course.lessons.find(l => l.id === sug.lessonId);
            return (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-slate-50">
                <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                  <h4 className="font-bold text-slate-700">{sug.lessonTitle}</h4>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Lesson Objective Review</span>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Current View */}
                  <div className="space-y-4 opacity-60">
                    <h5 className="text-[10px] font-black uppercase text-slate-400 border-b pb-1">Current TLO</h5>
                    <div className="space-y-2 text-xs">
                      <p><span className="font-black text-slate-900">ACTION:</span> {lesson?.tlo?.action || 'N/A'}</p>
                      <p><span className="font-black text-slate-900">CONDITION:</span> {lesson?.tlo?.condition || 'N/A'}</p>
                      <p><span className="font-black text-slate-900">STANDARD:</span> {lesson?.tlo?.standard || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Suggestion View */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase text-emerald-600 border-b border-emerald-100 pb-1">Suggested Improvement</h5>
                    <div className="space-y-2 text-xs">
                      <p><span className="font-black text-emerald-700">ACTION:</span> {sug.suggestedAction}</p>
                      <p><span className="font-black text-emerald-700">CONDITION:</span> {sug.suggestedCondition}</p>
                      <p><span className="font-black text-emerald-700">STANDARD:</span> {sug.suggestedStandard}</p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-white border-t border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-amber-600 uppercase mb-1">AI Reasoning</p>
                    <p className="text-xs text-slate-500 italic">{sug.reasoning}</p>
                  </div>
                  <button 
                    onClick={() => onApply(sug)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold text-xs shadow-md transition-all whitespace-nowrap"
                  >
                    Apply Suggestion
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-2 text-slate-500 font-bold hover:text-slate-800 transition-colors"
          >
            Finished Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default TloReviewer;
