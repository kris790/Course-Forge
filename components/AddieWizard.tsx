
import React, { useState } from 'react';
import { AddiePhase, Course, Lesson, EnablingObjective as ELO, TerminalObjective as TLO, LearningStepActivity as LSA } from '../types';
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
  const [references, setReferences] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    mos: '27D',
    topic: 'Administrative Law & Separation Boards',
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
        formData.referenceMaterial
      );
      if (structure.lessons) setLessons(structure.lessons);
      if (structure.references) setReferences(structure.references);
    } catch (error) {
      console.error("Failed to generate course architecture:", error);
      alert("Error generating architecture. Please ensure your API key is valid.");
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

  const handleNext = async () => {
    if (phase === 'Analysis') {
      setPhase('Design');
    } else if (phase === 'Design') {
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
        description: `TJAGLCS Lesson Plan sequence for ${formData.topic}.`,
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
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">ADDIE Intelligence Engine</h2>
        <p className="text-slate-500 font-medium">TRADOC Pam 350-70-14 Compliant Workflow</p>
      </div>

      <div className="flex mb-10 relative">
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-200 -z-10"></div>
        {['Analysis', 'Design', 'Development'].map((p, idx) => (
          <div key={p} className="flex-1 text-center">
            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold text-sm mb-2 border-2 transition-all ${
              phase === p ? 'bg-amber-600 text-white border-amber-600 ring-4 ring-amber-100' : 
              'bg-white text-slate-400 border-slate-200'
            }`}>
              {idx + 1}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider ${phase === p ? 'text-amber-600' : 'text-slate-400'}`}>
              {p}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        {phase === 'Analysis' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">School / Proponent</label>
                <input 
                  type="text" 
                  value={formData.schoolName} 
                  onChange={(e) => setFormData({...formData, schoolName: e.target.value})} 
                  className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all bg-slate-50 focus:bg-white" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Course Identifier</label>
                <input 
                  type="text" 
                  value={formData.courseNumber} 
                  onChange={(e) => setFormData({...formData, courseNumber: e.target.value})} 
                  className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all bg-slate-50 focus:bg-white" 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Course Topic</label>
                <input 
                  type="text" 
                  value={formData.topic} 
                  onChange={(e) => setFormData({...formData, topic: e.target.value})} 
                  className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all bg-slate-50 focus:bg-white" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Target MOS</label>
                <input 
                  type="text" 
                  value={formData.mos} 
                  onChange={(e) => setFormData({...formData, mos: e.target.value})} 
                  className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all bg-slate-50 focus:bg-white" 
                />
              </div>
            </div>
            <div className="pt-4">
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Reference Material</label>
              <ReferenceMaterialUpload value={formData.referenceMaterial} onChange={(val) => setFormData(prev => ({ ...prev, referenceMaterial: val }))} />
            </div>
          </div>
        )}

        {phase === 'Design' && (
          <div className="space-y-6">
            {lessons.length === 0 ? (
              <div className="flex flex-col md:flex-row gap-4 py-10">
                <button 
                  onClick={handleGenerateArchitecture} 
                  disabled={loading} 
                  className="flex-1 bg-amber-600 text-white p-5 rounded-2xl font-bold shadow-lg hover:bg-amber-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : '🤖 Build POI Skeleton (TLO/ELO/LSAs)'}
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                   <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Program of Instruction (POI) Sequence</h3>
                   <button onClick={handleAddManualLesson} className="text-amber-600 text-[10px] font-bold uppercase hover:underline">+ add lesson</button>
                </div>

                {lessons.map((lesson, lessonIdx) => (
                  <div key={lesson.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative group animate-in slide-in-from-bottom-2 duration-300">
                    <button onClick={() => setLessons(lessons.filter((_, i) => i !== lessonIdx))} className="absolute top-4 right-4 text-slate-300 hover:text-red-500">✕</button>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                      <div className="flex-1 w-full">
                        <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">Lesson Title</label>
                        <input type="text" value={lesson.title} onChange={(e) => updateLesson(lessonIdx, { title: e.target.value })} className="bg-white border border-slate-200 rounded-lg p-3 text-lg font-bold outline-none w-full shadow-sm" />
                      </div>
                      <div className="w-full md:w-24">
                        <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block text-center">Duration</label>
                        <input type="number" value={lesson.durationHours} onChange={(e) => updateLesson(lessonIdx, { durationHours: parseInt(e.target.value) || 0 })} className="w-full bg-white border border-slate-200 p-3 rounded-lg font-bold text-center shadow-sm" />
                      </div>
                    </div>
                    {/* TLO Preview */}
                    <div className="mb-4 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                      <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2">TLO Strategy</h4>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase">Bloom's Action</label>
                        <input value={(lesson.tlo as any)?.action} onChange={(e) => updateTlo(lessonIdx, 'action', e.target.value)} className="w-full p-2 text-xs border border-amber-100 rounded-lg bg-white outline-none" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-12 flex justify-between border-t border-slate-100 pt-8">
          <button onClick={onCancel} className="text-slate-400 font-bold hover:text-slate-600 px-4 py-2">Cancel</button>
          <div className="flex gap-4">
            {phase === 'Design' && <button onClick={() => setPhase('Analysis')} className="px-8 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Back</button>}
            <button onClick={handleNext} className="bg-slate-900 text-white px-10 py-3 rounded-xl font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95">
              {phase === 'Design' ? 'Develop Detailed Lesson Plans' : 'Next: Design POI Architecture'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddieWizard;
