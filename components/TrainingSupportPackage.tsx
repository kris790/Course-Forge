
import React from 'react';
import { Course, Lesson } from '../types';

interface TrainingSupportPackageProps {
  course: Course;
}

const TrainingSupportPackage: React.FC<TrainingSupportPackageProps> = ({ course }) => {
  const renderScriptWithMarkers = (script: string) => {
    if (!script) return <p className="text-slate-400 italic">No script generated yet.</p>;
    
    // Split script by [SHOW SLIDE X] markers
    const parts = script.split(/(\[SHOW SLIDE \d+\])/g);
    
    return (
      <div className="space-y-4 text-sm leading-relaxed text-slate-800 font-serif whitespace-pre-wrap">
        {parts.map((part, i) => {
          const slideMatch = part.match(/\[SHOW SLIDE (\d+)\]/);
          if (slideMatch) {
            return (
              <div key={i} className="my-6 p-3 border-y-2 border-amber-400 bg-amber-50 text-center font-black text-amber-900 uppercase tracking-widest text-[10px]">
                {part}
              </div>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Official Cover Page */}
      <div className="bg-white p-12 md:p-20 border-4 border-slate-900 shadow-2xl rounded-none text-center space-y-12 font-serif relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-900"></div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-slate-900"></div>
        
        <div className="space-y-2">
          <p className="font-black text-slate-900 tracking-widest uppercase text-sm">Headquarters</p>
          <p className="font-black text-slate-900 tracking-widest uppercase text-sm">Department of the Army</p>
          <p className="text-xs text-slate-500 italic">CourseForge Automated TSP v1.0</p>
        </div>

        <div className="py-10 border-y border-slate-200">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">Training Support Package</h1>
          <h2 className="text-2xl font-bold text-slate-700">{course.title}</h2>
          <p className="text-amber-700 font-black mt-4 uppercase tracking-widest text-sm">MOS: {course.mos}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-left text-xs">
          <div className="space-y-4">
            <div>
              <p className="font-black uppercase text-slate-400 mb-1">Target Audience</p>
              <p className="font-bold text-slate-900">{course.audience}</p>
            </div>
            <div>
              <p className="font-black uppercase text-slate-400 mb-1">Total Duration</p>
              <p className="font-bold text-slate-900">{course.totalDuration} Hours</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="font-black uppercase text-slate-400 mb-1">Status</p>
              <p className="font-bold text-emerald-600">{course.status}</p>
            </div>
            <div>
              <p className="font-black uppercase text-slate-400 mb-1">System ID</p>
              <p className="font-mono text-slate-500 uppercase">{course.id}</p>
            </div>
          </div>
        </div>

        <div className="pt-10">
          <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.5em]">Unclassified // For Official Use Only</p>
        </div>
      </div>

      {/* References Section */}
      <div className="bg-white p-10 border border-slate-200 shadow-sm rounded-xl font-serif">
        <h3 className="text-xl font-black text-slate-900 uppercase mb-6 border-b-2 border-slate-900 pb-2">Section I. References</h3>
        <ul className="space-y-2 text-sm text-slate-700">
          {course.references?.map((ref, i) => (
            <li key={i} className="flex gap-4">
              <span className="font-black text-slate-400">00{i+1}.</span>
              <span>{ref}</span>
            </li>
          ))}
          {(!course.references || course.references.length === 0) && (
            <li className="text-slate-400 italic">No master references listed.</li>
          )}
        </ul>
      </div>

      {/* Course Outline Section */}
      <div className="bg-white p-10 border border-slate-200 shadow-sm rounded-xl font-serif">
        <h3 className="text-xl font-black text-slate-900 uppercase mb-6 border-b-2 border-slate-900 pb-2">Section II. Program of Instruction (POI)</h3>
        <div className="space-y-8">
          {course.lessons.map((lesson, lIdx) => (
            <div key={lesson.id} className="space-y-4">
              <div className="flex items-baseline gap-4">
                <span className="font-black text-slate-300">L{lIdx+1}</span>
                <h4 className="font-black text-slate-900 uppercase text-lg">{lesson.title}</h4>
              </div>
              <div className="pl-12 space-y-4 text-xs text-slate-600">
                <p><span className="font-black text-slate-900">TLO:</span> {lesson.tlo?.action}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-black text-slate-400 block mb-1">Objectives:</span>
                    <ul className="list-disc list-inside">
                      {lesson.elos.map(elo => <li key={elo.id}>{elo.title}</li>)}
                    </ul>
                  </div>
                  <div>
                    <span className="font-black text-slate-400 block mb-1">Specific Refs:</span>
                    <ul className="list-disc list-inside">
                      {lesson.armyRegulations?.map((reg, i) => <li key={i}>{reg}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructional Script Section */}
      <div className="bg-white p-10 border border-slate-200 shadow-sm rounded-xl font-serif">
        <h3 className="text-xl font-black text-slate-900 uppercase mb-6 border-b-2 border-slate-900 pb-2">Section III. Instructional Scripts</h3>
        <div className="space-y-20">
          {course.lessons.map((lesson, lIdx) => (
            <div key={lesson.id} className="space-y-8">
              <div className="bg-slate-900 text-white p-4 -mx-10 flex justify-between items-center">
                <span className="font-black uppercase tracking-widest text-xs">Module {lIdx+1} Instructor Guide</span>
                <span className="text-xs opacity-60 font-mono">{lesson.id}</span>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-black uppercase text-slate-800">Lesson Narrative and Cues</h4>
                <div className="prose prose-slate max-w-none">
                  {renderScriptWithMarkers(lesson.script || "")}
                </div>
              </div>

              {/* LSA Detailed Exercises */}
              <div className="space-y-8 pt-10 border-t border-slate-100">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Practical Exercises & Observations</h4>
                {lesson.elos.flatMap(e => e.learningStepActivities).map((lsa, i) => (
                  lsa.practicalExercise ? (
                    <div key={i} className="bg-slate-50 p-6 rounded-lg border-l-4 border-slate-900 space-y-4">
                      <div className="flex justify-between items-start">
                        <h5 className="font-black text-slate-900 uppercase text-sm">EXERCISE: {lsa.practicalExercise.title}</h5>
                        <span className="text-[10px] font-black bg-slate-200 px-2 py-1 rounded">{lsa.method}</span>
                      </div>
                      <p className="text-sm text-slate-600 italic">{lsa.practicalExercise.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                        <div className="space-y-2">
                          <p className="font-black uppercase text-slate-500">Execution Steps:</p>
                          <ol className="list-decimal list-inside space-y-1">
                            {lsa.practicalExercise.steps.map((s, idx) => <li key={idx}>{s}</li>)}
                          </ol>
                        </div>
                        <div className="space-y-2">
                          <p className="font-black uppercase text-slate-500">Observer Proficiency Checklist:</p>
                          <ul className="list-none space-y-1">
                            {lsa.practicalExercise.scoringCriteria.map((s, idx) => <li key={idx}>[ ] {s}</li>)}
                          </ul>
                        </div>
                      </div>

                      {lsa.checkOnLearning && (
                        <div className="pt-4 mt-4 border-t border-slate-200">
                          <p className="text-[10px] font-black text-emerald-700 uppercase mb-1">Check on Learning (Verification)</p>
                          <p className="text-xs font-bold text-slate-800">Q: {lsa.checkOnLearning.question}</p>
                          <p className="text-xs text-slate-500 mt-1">A: {lsa.checkOnLearning.answer}</p>
                        </div>
                      )}
                    </div>
                  ) : null
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tests Section */}
      <div className="bg-white p-10 border border-slate-200 shadow-sm rounded-xl font-serif">
        <h3 className="text-xl font-black text-slate-900 uppercase mb-6 border-b-2 border-slate-900 pb-2">Section IV. Comprehensive Course Tests</h3>
        <p className="text-sm text-slate-500 mb-10 italic">Note: These assessments cover the entire POI across all lessons.</p>
        
        <div className="space-y-16">
          {['diagnostic', 'formative', 'summative'].map((v) => {
            const test = (course.courseTests as any)[v];
            if (!test || test.items.length === 0) return null;
            return (
              <div key={v} className="space-y-6">
                <h4 className="font-black uppercase text-slate-900 border-l-4 border-amber-600 pl-4 py-1">{v} Examination Version</h4>
                <div className="space-y-8">
                  {test.items.map((item: any, i: number) => (
                    <div key={i} className="text-sm space-y-3">
                      <div className="flex gap-4">
                        <span className="font-black text-slate-400">Q{i+1}.</span>
                        <p className="font-bold text-slate-800">{item.question}</p>
                      </div>
                      {item.options && (
                        <div className="pl-12 grid grid-cols-2 gap-2 text-xs text-slate-600">
                          {item.options.map((opt: string, oIdx: number) => (
                            <div key={oIdx}>({String.fromCharCode(65+oIdx)}) {opt}</div>
                          ))}
                        </div>
                      )}
                      <div className="pl-12 text-[10px] font-black text-emerald-600 uppercase">Correct Response: {item.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">End of Training Support Package Package</p>
      </div>
    </div>
  );
};

export default TrainingSupportPackage;
