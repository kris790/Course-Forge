
import React from 'react';
import { PracticalExercise } from '../types';

interface ExerciseCardProps {
  exercise: PracticalExercise;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-bold text-slate-800">{exercise.title}</h4>
        <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded uppercase">
          {exercise.type}
        </span>
      </div>
      <p className="text-sm text-slate-600 mb-4">{exercise.description}</p>
      
      <div className="mb-4">
        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Instructions</h5>
        <ul className="space-y-1">
          {exercise.steps.map((step, idx) => (
            <li key={idx} className="text-sm flex items-start gap-2">
              <span className="text-amber-500 font-bold">{idx + 1}.</span>
              <span className="text-slate-700">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Success Criteria</h5>
        <div className="flex flex-wrap gap-2">
          {exercise.scoringCriteria.map((crit, idx) => (
            <span key={idx} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">
              {crit}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;
