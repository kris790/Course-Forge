
import React, { useState } from 'react';
import { AddiePhase, Course, Lesson } from '../types';
import { generateCourseStructure } from '../services/geminiService';
import ReferenceMaterialUpload from './ReferenceMaterialUpload';

interface AddieWizardProps {
  onCourseCreated: (course: Course) => void;
  onCancel: () => void;
}

const AddieWizard: React.FC<AddieWizardProps> = ({ onCourseCreated, onCancel }) => {
  const [phase, setPhase] = useState<AddiePhase>('Analysis');
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState<Partial<Lesson>[]>([]);
  const [formData, setFormData] = useState({
    mos: '27D',
    topic: 'Administrative Law & Separation Boards',
    audience: 'Junior Enlisted (E1-E4)',
    duration: 40,
    referenceMaterial: '',
  });

  const handleGenerateArchitecture = async () => {
    setLoading(true);
    try {
      const structure = await generateCourseStructure(
        formData.mos, 
        formData.topic, 
        formData.duration,
        formData.referenceMaterial
      );
      if (structure.lessons) {
        setLessons(structure.lessons);
      }
    } catch (error) {
      console.error("Failed to generate course architecture:", error);
      alert("There was an error generating the course architecture. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddManualLesson = () => {
    const newLesson: Partial<Lesson> = {
      id: Math.random().toString(36).substr(2, 5),
      title: 'New Lesson',
      durationHours: 1,
      learningObjectives: ['Describe the standard operating procedure for...']
    };
    setLessons([...lessons, newLesson]);
  };

  const updateLesson = (idx: number, updates: Partial<Lesson>) => {
    const next = [...lessons];
    next[idx] = { ...next[idx], ...updates };
    setLessons(next);
  };

  const addObjective = (lessonIdx: number) => {
    const next = [...lessons];
    const lesson = next[lessonIdx];
    lesson.learningObjectives = [...(lesson.learningObjectives || []), ''];
    setLessons(next);
  };

  const updateObjective = (lessonIdx: number, objIdx: number, val: string) => {
    const next = [...lessons];
    if (next[lessonIdx].learningObjectives) {
      next[lessonIdx].learningObjectives[objIdx] = val;
    }
    setLessons(next);
  };

  const removeLesson = (idx: number) => {
    setLessons(lessons.filter((_, i) => i !== idx));
  };

  const handleNext = async () => {
    if (phase === 'Analysis') {
      setPhase('Design');
    } else if (phase === 'Design') {
      if (lessons.length === 0) {
        alert("Please generate or add at least one lesson for the course architecture.");
        return;
      }

      const newCourse: Course = {
        id: Math.random().toString(36).substr(2, 9),
        mos: formData.mos,
        title: formData.topic,
        description: `Comprehensive training course for MOS ${formData.mos} on ${formData.topic}.`,
        audience: formData.audience,
        totalDuration: lessons.reduce((acc, curr) => acc + (curr.durationHours || 0), 0),
        referenceMaterial: formData.referenceMaterial,
        lessons: lessons.map((l: any) => ({
          ...l,
          id: l.id || Math.random().toString(36).substr(2, 5),
          practicalExercises: [],
          tests: { 
            diagnostic: { versionType: 'Diagnostic', purpose: 'Assess entry-level knowledge', items: [] }, 
            formative: { versionType: 'Formative', purpose: 'Check-on-learning during module', items: [] }, 
            summative: { versionType: 'Summative', purpose: 'Final proficiency validation', items: [] } 
          }
        })) as Lesson[],
        status: 'Draft',
      };
      onCourseCreated(newCourse);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">New Course Wizard</h2>
        <p className="text-slate-500 font-medium">Following TRADOC Pamphlet 350-70-14 ADDIE Workflow.</p>
      </div>

      <div className="flex mb-10 relative">
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-200 -z-10"></div>
        {['Analysis', 'Design', 'Development', 'Implementation', 'Evaluation'].map((p, idx) => (
          <div key={p} className="flex-1 text-center">
            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold text-sm mb-2 border-2 transition-all ${
              phase === p ? 'bg-amber-600 text-white border-amber-600 ring-4 ring-amber-100' : 
              idx < ['Analysis', 'Design', 'Development', 'Implementation', 'Evaluation'].indexOf(phase) ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-400 border-slate-200'
            }`}>
              {idx + 1}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider ${phase === p ? 'text-amber-600' : 'text-slate-400'}`}>{p}</span>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        {phase === 'Analysis' && (
          <div className="space-y-8">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-800">Training Needs Analysis</h3>
              <p className="text-sm text-slate-500 mt-1">Define the core requirements for the curriculum.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Target MOS</label>
                <input 
                  type="text" 
                  value={formData.mos}
                  onChange={(e) => setFormData({...formData, mos: e.target.value})}
                  className="w-full border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm" 
                  placeholder="e.g. 11B, 27D"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Duration (Hours)</label>
                <input 
                  type="number" 
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                  className="w-full border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm" 
                  placeholder="40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Course Topic / Mission Task</label>
              <input 
                type="text" 
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                className="w-full border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm" 
                placeholder="e.g. Squad Tactics in Urban Environments"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Target Audience</label>
              <select 
                value={formData.audience}
                onChange={(e) => setFormData({...formData, audience: e.target.value})}
                className="w-full border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none bg-white transition-all shadow-sm"
              >
                <option>Initial Entry Training (IET)</option>
                <option>Junior Enlisted (E1-E4)</option>
                <option>Non-Commissioned Officers (E5-E7)</option>
                <option>Officers (O1-O4)</option>
              </select>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="mb-4">
                <h4 className="text-sm font-bold text-slate-800">Reference Materials</h4>
                <p className="text-xs text-slate-500 mt-1">Upload doctrinal publications or specific task lists to ground the generation in official standards.</p>
              </div>
              
              <ReferenceMaterialUpload 
                value={formData.referenceMaterial}
                onChange={(val) => setFormData(prev => ({ ...prev, referenceMaterial: val }))}
              />
            </div>
          </div>
        )}

        {phase === 'Design' && (
          <div className="space-y-8">
             <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-800">Design Strategy & POI Mapping</h3>
                <p className="text-sm text-slate-500 mt-1">Define learning objectives and lesson sequence.</p>
             </div>
             
             {lessons.length === 0 ? (
               <div className="space-y-6">
                 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Phase II Compliance Options</h4>
                    <p className="text-sm text-slate-600 mb-6">Start your design by letting the AI generate a sequence of lessons based on your Analysis data, or build it manually.</p>
                    <div className="flex flex-col md:flex-row gap-4">
                      <button 
                        onClick={handleGenerateArchitecture}
                        disabled={loading}
                        className="flex-1 bg-amber-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:bg-amber-700 transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : '🤖 Auto-Generate POI Architecture'}
                      </button>
                      <button 
                        onClick={handleAddManualLesson}
                        className="flex-1 bg-white border-2 border-slate-200 text-slate-700 font-bold py-4 px-6 rounded-xl hover:border-slate-400 transition-all"
                      >
                        ✍️ Manual Entry Mode
                      </button>
                    </div>
                 </div>
               </div>
             ) : (
               <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Module Sequence ({lessons.length} Lessons)</h4>
                    <button onClick={handleAddManualLesson} className="text-amber-600 text-[10px] font-bold uppercase hover:underline">+ Add Lesson</button>
                 </div>
                 
                 <div className="space-y-4">
                   {lessons.map((lesson, lessonIdx) => (
                     <div key={lesson.id} className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm relative group">
                       <button 
                        onClick={() => removeLesson(lessonIdx)} 
                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                        title="Remove Lesson"
                       >
                         ✕
                       </button>

                       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                         <div className="md:col-span-3">
                           <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Lesson Title</label>
                           <input 
                             type="text" 
                             value={lesson.title}
                             onChange={(e) => updateLesson(lessonIdx, { title: e.target.value })}
                             className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                           />
                         </div>
                         <div>
                           <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Hours</label>
                           <input 
                             type="number" 
                             value={lesson.durationHours}
                             onChange={(e) => updateLesson(lessonIdx, { durationHours: parseInt(e.target.value) || 0 })}
                             className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                           />
                         </div>
                       </div>

                       <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 flex justify-between items-center">
                           Learning Objectives (TPD)
                           <button onClick={() => addObjective(lessonIdx)} className="text-amber-600 hover:underline lowercase">+ add objective</button>
                         </label>
                         {lesson.learningObjectives?.map((obj, objIdx) => (
                           <div key={objIdx} className="flex gap-2">
                             <span className="text-amber-500 font-bold text-xs mt-2">{objIdx + 1}.</span>
                             <textarea 
                               value={obj}
                               onChange={(e) => updateObjective(lessonIdx, objIdx, e.target.value)}
                               className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                               rows={1}
                             />
                           </div>
                         ))}
                       </div>
                     </div>
                   ))}
                 </div>

                 <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-xs italic">
                    All objectives defined here will be used in the Development phase to ground the AI's generation of practical exercises, slides, and evaluations.
                 </div>
               </div>
             )}
          </div>
        )}

        <div className="mt-12 flex justify-between items-center border-t border-slate-100 pt-8">
          <button 
            onClick={onCancel}
            className="text-slate-400 font-bold hover:text-slate-600 transition-colors text-sm px-2"
          >
            Cancel Building
          </button>
          <div className="flex gap-4">
            {phase === 'Design' && (
              <button 
                onClick={() => setPhase('Analysis')}
                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
              >
                Back
              </button>
            )}
            <button 
              onClick={handleNext}
              disabled={loading}
              className={`bg-slate-900 text-white px-10 py-4 rounded-xl font-bold shadow-xl transition-all flex items-center gap-3 ${loading ? 'opacity-70 cursor-not-allowed scale-95' : 'hover:bg-slate-800 active:scale-95'}`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{phase === 'Design' ? 'Finalize Design & Create Course' : 'Next: Design Phase'}</span>
                  <span className="text-xl leading-none">→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddieWizard;
