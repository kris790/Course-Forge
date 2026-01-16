
import React from 'react';
import { Course, Lesson } from '../types';

interface LessonPlanDocumentProps {
  course: Course;
  lesson: Lesson;
}

const LessonPlanDocument: React.FC<LessonPlanDocumentProps> = ({ course, lesson }) => {
  return (
    <div className="bg-white p-12 md:p-16 border border-slate-200 shadow-xl max-w-5xl mx-auto font-serif space-y-12">
      {/* Header */}
      <div className="border-b-4 border-slate-900 pb-8 space-y-2">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Lesson Plan</h1>
        <div className="grid grid-cols-2 gap-x-12 text-sm">
          <p><span className="font-black uppercase text-[10px] text-slate-400">Course Title:</span> {course.title}</p>
          <p><span className="font-black uppercase text-[10px] text-slate-400">Course Number:</span> {course.courseNumber || 'TBD'}</p>
          <p><span className="font-black uppercase text-[10px] text-slate-400">School/Proponent:</span> {course.schoolName || 'The Judge Advocate General Legal Center and School'}</p>
          <p><span className="font-black uppercase text-[10px] text-slate-400">Date:</span> {course.date || new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Introduction */}
      <section className="space-y-4">
        <h2 className="text-xl font-black uppercase bg-slate-100 px-4 py-2 border-l-4 border-slate-900">Introduction</h2>
        <div className="pl-4 space-y-6 text-sm leading-relaxed">
          <div>
            <h3 className="font-black uppercase text-[10px] text-slate-500 mb-1">Scope</h3>
            <p>{lesson.scope || 'No scope provided.'}</p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-black uppercase text-[10px] text-slate-500 mb-1">Target Audience</h3>
              <p>Senior Paralegals</p>
            </div>
            <div>
              <h3 className="font-black uppercase text-[10px] text-slate-500 mb-1">Prerequisites</h3>
              <p>{lesson.prerequisites || 'None specified.'}</p>
            </div>
          </div>
          <p><span className="font-black uppercase text-[10px] text-slate-500 mr-2">Course Length:</span> {lesson.durationHours} academic hours</p>
        </div>
      </section>

      {/* TLO Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-black uppercase bg-slate-100 px-4 py-2 border-l-4 border-slate-900">Terminal Learning Objective (TLO)</h2>
        <div className="pl-4 space-y-4 text-sm bg-amber-50/30 p-6 rounded-lg border border-amber-100">
          <p><span className="font-black text-slate-900">ACTION:</span> {lesson.tlo?.action}</p>
          <p><span className="font-black text-slate-900">CONDITION:</span> {lesson.tlo?.condition || 'In a classroom environment with a computer, internet, and online reference materials'}</p>
          <p><span className="font-black text-slate-900">STANDARD:</span> {lesson.tlo?.standard}</p>
        </div>
      </section>

      {/* ELO & LSA Section */}
      <section className="space-y-8">
        <h2 className="text-xl font-black uppercase bg-slate-100 px-4 py-2 border-l-4 border-slate-900">Enabling Learning Objectives & Activities</h2>
        {lesson.elos.map((elo, idx) => (
          <div key={elo.id} className="pl-4 space-y-6">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-3">
              <span className="bg-slate-900 text-white text-xs px-2 py-1">ELO {idx + 1}</span>
              {elo.title}
            </h3>
            
            <div className="space-y-10 pl-6 border-l-2 border-slate-100">
              {elo.learningStepActivities.map((lsa, lIdx) => (
                <div key={lIdx} className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400">
                    <span>LSA {lIdx + 1}: {lsa.method}</span>
                    <span>{lsa.timeMinutes} MINS</span>
                  </div>
                  <h4 className="font-bold text-slate-800 underline">{lsa.title}</h4>
                  <div className="text-sm space-y-4">
                    <p className="italic text-slate-600">{lsa.description}</p>
                    <div className="bg-slate-50 p-4 rounded border border-slate-200">
                      <h5 className="font-black uppercase text-[10px] text-slate-400 mb-2 tracking-widest">Step-by-Step Guidance (ELM)</h5>
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {lsa.guidance || 'Instructional guidance adhering to the Experiential Learning Model.'}
                      </div>
                    </div>
                    {lsa.checkOnLearning && (
                      <div className="flex gap-4 items-start border-t border-slate-100 pt-3">
                        <span className="text-emerald-600 font-black uppercase text-[10px] mt-1">Check on Learning:</span>
                        <p className="font-medium">{lsa.checkOnLearning.question}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Resources & Summary */}
      <section className="grid grid-cols-2 gap-12 text-sm border-t border-slate-200 pt-10">
        <div className="space-y-4">
          <h2 className="font-black uppercase text-slate-400 tracking-widest">Resources</h2>
          <div className="space-y-2">
             <p><span className="font-bold">Media:</span> {lesson.media || 'PowerPoint Slides'}</p>
             <p><span className="font-bold">Ratio:</span> {lesson.ratio || '1:16'}</p>
             <p><span className="font-bold">Materials:</span> Computer with internet capabilities and access to online reference materials.</p>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="font-black uppercase text-slate-400 tracking-widest">Special Instr. Quals</h2>
          <p>{lesson.instructorQualifications || 'Standard Senior Paralegal Instructor (MOS 27D)'}</p>
        </div>
      </section>

      <div className="pt-10 text-center">
        <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em]">Instructional guidance adheres to the Experiential Learning Model</p>
      </div>
    </div>
  );
};

export default LessonPlanDocument;
