
import React from 'react';
import { Course } from '../types';

interface CourseOutlineProps {
  course: Course;
}

const CourseOutline: React.FC<CourseOutlineProps> = ({ course }) => {
  return (
    <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto font-serif">
      <div className="text-center border-b-2 border-slate-900 pb-8 mb-10">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Internal Training Support Package (TSP)</h3>
        <h1 className="text-2xl font-black uppercase tracking-widest text-slate-900">Program of Instruction (POI)</h1>
        <h2 className="text-xl font-bold text-slate-700 mt-2">{course.title}</h2>
        <div className="flex justify-center gap-6 mt-4 text-sm font-bold text-slate-500 uppercase">
          <span>MOS: {course.mos}</span>
          <span>•</span>
          <span>Duration: {course.totalDuration} Hours</span>
        </div>
      </div>

      <div className="space-y-16">
        {course.lessons.map((lesson, lIdx) => (
          <div key={lesson.id} className="space-y-8">
            <div className="flex items-baseline gap-4">
              <span className="text-lg font-black text-slate-400">Lesson {lIdx + 1}.0</span>
              <h3 className="text-xl font-black text-slate-900 uppercase border-b-2 border-slate-900 flex-1 pb-1">
                {lesson.title}
              </h3>
            </div>

            {/* TLO Section */}
            <div className="pl-6">
              <div className="bg-slate-100 p-6 rounded-lg border border-slate-200 mb-8">
                <h4 className="text-xs font-black text-amber-700 uppercase tracking-widest mb-4">Terminal Learning Objective (TLO)</h4>
                <div className="space-y-3 text-sm leading-relaxed">
                  <p><span className="font-black text-slate-900">ACTION:</span> {lesson.tlo?.action}</p>
                  <p><span className="font-black text-slate-900">CONDITION:</span> {lesson.tlo?.condition}</p>
                  <p><span className="font-black text-slate-900">STANDARD:</span> {lesson.tlo?.standard}</p>
                </div>
              </div>

              {/* ELO & LSA Hierarchy */}
              <div className="space-y-12">
                {lesson.elos.map((elo, eIdx) => (
                  <div key={elo.id} className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-900 text-white text-xs font-black px-2 py-1 rounded">ELO {lIdx + 1}.{eIdx + 1}</span>
                      <h4 className="text-lg font-bold text-slate-800">{elo.title}</h4>
                    </div>

                    <div className="pl-6 space-y-10 border-l-2 border-slate-100">
                      {elo.learningStepActivities.map((lsa, lsaIdx) => (
                        <div key={lsaIdx} className="space-y-4">
                          <div className="flex items-center justify-between gap-4">
                            <h5 className="font-black text-slate-700 uppercase text-xs">LSA {lsaIdx + 1}: {lsa.title}</h5>
                            <div className="flex gap-2 text-[9px] font-black uppercase">
                              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">{lsa.method}</span>
                              <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{lsa.timeMinutes}m</span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 italic pl-4 border-l-2 border-amber-200">{lsa.description}</p>
                          
                          {/* LSA Specific Exercise */}
                          {lsa.practicalExercise && (
                            <div className="bg-amber-50/50 p-4 rounded border border-amber-100 mt-2">
                              <h6 className="text-[10px] font-black text-amber-700 uppercase mb-2">Learning Step Activity Exercise</h6>
                              <p className="text-xs font-bold text-slate-800 mb-2">{lsa.practicalExercise.title}</p>
                              <p className="text-xs text-slate-600 mb-3">{lsa.practicalExercise.description}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ul className="text-[10px] space-y-1">
                                  <li className="font-bold text-slate-500 uppercase">Process:</li>
                                  {lsa.practicalExercise.steps.map((s, i) => <li key={i}>• {s}</li>)}
                                </ul>
                                <ul className="text-[10px] space-y-1">
                                  <li className="font-bold text-slate-500 uppercase">Observer Checklist:</li>
                                  {lsa.practicalExercise.scoringCriteria.map((s, i) => <li key={i}>✓ {s}</li>)}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Check on Learning */}
                          {lsa.checkOnLearning && (
                            <div className="bg-emerald-50/50 p-4 rounded border border-emerald-100">
                              <h6 className="text-[10px] font-black text-emerald-700 uppercase mb-1">Check on Learning</h6>
                              <p className="text-xs font-bold text-slate-800">{lsa.checkOnLearning.question}</p>
                              <p className="text-xs text-emerald-700 mt-1">Ans: {lsa.checkOnLearning.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24 pt-10 border-t-2 border-slate-900 flex justify-between items-end">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
          TRADOC PAM 350-70-14 Compliant<br/>Instructional Support Package
        </div>
        <div className="text-slate-300 text-4xl font-black">UNCLASSIFIED</div>
      </div>
    </div>
  );
};

export default CourseOutline;
