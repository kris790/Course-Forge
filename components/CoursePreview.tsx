
import React, { useState } from 'react';
import { Course, Lesson, SubSection, Slide } from '../types';
import { 
  generateTLO, 
  generateELOsAndLSAs, 
  generateSubSectionContent, 
  generateSectionCOL, 
  generateThreeExamVersions,
  generateLessonSlideDeck
} from '../services/geminiService';
import SlideViewer from './SlideViewer';
import ExerciseCard from './ExerciseCard';
import TestCard from './TestCard';
import TrainingSupportPackage from './TrainingSupportPackage';

interface CoursePreviewProps {
  course: Course;
  onUpdateCourse: (updated: Course) => void;
  onBack: () => void;
}

const CoursePreview: React.FC<CoursePreviewProps> = ({ course, onUpdateCourse, onBack }) => {
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(course.lessons[0]?.id || null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'workflow' | 'tsp' | 'exams'>('workflow');

  const selectedLesson = course.lessons.find(l => l.id === selectedLessonId);

  const updateLessonInCourse = (lessonId: string, updates: Partial<Lesson>) => {
    const updatedLessons = course.lessons.map(l => l.id === lessonId ? { ...l, ...updates } : l);
    onUpdateCourse({ ...course, lessons: updatedLessons });
  };

  const handleGenerateTLO = async () => {
    if (!selectedLesson) return;
    setLoading(true);
    try {
      const tlo = await generateTLO(selectedLesson.title, course.referenceMaterial || '');
      updateLessonInCourse(selectedLesson.id, { tlo, stage: 'TLO_Generation' });
    } catch (e) {
      alert("Error generating TLO.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTLO = () => {
    if (!selectedLesson) return;
    updateLessonInCourse(selectedLesson.id, { stage: 'ELO_LSA_Generation' });
  };

  const handleGenerateELOs = async () => {
    if (!selectedLesson) return;
    setLoading(true);
    try {
      const elos = await generateELOsAndLSAs(selectedLesson, course.referenceMaterial || '');
      const subSections: SubSection[] = elos.map(elo => ({
        id: elo.id,
        title: elo.title,
        type: 'ELO',
        isVerified: false
      }));
      updateLessonInCourse(selectedLesson.id, { elos, subSections, stage: 'Outline_Verification' });
    } catch (e) {
      alert("Error generating ELOs.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOutline = () => {
    if (!selectedLesson) return;
    updateLessonInCourse(selectedLesson.id, { stage: 'Subsection_Development', currentSubSectionIndex: 0 });
  };

  const handleDevelopSubSection = async () => {
    if (!selectedLesson) return;
    const subIdx = selectedLesson.currentSubSectionIndex;
    const sub = selectedLesson.subSections[subIdx];
    setLoading(true);
    try {
      const content = await generateSubSectionContent(sub, selectedLesson, course.referenceMaterial || '');
      const updatedSubs = [...selectedLesson.subSections];
      updatedSubs[subIdx] = { ...sub, ...content };
      updateLessonInCourse(selectedLesson.id, { subSections: updatedSubs });
    } catch (e) {
      alert("Error developing subsection.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgeLessonDeck = async () => {
    if (!selectedLesson) return;
    setLoading(true);
    try {
      const slides = await generateLessonSlideDeck(selectedLesson, course.referenceMaterial || '');
      updateLessonInCourse(selectedLesson.id, { slides });
    } catch (e) {
      alert("Error forging lesson slide deck.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubSection = () => {
    if (!selectedLesson) return;
    const subIdx = selectedLesson.currentSubSectionIndex;
    const updatedSubs = [...selectedLesson.subSections];
    updatedSubs[subIdx].isVerified = true;

    if (subIdx < selectedLesson.subSections.length - 1) {
      updateLessonInCourse(selectedLesson.id, { 
        subSections: updatedSubs, 
        currentSubSectionIndex: subIdx + 1 
      });
    } else {
      updateLessonInCourse(selectedLesson.id, { 
        subSections: updatedSubs, 
        stage: 'Section_COL' 
      });
    }
  };

  const handleGenerateCOL = async () => {
    if (!selectedLesson) return;
    setLoading(true);
    try {
      const items = await generateSectionCOL(selectedLesson, course.referenceMaterial || '');
      updateLessonInCourse(selectedLesson.id, { checkOnLearningItems: items });
    } catch (e) {
      alert("Error generating COL.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCOL = () => {
    if (!selectedLesson) return;
    updateLessonInCourse(selectedLesson.id, { stage: 'Complete' });
  };

  const handleGenerateFinalExams = async () => {
    setLoading(true);
    try {
      const exams = await generateThreeExamVersions(course);
      onUpdateCourse({ ...course, courseTests: exams });
    } catch (e) {
      alert("Error generating final exams.");
    } finally {
      setLoading(false);
    }
  };

  const renderWorkflow = () => {
    if (!selectedLesson) return null;

    switch (selectedLesson.stage) {
      case 'Objectives':
      case 'TLO_Generation':
        return (
          <div className="bg-amber-50 p-8 rounded-2xl border border-amber-200 animate-in fade-in slide-in-from-top-4">
            <h4 className="text-xl font-black uppercase text-amber-900 mb-4 flex items-center gap-2">
              <span className="bg-amber-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px]">1</span>
              Terminal Learning Objective (TLO)
            </h4>
            <p className="text-xs text-amber-700 mb-6 italic">Generate the master performance objective. User must verify before moving to ELO/LSA design.</p>
            {selectedLesson.tlo ? (
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-2xl border border-amber-100 shadow-sm relative group">
                  <div className="absolute top-4 right-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Verification</span>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: `<strong>ACTION:</strong> ${selectedLesson.tlo.action.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}` }} />
                    <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: `<strong>CONDITION:</strong> ${selectedLesson.tlo.condition.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}` }} />
                    <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: `<strong>STANDARD:</strong> ${selectedLesson.tlo.standard.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}` }} />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={handleGenerateTLO} className="bg-white border border-amber-200 text-amber-700 px-6 py-2.5 rounded-xl font-bold text-xs uppercase hover:bg-amber-100 transition-colors">
                    Regenerate TLO
                  </button>
                  <button onClick={handleVerifyTLO} className="bg-amber-600 text-white px-10 py-2.5 rounded-xl font-black text-xs uppercase shadow-lg shadow-amber-600/30 hover:bg-amber-700 active:scale-95 transition-all">
                    Verify TLO & Next Section &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={handleGenerateTLO} disabled={loading} className="bg-amber-600 text-white px-10 py-4 rounded-2xl font-black uppercase shadow-xl hover:bg-amber-700 transition-all active:scale-95">
                {loading ? 'Consulting Regulations...' : 'Generate TLO from References'}
              </button>
            )}
          </div>
        );

      case 'ELO_LSA_Generation':
        return (
          <div className="bg-blue-50 p-8 rounded-2xl border border-blue-200 animate-in fade-in slide-in-from-top-4">
            <h4 className="text-xl font-black uppercase text-blue-900 mb-4 flex items-center gap-2">
              <span className="bg-blue-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px]">2</span>
              Enabling Objectives (ELOs) & LSAs
            </h4>
            <p className="text-xs text-blue-700 mb-6 italic">Mapping granular objectives to the verified TLO.</p>
            {selectedLesson.elos && selectedLesson.elos.length > 0 ? (
              <div className="space-y-6">
                <div className="grid gap-4">
                  {selectedLesson.elos.map(elo => (
                    <div key={elo.id} className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                      <h5 className="font-bold text-slate-800 text-sm">{elo.title}</h5>
                      <ul className="mt-3 pl-4 list-disc text-xs text-slate-500 space-y-1">
                        {elo.learningStepActivities.map((lsa, i) => <li key={i} className="font-medium text-slate-600">{lsa.title}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4">
                  <button onClick={handleGenerateELOs} className="bg-white border border-blue-200 text-blue-700 px-6 py-2.5 rounded-xl font-bold text-xs uppercase hover:bg-blue-100 transition-colors">
                    Regenerate ELOs
                  </button>
                  <button onClick={handleVerifyOutline} className="bg-blue-600 text-white px-10 py-2.5 rounded-xl font-black text-xs uppercase shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all">
                    Verify ELOs & Next Section &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={handleGenerateELOs} disabled={loading} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase shadow-xl transition-all">
                {loading ? 'Mapping Training Tasks...' : 'Generate Enabling Objectives'}
              </button>
            )}
          </div>
        );

      case 'Outline_Verification':
        return (
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-4">
            <h4 className="text-xl font-black uppercase text-slate-900 mb-4 flex items-center gap-2">
              <span className="bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px]">3</span>
              Final POI Flow Review
            </h4>
            <div className="bg-white p-6 rounded-xl border border-slate-100 mb-8 shadow-sm">
              <h5 className="font-black text-amber-600 uppercase text-[10px] tracking-widest mb-6 border-b pb-2">Instructional Sequence</h5>
              <div className="space-y-4">
                {selectedLesson.subSections.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-4 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">{i+1}</span>
                    <span className="font-bold text-slate-700">{s.title}</span>
                    <span className="ml-auto text-[9px] font-black text-slate-300 uppercase tracking-widest">Awaiting Content</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleVerifyOutline} className="bg-slate-900 text-white px-12 py-4 rounded-2xl font-black uppercase shadow-xl hover:bg-slate-800 transition-all active:scale-95">
              Confirm Sequence & Start Content Forge
            </button>
          </div>
        );

      case 'Subsection_Development':
        const currentSub = selectedLesson.subSections[selectedLesson.currentSubSectionIndex];
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-black">
                    {selectedLesson.currentSubSectionIndex + 1}
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-amber-600 tracking-widest block">Module Subsection {selectedLesson.currentSubSectionIndex + 1} of {selectedLesson.subSections.length}</span>
                  <h4 className="text-lg font-black text-slate-900 uppercase">{currentSub.title}</h4>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <button 
                  onClick={handleForgeLessonDeck} 
                  disabled={loading}
                  className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
                 >
                   {loading ? 'Forging...' : '✨ Forge Full Lesson Deck'}
                 </button>
                 <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-emerald-500 transition-all duration-700" 
                        style={{ width: `${((selectedLesson.currentSubSectionIndex + (currentSub.script ? 0.5 : 0)) / selectedLesson.subSections.length) * 100}%` }}
                    />
                 </div>
              </div>
            </div>

            {currentSub.script || selectedLesson.slides?.length ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {currentSub.script && (
                    <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm font-serif relative">
                      <div className="absolute top-0 right-10 -translate-y-1/2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                          Instructor Guide
                      </div>
                      <div className="text-base leading-relaxed whitespace-pre-wrap text-slate-800" dangerouslySetInnerHTML={{ __html: currentSub.script.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                    </div>
                  )}
                  {currentSub.practicalExercise && (
                    <ExerciseCard exercise={currentSub.practicalExercise} />
                  )}
                  <div className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <button onClick={handleDevelopSubSection} className="bg-slate-50 text-slate-500 px-6 py-2.5 rounded-xl font-bold text-xs uppercase hover:bg-slate-100">
                      Regenerate Content
                    </button>
                    <button onClick={handleVerifySubSection} className="flex-1 bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95 transition-all">
                      Verify Subsection & Next Step &rarr;
                    </button>
                  </div>
                </div>
                <div className="sticky top-8 space-y-4">
                  <div className="bg-slate-900 text-white px-4 py-2 rounded-t-xl text-[9px] font-black uppercase tracking-[0.3em] text-center">Instructional Visual Material</div>
                  <SlideViewer slides={currentSub.slides || selectedLesson.slides || []} />
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-24 rounded-[3rem] border-2 border-dashed border-slate-200 text-center space-y-8">
                <div className="text-5xl opacity-40">⚒️</div>
                <div>
                    <h5 className="text-2xl font-black text-slate-400 uppercase tracking-tight">Subsection Materials Forge</h5>
                    <p className="text-slate-400 text-sm mt-2 font-medium">Click to generate full Script, Slides, and Practical Exercise for this objective.</p>
                </div>
                <button onClick={handleDevelopSubSection} disabled={loading} className="bg-amber-600 text-white px-12 py-5 rounded-2xl font-black uppercase shadow-2xl shadow-amber-600/40 hover:bg-amber-700 transition-all active:scale-95 text-lg">
                  {loading ? 'Synthesizing Content...' : 'Forge Materials'}
                </button>
              </div>
            )}
          </div>
        );

      case 'Section_COL':
        return (
          <div className="bg-emerald-50 p-10 rounded-3xl border border-emerald-200 animate-in fade-in slide-in-from-top-4">
            <h4 className="text-2xl font-black uppercase text-emerald-900 mb-2 flex items-center gap-3">
              <span className="bg-emerald-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs">4</span>
              Section Check on Learning (COL)
            </h4>
            <p className="text-sm text-emerald-700 mb-10 italic">Final check-on-learning for the entire section. 4 validated questions required.</p>
            {selectedLesson.checkOnLearningItems && selectedLesson.checkOnLearningItems.length > 0 ? (
              <div className="space-y-8">
                <div className="grid gap-6">
                  {selectedLesson.checkOnLearningItems.map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex gap-6">
                        <div className="text-xs font-black text-emerald-300 uppercase">Q{i+1}</div>
                        <div>
                            <p className="font-bold text-slate-800 text-base mb-4" dangerouslySetInnerHTML={{ __html: item.question.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                            <div className="bg-emerald-50 p-3 rounded-xl text-xs font-black text-emerald-700 border border-emerald-100">
                                CORRECT ANSWER: {item.answer}
                            </div>
                        </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4">
                  <button onClick={handleGenerateCOL} className="bg-white border border-emerald-200 text-emerald-700 px-8 py-3 rounded-xl font-bold text-xs uppercase hover:bg-emerald-100">
                    Regenerate Assessment
                  </button>
                  <button onClick={handleVerifyCOL} className="flex-1 bg-emerald-600 text-white px-12 py-4 rounded-xl font-black text-sm uppercase shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95 transition-all">
                    Finalize & Verify Lesson Completion
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={handleGenerateCOL} disabled={loading} className="bg-emerald-600 text-white px-12 py-4 rounded-2xl font-black uppercase shadow-xl hover:bg-emerald-700 transition-all active:scale-95">
                {loading ? 'Validating Learning Outcomes...' : 'Generate 4 Section Questions'}
              </button>
            )}
          </div>
        );

      case 'Complete':
        return (
          <div className="bg-white p-24 rounded-[3rem] border border-emerald-100 text-center space-y-8 shadow-sm animate-in zoom-in duration-500">
            <div className="text-7xl animate-bounce">🎖️</div>
            <div>
                <h4 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Mission Accomplished</h4>
                <p className="text-slate-500 max-w-lg mx-auto leading-relaxed mt-4 text-lg">Lesson materials, practical simulations, and section assessments have been verified and locked into the Proponent TSP.</p>
            </div>
            <button onClick={() => setActiveTab('tsp')} className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase shadow-2xl hover:bg-slate-800 transition-all text-xl">
                Open Export Console (TSP)
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-screen pb-20">
      <div className="w-full md:w-80 space-y-6 shrink-0">
        <button onClick={onBack} className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-slate-800 transition-colors flex items-center gap-2 group">
          <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Return to Dashboard
        </button>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[9px] font-black uppercase text-amber-600 mb-1 tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Active Forge: MOS {course.mos}
          </div>
          <h2 className="text-xl font-bold leading-tight text-slate-900">{course.title}</h2>
          
          <button 
            onClick={() => setActiveTab('tsp')}
            className="w-full mt-4 bg-slate-900 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Generate Full TSP Report</span>
            <span className="text-amber-500 text-sm">📕</span>
          </button>
        </div>

        <nav className="space-y-2">
          <div className="pt-2 pb-2 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Controls</div>
          <button onClick={() => setActiveTab('workflow')} className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${activeTab === 'workflow' ? 'bg-amber-600 text-white shadow-lg border-amber-600' : 'bg-white hover:border-amber-400 hover:shadow-md'}`}>
            <span className="text-lg">⚙️</span>
            <div className="font-bold text-xs uppercase tracking-tight">Development Forge</div>
          </button>
          <button onClick={() => setActiveTab('exams')} className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${activeTab === 'exams' ? 'bg-indigo-600 text-white shadow-lg border-indigo-600' : 'bg-white hover:border-indigo-400 hover:shadow-md'}`}>
            <span className="text-lg">📊</span>
            <div className="font-bold text-xs uppercase tracking-tight">Master Exams</div>
          </button>
          <button onClick={() => setActiveTab('tsp')} className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${activeTab === 'tsp' ? 'bg-slate-800 text-white shadow-lg border-slate-800' : 'bg-white hover:border-slate-800 hover:shadow-md'}`}>
            <span className="text-lg">📕</span>
            <div className="font-bold text-xs uppercase tracking-tight">POI / TSP Export</div>
          </button>

          <div className="pt-8 pb-2 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Section List</div>
          {course.lessons.map(lesson => (
            <button key={lesson.id} onClick={() => { setSelectedLessonId(lesson.id); setActiveTab('workflow'); }} className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${selectedLessonId === lesson.id ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-100/50' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
              <div className="font-bold text-xs truncate pr-2 group-hover:text-slate-900">{lesson.title}</div>
              <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${lesson.stage === 'Complete' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {lesson.stage === 'Complete' ? '✓' : lesson.stage.split('_')[0]}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-visible">
        {activeTab === 'workflow' && renderWorkflow()}
        
        {activeTab === 'exams' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-10 rounded-3xl border border-slate-200 shadow-sm gap-6">
              <div>
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Master Assessment Forge</h3>
                <p className="text-slate-500 text-base mt-2 max-w-lg font-medium">Generate 3 validated versions (A, B, C) of the course final exam for student retesting and mastery verification.</p>
              </div>
              <button onClick={handleGenerateFinalExams} disabled={loading} className="bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black uppercase shadow-2xl shadow-indigo-600/40 hover:bg-indigo-700 transition-all active:scale-95 text-lg">
                {loading ? 'Synthesizing Test Logic...' : 'Forge 3 Test Versions'}
              </button>
            </div>
            
            {course.courseTests?.versionA?.items.length > 0 ? (
              <div className="space-y-16">
                <TestCard test={course.courseTests.versionA} onAddItem={() => {}} />
                <TestCard test={course.courseTests.versionB} onAddItem={() => {}} />
                <TestCard test={course.courseTests.versionC} onAddItem={() => {}} />
              </div>
            ) : (
              <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="text-5xl mb-6 grayscale opacity-30">📋</div>
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-sm">Exam Generation Unlocked after Module Verification</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tsp' && (
          <TrainingSupportPackage course={course} />
        )}
      </div>
    </div>
  );
};

export default CoursePreview;
