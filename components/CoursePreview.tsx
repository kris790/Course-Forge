
import React, { useState } from 'react';
import { Course, Lesson, TestItem } from '../types';
import { generateLessonDetails, generateCourseTests } from '../services/geminiService';
import TestCard from './TestCard';
import SlideViewer from './SlideViewer';
import CourseOutline from './CourseOutline';
import TrainingSupportPackage from './TrainingSupportPackage';
import LessonPlanDocument from './LessonPlanDocument';

interface CoursePreviewProps {
  course: Course;
  onUpdateCourse: (updated: Course) => void;
  onBack: () => void;
}

const CoursePreview: React.FC<CoursePreviewProps> = ({ course, onUpdateCourse, onBack }) => {
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(course.lessons[0]?.id || null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'objectives' | 'slides' | 'script' | 'tests' | 'outline' | 'tsp' | 'lessonplan'>('objectives');
  const [isEditingScript, setIsEditingScript] = useState(false);

  const selectedLesson = course.lessons.find(l => l.id === selectedLessonId);

  const handleGenerateLessonContent = async () => {
    if (!selectedLesson) return;
    setLoading(true);
    try {
      const content = await generateLessonDetails(course.title, selectedLesson, course.referenceMaterial);
      const updatedLessons = course.lessons.map(l => {
        if (l.id === selectedLessonId) {
          return { 
            ...l, 
            elos: content.elos || l.elos, 
            slides: content.slides,
            script: content.script,
            armyRegulations: content.armyRegulations,
            scope: content.scope,
            summary: content.summary,
            prerequisites: content.prerequisites,
            instructorQualifications: content.instructorQualifications,
            safetyConsiderations: content.safetyConsiderations,
            media: content.media,
            ratio: content.ratio
          };
        }
        return l;
      });
      onUpdateCourse({ ...course, lessons: updatedLessons });
      setActiveTab('lessonplan');
    } catch (error) {
      console.error(error);
      alert("Error generating instructional materials.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateScript = (newScript: string) => {
    if (!selectedLesson) return;
    const updatedLessons = course.lessons.map(l => {
      if (l.id === selectedLessonId) return { ...l, script: newScript };
      return l;
    });
    onUpdateCourse({ ...course, lessons: updatedLessons });
  };

  const handleGenerateCourseTests = async () => {
    setLoading(true);
    try {
      const tests = await generateCourseTests(course);
      onUpdateCourse({ ...course, courseTests: tests });
      setActiveTab('tests');
    } catch (error) {
      console.error(error);
      alert("Error generating course-wide tests.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[80vh]">
      {/* Sidebar navigation */}
      <div className="w-full md:w-80 space-y-4">
        <button onClick={onBack} className="text-slate-500 font-bold text-xs uppercase hover:text-slate-800 transition-colors">
          &larr; Dashboard
        </button>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-black uppercase text-amber-600 mb-1">MOS {course.mos}</div>
          <h2 className="text-xl font-bold leading-tight mb-3 text-slate-900">{course.title}</h2>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 bg-slate-100 p-2 rounded uppercase tracking-wider w-fit">
             <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
             {course.status}
          </div>
        </div>

        <div className="space-y-2">
          <button 
            onClick={() => { setSelectedLessonId(null); setActiveTab('tsp'); }}
            className={`w-full text-left p-4 rounded-xl border transition-all ${activeTab === 'tsp' ? 'bg-amber-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:border-amber-400'}`}
          >
            <div className="font-bold text-sm">📕 Training Support Package</div>
            <div className="text-[9px] mt-1 opacity-70 uppercase font-black">Official System Export</div>
          </button>

          <button 
            onClick={() => { setSelectedLessonId(null); setActiveTab('tests'); }}
            className={`w-full text-left p-4 rounded-xl border transition-all ${activeTab === 'tests' && !selectedLessonId ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:border-emerald-400'}`}
          >
            <div className="font-bold text-sm">📝 Master Examinations</div>
            <div className="text-[9px] mt-1 opacity-70 uppercase font-black">All Versions (3)</div>
          </button>

          <div className="pt-4 pb-2 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructional Modules</div>
          {course.lessons.map(lesson => (
            <button 
              key={lesson.id} 
              onClick={() => { setSelectedLessonId(lesson.id); if (['outline', 'tests', 'tsp'].includes(activeTab)) setActiveTab('lessonplan'); }} 
              className={`w-full text-left p-4 rounded-xl border transition-all ${selectedLessonId === lesson.id ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
            >
              <div className="font-bold text-sm truncate">{lesson.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {activeTab === 'tsp' ? (
          <TrainingSupportPackage course={course} />
        ) : activeTab === 'tests' && !selectedLessonId ? (
          <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Comprehensive Course Tests</h3>
                <p className="text-slate-500 text-sm mt-1">Diagnostic, Formative, and Summative versions for the entire POI.</p>
              </div>
              <button onClick={handleGenerateCourseTests} disabled={loading} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 shadow-xl transition-all">
                {loading ? 'Thinking...' : '🤖 Generate Three Test Versions'}
              </button>
            </div>
            {course.courseTests && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <TestCard test={course.courseTests.diagnostic} onAddItem={() => {}} />
                <TestCard test={course.courseTests.formative} onAddItem={() => {}} />
                <TestCard test={course.courseTests.summative} onAddItem={() => {}} />
              </div>
            )}
          </div>
        ) : selectedLesson ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm min-h-[600px] flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
              <div>
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1 block">Module Management</span>
                <h3 className="text-3xl font-bold text-slate-900 leading-tight">{selectedLesson.title}</h3>
              </div>
              <button onClick={handleGenerateLessonContent} disabled={loading} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl hover:bg-slate-800 transition-all">
                {loading ? 'Developing...' : '🤖 Generate Lesson Plan Artifacts'}
              </button>
            </div>

            <div className="flex border-b border-slate-100 mb-8 space-x-1 overflow-x-auto">
              {[
                {id: 'lessonplan', label: 'Lesson Plan (LP)', emoji: '📄'},
                {id: 'objectives', label: 'Objectives', emoji: '🎯'},
                {id: 'slides', label: 'Slides', emoji: '📽️'},
                {id: 'script', label: 'Instructor Script', emoji: '🎙️'}
              ].map(tab => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id as any)} 
                  className={`px-4 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 flex-shrink-0 ${activeTab === tab.id ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  <span className="text-base">{tab.emoji}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1">
              {activeTab === 'lessonplan' && (
                <div className="animate-in fade-in duration-300">
                  <LessonPlanDocument course={course} lesson={selectedLesson} />
                </div>
              )}
              {activeTab === 'objectives' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                    <h4 className="text-[10px] font-black uppercase text-amber-600 mb-4 tracking-widest">Terminal Learning Objective (TLO)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {['action', 'condition', 'standard'].map(key => (
                        <div key={key}>
                          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">{key}</span>
                          <p className="text-sm text-slate-800 leading-relaxed font-medium">{(selectedLesson.tlo as any)?.[key] || 'Not defined'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Supporting Strategy (ELOs & LSAs)</h4>
                    {selectedLesson.elos.map((elo, idx) => (
                      <div key={idx} className="border-l-4 border-amber-500 pl-6 py-2 bg-white rounded-r-2xl transition-all hover:bg-slate-50/50">
                        <h5 className="font-bold text-lg text-slate-900 mb-4">{elo.title}</h5>
                        <div className="space-y-4">
                          {elo.learningStepActivities?.map((lsa, lIdx) => (
                            <div key={lIdx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                              <div className="flex justify-between items-start mb-3">
                                <h6 className="text-sm font-bold text-slate-800">{lIdx + 1}. {lsa.title}</h6>
                                <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-1 rounded font-black uppercase">{lsa.method}</span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">{lsa.description}</p>
                              {lsa.guidance && <p className="mt-2 text-[10px] text-slate-400 font-medium italic">ELM guidance generated.</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'slides' && (
                <div className="animate-in fade-in duration-300">
                  {selectedLesson.slides ? <SlideViewer slides={selectedLesson.slides} /> : <div className="text-center py-20 text-slate-400 italic">No slides generated for this module yet.</div>}
                </div>
              )}
              {activeTab === 'script' && (
                <div className="animate-in fade-in duration-300 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Instructor Narrative Script</h4>
                    <button 
                      onClick={() => setIsEditingScript(!isEditingScript)}
                      className="text-xs font-bold text-amber-600 hover:underline"
                    >
                      {isEditingScript ? '💾 Save & Finish' : '✍️ Edit Script'}
                    </button>
                  </div>
                  
                  {isEditingScript ? (
                    <textarea 
                      value={selectedLesson.script || ''}
                      onChange={(e) => handleUpdateScript(e.target.value)}
                      className="flex-1 w-full p-6 border border-amber-200 rounded-xl font-mono text-sm shadow-inner min-h-[400px] outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Enter instructor script here. Use [SHOW SLIDE X] as cues."
                    />
                  ) : (
                    <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 prose prose-slate max-w-none font-serif text-slate-800 leading-relaxed overflow-y-auto max-h-[600px] whitespace-pre-wrap">
                      {selectedLesson.script?.split(/(\[SHOW SLIDE \d+\])/g).map((part, i) => {
                         if (part.match(/\[SHOW SLIDE \d+\]/)) {
                           return <span key={i} className="inline-block px-2 py-0.5 bg-amber-600 text-white font-black text-[10px] rounded mx-1 uppercase tracking-tighter">{part}</span>
                         }
                         return <span key={i}>{part}</span>
                      })}
                      {!selectedLesson.script && <p className="text-slate-400 italic">Script not yet developed.</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 italic bg-white rounded-2xl border border-slate-200 shadow-inner">
             <div className="text-5xl mb-4 opacity-20">📂</div>
             <p>Select a Training Module to manage Lesson Plans.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePreview;
