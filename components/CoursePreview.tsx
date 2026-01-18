
import React, { useState } from 'react';
import { Course, Lesson, SubSection, TestItem, TerminalObjective, EnablingObjective, TestVersion } from '../types';
import { 
  generateTLO, 
  generateELOsAndLSAs, 
  generateSubSectionContent, 
  generateSectionCOL, 
  generateThreeExamVersions 
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
      // Map ELOs to initial subSections
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
      case 'Objectives': // Initial State
      case 'TLO_Generation':
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 p-8 rounded-2xl border border-amber-200">
              <h4 className="text-xl font-black uppercase text-amber-900 mb-4 tracking-tight">Step 1: Terminal Learning Objective</h4>
              {selectedLesson.tlo ? (
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-xl border border-amber-100 shadow-sm">
                    <p className="text-sm leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: `<strong>ACTION:</strong> ${selectedLesson.tlo.action.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}` }} />
                    <p className="text-sm leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: `<strong>CONDITION:</strong> ${selectedLesson.tlo.condition.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}` }} />
                    <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: `<strong>STANDARD:</strong> ${selectedLesson.tlo.standard.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}` }} />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={handleGenerateTLO} className="bg-amber-100 text-amber-700 px-6 py-2 rounded-xl font-bold text-xs uppercase">Regenerate</button>
                    <button onClick={handleVerifyTLO} className="bg-amber-600 text-white px-8 py-2 rounded-xl font-bold text-xs uppercase shadow-lg">Verify & Proceed</button>
                  </div>
                </div>
              ) : (
                <button onClick={handleGenerateTLO} disabled={loading} className="bg-amber-600 text-white px-8 py-3 rounded-xl font-bold uppercase shadow-xl">
                  {loading ? 'Analyzing Doctrine...' : 'Generate TLO'}
                </button>
              )}
            </div>
          </div>
        );

      case 'ELO_LSA_Generation':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-8 rounded-2xl border border-blue-200">
              <h4 className="text-xl font-black uppercase text-blue-900 mb-4 tracking-tight">Step 2: Enabling Objectives & LSAs</h4>
              {selectedLesson.elos && selectedLesson.elos.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    {selectedLesson.elos.map(elo => (
                      <div key={elo.id} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                        <h5 className="font-bold text-slate-800 text-sm">{elo.title}</h5>
                        <ul className="mt-2 pl-4 list-disc text-xs text-slate-500">
                          {elo.learningStepActivities.map((lsa, i) => <li key={i}>{lsa.title} ({lsa.timeMinutes}m)</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <button onClick={handleGenerateELOs} className="bg-blue-100 text-blue-700 px-6 py-2 rounded-xl font-bold text-xs uppercase">Regenerate</button>
                    <button onClick={handleVerifyOutline} className="bg-blue-600 text-white px-8 py-2 rounded-xl font-bold text-xs uppercase shadow-lg">Approve Outline</button>
                  </div>
                </div>
              ) : (
                <button onClick={handleGenerateELOs} disabled={loading} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold uppercase shadow-xl">
                  {loading ? 'Mapping Objectives...' : 'Generate ELOs & LSAs'}
                </button>
              )}
            </div>
          </div>
        );

      case 'Outline_Verification':
        return (
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
            <h4 className="text-xl font-black uppercase text-slate-900 mb-4">Step 3: Verify POI Structure</h4>
            <div className="bg-white p-6 rounded-xl border border-slate-100 mb-6">
              <h5 className="font-black text-amber-600 uppercase text-xs mb-4">Course Flow Overview</h5>
              <div className="space-y-3">
                {selectedLesson.subSections.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3 text-sm">
                    <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">{i+1}</span>
                    <span className="font-bold text-slate-700">{s.title}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleVerifyOutline} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold uppercase shadow-xl">Start Content Development</button>
          </div>
        );

      case 'Subsection_Development':
        const currentSub = selectedLesson.subSections[selectedLesson.currentSubSectionIndex];
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Active Development</span>
                <h4 className="text-lg font-black text-slate-900 uppercase">{currentSub.title}</h4>
              </div>
              <div className="text-[10px] font-black text-slate-400">
                {selectedLesson.currentSubSectionIndex + 1} / {selectedLesson.subSections.length}
              </div>
            </div>

            {currentSub.script ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm font-serif">
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 border-b pb-2">Instructor Script</h5>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-800" dangerouslySetInnerHTML={{ __html: currentSub.script.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                  </div>
                  {currentSub.practicalExercise && (
                    <ExerciseCard exercise={currentSub.practicalExercise} />
                  )}
                  <div className="flex gap-4">
                    <button onClick={handleDevelopSubSection} className="bg-slate-100 text-slate-600 px-6 py-2 rounded-xl font-bold text-xs uppercase">Regenerate</button>
                    <button onClick={handleVerifySubSection} className="bg-emerald-600 text-white px-8 py-2 rounded-xl font-bold text-xs uppercase shadow-lg">Verify & Next Subsection</button>
                  </div>
                </div>
                <div>
                  {currentSub.slide && <SlideViewer slides={[currentSub.slide]} />}
                </div>
              </div>
            ) : (
              <div className="bg-slate-100 p-20 rounded-3xl border-2 border-dashed border-slate-300 text-center">
                <h5 className="text-xl font-bold text-slate-400 mb-4">Content Ready for Generation</h5>
                <button onClick={handleDevelopSubSection} disabled={loading} className="bg-amber-600 text-white px-10 py-4 rounded-2xl font-black uppercase shadow-2xl hover:bg-amber-700 transition-all">
                  {loading ? 'Creating Script & Slide...' : 'Develop Subsection'}
                </button>
              </div>
            )}
          </div>
        );

      case 'Section_COL':
        return (
          <div className="space-y-6">
            <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-200">
              <h4 className="text-xl font-black uppercase text-emerald-900 mb-4 tracking-tight">Step 4: Check on Learning</h4>
              {selectedLesson.checkOnLearningItems && selectedLesson.checkOnLearningItems.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    {selectedLesson.checkOnLearningItems.map((item, i) => (
                      <div key={i} className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                        <p className="font-bold text-slate-800 text-sm">{item.question}</p>
                        <p className="text-xs text-emerald-600 mt-2">Correct Answer: {item.answer}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <button onClick={handleGenerateCOL} className="bg-emerald-100 text-emerald-700 px-6 py-2 rounded-xl font-bold text-xs uppercase">Regenerate</button>
                    <button onClick={handleVerifyCOL} className="bg-emerald-600 text-white px-8 py-2 rounded-xl font-bold text-xs uppercase shadow-lg">Verify Lesson Complete</button>
                  </div>
                </div>
              ) : (
                <button onClick={handleGenerateCOL} disabled={loading} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold uppercase shadow-xl">
                  {loading ? 'Generating Assessment...' : 'Generate 4 Questions'}
                </button>
              )}
            </div>
          </div>
        );

      case 'Complete':
        return (
          <div className="bg-white p-20 rounded-3xl border border-emerald-100 text-center space-y-6 shadow-sm">
            <div className="text-5xl">🎖️</div>
            <h4 className="text-2xl font-black text-slate-900 uppercase">Module Development Complete</h4>
            <p className="text-slate-500 max-w-md mx-auto">This lesson has been fully developed and verified. You can now compile it into the final Training Support Package.</p>
            <button onClick={() => setActiveTab('tsp')} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase shadow-lg">View Full TSP Section</button>
          </div>
        );

      default:
        return <div>Unknown Stage</div>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-screen pb-20">
      <div className="w-full md:w-80 space-y-6">
        <button onClick={onBack} className="text-slate-500 font-bold text-xs uppercase hover:text-slate-800 transition-colors">&larr; Dashboard</button>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-black uppercase text-amber-600 mb-1">MOS {course.mos}</div>
          <h2 className="text-xl font-bold leading-tight text-slate-900">{course.title}</h2>
        </div>

        <nav className="space-y-2">
          <div className="pt-2 pb-2 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Sections</div>
          <button onClick={() => setActiveTab('workflow')} className={`w-full text-left p-4 rounded-xl border transition-all ${activeTab === 'workflow' ? 'bg-amber-600 text-white shadow-lg' : 'bg-white hover:border-amber-400'}`}>
            <div className="font-bold text-sm">⚙️ Development Forge</div>
          </button>
          <button onClick={() => setActiveTab('exams')} className={`w-full text-left p-4 rounded-xl border transition-all ${activeTab === 'exams' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white hover:border-indigo-400'}`}>
            <div className="font-bold text-sm">📊 Final Master Exams</div>
          </button>
          <button onClick={() => setActiveTab('tsp')} className={`w-full text-left p-4 rounded-xl border transition-all ${activeTab === 'tsp' ? 'bg-slate-800 text-white shadow-lg' : 'bg-white hover:border-slate-800'}`}>
            <div className="font-bold text-sm">📕 Training Support Package</div>
          </button>

          <div className="pt-6 pb-2 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructional Modules</div>
          {course.lessons.map(lesson => (
            <button key={lesson.id} onClick={() => { setSelectedLessonId(lesson.id); setActiveTab('workflow'); }} className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${selectedLessonId === lesson.id ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-100' : 'bg-white border-slate-200'}`}>
              <div className="font-bold text-sm truncate pr-2">{lesson.title}</div>
              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${lesson.stage === 'Complete' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {lesson.stage === 'Complete' ? '✓' : lesson.stage.split('_')[0]}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 space-y-8">
        {activeTab === 'workflow' && renderWorkflow()}
        
        {activeTab === 'exams' && (
          <div className="space-y-12">
            <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-3xl font-black text-slate-900 uppercase">Master Exams</h3>
                <p className="text-slate-500 text-sm mt-1">Generate 3 variations for Failed Student Retesting.</p>
              </div>
              <button onClick={handleGenerateFinalExams} disabled={loading} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase shadow-xl hover:bg-indigo-700 transition-all">
                {loading ? 'Designing Assessments...' : 'Generate Versions A, B, & C'}
              </button>
            </div>
            
            {course.courseTests?.versionA && (
              <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-500">
                <TestCard test={course.courseTests.versionA} onAddItem={() => {}} />
                <TestCard test={course.courseTests.versionB} onAddItem={() => {}} />
                <TestCard test={course.courseTests.versionC} onAddItem={() => {}} />
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
