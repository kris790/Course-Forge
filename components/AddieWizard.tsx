
import React, { useState } from 'react';
import { Course, Lesson, TerminalObjective as TLO } from '../types';
import { generateCourseStructure } from '../services/geminiService';
import ReferenceMaterialUpload from './ReferenceMaterialUpload';

interface AddieWizardProps {
  onCourseCreated: (course: Course) => void;
  onCancel: () => void;
}

const AddieWizard: React.FC<AddieWizardProps> = ({ onCourseCreated, onCancel }) => {
  const [step, setStep] = useState<'Setup' | 'Architecture'>('Setup');
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState<Partial<Lesson>[]>([]);
  const [references, setReferences] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    mos: '27D',
    topic: 'Administrative Law & Separation Boards',
    keyTasks: '', // New Field: Identified skills/tasks
    audience: 'Senior Paralegal (E5-E7)',
    duration: 8,
    referenceMaterial: '',
    courseNumber: 'TJAGLCS-2026-001',
    schoolName: 'The Judge Advocate General Legal Center and School',
    date: new Date().toISOString().split('T')[0]
  });

  const handleGenerateArchitecture = async () => {
    setLoading(true);
    try {
      const structure = await generateCourseStructure(
        formData.mos, 
        formData.topic, 
        formData.duration,
        formData.referenceMaterial,
        formData.keyTasks
      );
      if (structure.lessons) setLessons(structure.lessons);
      if (structure.references) setReferences(structure.references);
      setStep('Architecture');
    } catch (error) {
      console.error("Failed to generate course architecture:", error);
      alert("Error generating architecture. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddManualLesson = () => {
    const newLesson: Partial<Lesson> = {
      id: Math.random().toString(36).substr(2, 5),
      title: 'New Lesson',
      durationHours: 1,
      tlo: { action: '', condition: '', standard: '' },
      elos: []
    };
    setLessons([...lessons, newLesson]);
  };

  const updateLesson = (idx: number, updates: Partial<Lesson>) => {
    const next = [...lessons];
    next[idx] = { ...next[idx], ...updates };
    setLessons(next);
  };

  const updateTlo = (idx: number, field: keyof TLO, val: string) => {
    const next = [...lessons];
    const lesson = next[idx];
    if (lesson.tlo) {
      lesson.tlo = { ...lesson.tlo, [field]: val };
      setLessons(next);
    }
  };

  const handleFinalize = () => {
    if (lessons.length === 0) {
      alert("Please define at least one lesson.");
      return;
    }

    const newCourse: Course = {
      id: Math.random().toString(36).substr(2, 9),
      courseNumber: formData.courseNumber,
      schoolName: formData.schoolName,
      mos: formData.mos,
      title: formData.topic,
      description: `Targeting tasks: ${formData.keyTasks.substring(0, 100)}...`,
      audience: formData.audience,
      totalDuration: lessons.reduce((acc, curr) => acc + (curr.durationHours || 0), 0),
      referenceMaterial: formData.referenceMaterial,
      references: references,
      date: formData.date,
      lessons: lessons.map((l: any) => ({
        id: l.id || Math.random().toString(36).substr(2, 5),
        title: l.title || '',
        durationHours: l.durationHours || 0,
        tlo: l.tlo,
        elos: (l.elos || []).map((elo: any) => ({
          id: elo.id || Math.random().toString(36).substr(2, 4),
          title: elo.title || '',
          learningStepActivities: elo.learningStepActivities || []
        })),
        slides: l.slides || []
      })) as Lesson[],
      courseTests: { 
        diagnostic: { versionType: 'Diagnostic', purpose: 'Assess prerequisite knowledge', items: [] }, 
        formative: { versionType: 'Formative', purpose: 'Monitor progress during learning', items: [] }, 
        summative: { versionType: 'Summative', purpose: 'Final proficiency validation', items: [] } 
      },
      status: 'Draft',
    };
    onCourseCreated(newCourse);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">RAPID FORGE</h2>
          <p className="text-slate-500 font-medium">Accelerated Course Development for Pre-Analyzed Tasks</p>
        </div>
        <div className="flex gap-1">
          <div className={`w-3 h-3 rounded-full ${step === 'Setup' ? 'bg-amber-600' : 'bg-slate-200'}`}></div>
          <div className={`w-3 h-3 rounded-full ${step === 'Architecture' ? 'bg-amber-600' : 'bg-slate-200'}`}></div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        {step === 'Setup' && (
          <div className="space-y-8">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-4 items-center">
              <span className="text-xl">⚡</span>
              <p className="text-xs text-blue-800 font-medium">
                <strong>Streamlined Path Enabled:</strong> We'll skip deep analysis and jump straight into instructional design using your provided tasks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Course Identifier / MOS</label>
                  <div className="flex gap-2">
                    <input 
                      placeholder="e.g. 27D"
                      type="text" 
                      value={formData.mos} 
                      onChange={(e) => setFormData({...formData, mos: e.target.value})} 
                      className="w-1/3 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all bg-slate-50 font-bold" 
                    />
                    <input 
                      placeholder="Course Number"
                      type="text" 
                      value={formData.courseNumber} 
                      onChange={(e) => setFormData({...formData, courseNumber: e.target.value})} 
                      className="flex-1 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all bg-slate-50" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Main Course Topic</label>
                  <input 
                    type="text" 
                    value={formData.topic} 
                    onChange={(e) => setFormData({...formData, topic: e.target.value})} 
                    className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all bg-slate-50 focus:bg-white font-bold" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Identified Tasks/Skills (Already Analyzed)</label>
                  <textarea 
                    placeholder="List specific Army tasks or skills you want this course to address..."
                    rows={4}
                    value={formData.keyTasks} 
                    onChange={(e) => setFormData({...formData, keyTasks: e.target.value})} 
                    className="w-full border border-slate-200 p-4 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all bg-white shadow-inner text-sm font-medium" 
                  />
                  <p className="text-[9px] text-slate-400 italic">These will be used to automatically define your ELAs and LSAs.</p>
                </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Proponent School</label>
                  <input 
                    type="text" 
                    value={formData.schoolName} 
                    onChange={(e) => setFormData({...formData, schoolName: e.target.value})} 
                    className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all bg-slate-50" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Reference Material (Optional)</label>
                  <ReferenceMaterialUpload value={formData.referenceMaterial} onChange={(val) => setFormData(prev => ({ ...prev, referenceMaterial: val }))} />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex justify-end">
               <button 
                onClick={handleGenerateArchitecture} 
                disabled={loading}
                className="bg-amber-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl hover:bg-amber-700 transition-all active:scale-95 flex items-center gap-4 uppercase tracking-widest text-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : 'Forge POI Skeleton 🤖'}
              </button>
            </div>
          </div>
        )}

        {step === 'Architecture' && (
          <div className="space-y-10">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
               <div>
                 <h3 className="text-xl font-bold text-slate-900">Architecture Review</h3>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Design Phase</p>
               </div>
               <button onClick={handleAddManualLesson} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-slate-200 transition-all">+ Add Lesson</button>
            </div>

            <div className="space-y-8">
              {lessons.map((lesson, lessonIdx) => (
                <div key={lesson.id} className="bg-slate-50 p-8 rounded-3xl border border-slate-200 relative animate-in slide-in-from-bottom-4 duration-500 shadow-sm">
                  <button onClick={() => setLessons(lessons.filter((_, i) => i !== lessonIdx))} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors">✕</button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Lesson Module Title</label>
                      <input type="text" value={lesson.title} onChange={(e) => updateLesson(lessonIdx, { title: e.target.value })} className="bg-white border border-slate-200 rounded-xl p-4 text-lg font-bold outline-none w-full shadow-inner" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest text-center block">Hours</label>
                      <input type="number" value={lesson.durationHours} onChange={(e) => updateLesson(lessonIdx, { durationHours: parseInt(e.target.value) || 0 })} className="w-full bg-white border border-slate-200 p-4 rounded-xl font-bold text-center shadow-inner" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-amber-600 uppercase tracking-widest">TLO Action (Level 5+)</label>
                      <input value={(lesson.tlo as any)?.action} onChange={(e) => updateTlo(lessonIdx, 'action', e.target.value)} className="w-full p-3 text-xs border border-slate-100 rounded-xl bg-slate-50 outline-none font-medium focus:bg-white focus:ring-1 focus:ring-amber-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Condition</label>
                      <input value={(lesson.tlo as any)?.condition} onChange={(e) => updateTlo(lessonIdx, 'condition', e.target.value)} className="w-full p-3 text-xs border border-slate-100 rounded-xl bg-slate-50 outline-none font-medium focus:bg-white focus:ring-1 focus:ring-amber-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Standard</label>
                      <input value={(lesson.tlo as any)?.standard} onChange={(e) => updateTlo(lessonIdx, 'standard', e.target.value)} className="w-full p-3 text-xs border border-slate-100 rounded-xl bg-slate-50 outline-none font-medium focus:bg-white focus:ring-1 focus:ring-amber-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-10 flex justify-between items-center border-t border-slate-100">
               <button onClick={() => setStep('Setup')} className="text-slate-400 font-bold hover:text-slate-600 px-6 py-2 transition-colors">← Back to Configuration</button>
               <button onClick={handleFinalize} className="bg-slate-900 text-white px-12 py-4 rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all active:scale-95 uppercase tracking-widest text-sm">
                Finalize Design & Start Development →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddieWizard;
