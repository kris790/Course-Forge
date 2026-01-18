import React, { useState } from 'react';
import { PracticalExercise } from '../types';

interface ExerciseCardProps {
  exercise: PracticalExercise;
  onUpdate?: (updated: PracticalExercise) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onUpdate }) => {
  const [isAddingEssay, setIsAddingEssay] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [essayQuestion, setEssayQuestion] = useState('');
  const [essayRubric, setEssayRubric] = useState('');

  const handleAddEssay = () => {
    setAttemptedSubmit(true);
    if (!essayQuestion.trim() || !essayRubric.trim() || !onUpdate) {
      return;
    }
    
    const updatedExercise: PracticalExercise = {
      ...exercise,
      scoringCriteria: [
        ...exercise.scoringCriteria,
        `SHORT ANSWER ESSAY: ${essayQuestion.trim()} | RUBRIC: ${essayRubric.trim()}`
      ]
    };
    
    onUpdate(updatedExercise);
    setEssayQuestion('');
    setEssayRubric('');
    setIsAddingEssay(false);
    setAttemptedSubmit(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg">{exercise.title}</h4>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">Instructional Validation Module</p>
        </div>
        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded-lg uppercase tracking-widest border border-amber-200">
          {exercise.type}
        </span>
      </div>
      
      <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100">
        <p className="text-sm text-slate-600 leading-relaxed italic">{exercise.description}</p>
      </div>
      
      <div className="mb-8">
        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="w-1 h-3 bg-slate-300 rounded-full"></span>
          Execution Steps
        </h5>
        <ul className="space-y-3">
          {exercise.steps.map((step, idx) => (
            <li key={idx} className="text-sm flex items-start gap-3 group">
              <span className="bg-white border border-slate-200 text-slate-400 font-black text-[10px] w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 group-hover:border-amber-400 group-hover:text-amber-600 transition-colors">
                {idx + 1}
              </span>
              <span className="text-slate-700 font-medium leading-relaxed">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-3 bg-amber-400 rounded-full"></span>
            Success Criteria & Evaluation
          </h5>
          {onUpdate && !isAddingEssay && (
            <button 
              onClick={() => { setIsAddingEssay(true); setAttemptedSubmit(false); }}
              className="text-[10px] font-black text-amber-600 uppercase hover:text-amber-700 transition-colors flex items-center gap-1 bg-amber-50 px-2 py-1 rounded"
            >
              ➕ Add Essay Question
            </button>
          )}
        </div>

        <div className="space-y-2">
          {exercise.scoringCriteria.map((crit, idx) => {
            const isEssay = crit.startsWith('SHORT ANSWER ESSAY:');
            let displayCrit = crit;
            let rubricPart = '';
            
            if (isEssay) {
              const parts = crit.split(' | RUBRIC: ');
              displayCrit = parts[0];
              rubricPart = parts[1] || '';
            }

            return (
              <div key={idx} className={`text-xs p-3 rounded-xl border flex flex-col gap-2 transition-all ${
                isEssay 
                  ? 'bg-purple-50 border-purple-100 text-purple-900' 
                  : 'bg-white border-slate-100 text-slate-600 shadow-sm'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="shrink-0">{isEssay ? '✍️' : '✓'}</span>
                  <span className={isEssay ? 'font-bold' : ''}>{displayCrit}</span>
                </div>
                {isEssay && rubricPart && (
                  <div className="ml-8 mt-1 p-2 bg-white/50 border border-purple-200 rounded text-[10px] italic text-purple-700">
                    <span className="font-black uppercase text-[8px] block mb-1 flex items-center gap-1">
                      <span className="text-xs">📝</span> Grading Rubric:
                    </span>
                    {rubricPart}
                  </div>
                )}
              </div>
            );
          })}

          {isAddingEssay && (
            <div className="space-y-4 p-5 bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 shadow-inner">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-amber-800 uppercase flex items-center gap-1">
                    <span className="text-xs">1.</span> Draft Essay Question <span className="text-red-500">*</span>
                  </label>
                  {attemptedSubmit && !essayQuestion.trim() && <span className="text-[9px] font-black text-red-500 uppercase animate-pulse">Required</span>}
                </div>
                <textarea
                  autoFocus
                  value={essayQuestion}
                  onChange={(e) => setEssayQuestion(e.target.value)}
                  placeholder="Describe the legal implications of..."
                  className={`w-full bg-white border rounded-xl p-3 text-xs outline-none focus:ring-2 shadow-sm transition-all ${
                    attemptedSubmit && !essayQuestion.trim() ? 'border-red-400 focus:ring-red-500' : 'border-amber-200 focus:ring-amber-500'
                  }`}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-purple-700 uppercase flex items-center gap-1">
                    <span className="text-xs">2.</span> Mandatory Rubric <span className="text-red-500">*</span>
                  </label>
                  {attemptedSubmit && !essayRubric.trim() && <span className="text-[9px] font-black text-red-500 uppercase animate-pulse">Required</span>}
                </div>
                <textarea
                  value={essayRubric}
                  onChange={(e) => setEssayRubric(e.target.value)}
                  placeholder="List specific criteria for grading (e.g. 1. Mentions Jurisdiction, 2. Cites AR 27-10...)"
                  className={`w-full bg-white border rounded-xl p-3 text-xs outline-none focus:ring-2 shadow-sm transition-all ${
                    attemptedSubmit && !essayRubric.trim() ? 'border-red-400 focus:ring-red-500' : 'border-purple-200 focus:ring-purple-500'
                  }`}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setIsAddingEssay(false)}
                  className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase hover:text-slate-600 transition-colors"
                >
                  Discard
                </button>
                <button 
                  onClick={handleAddEssay}
                  className="px-6 py-2 bg-amber-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg hover:bg-amber-700 transition-all active:scale-95"
                >
                  Save to Criteria
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;