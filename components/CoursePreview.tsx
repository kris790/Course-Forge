
import React, { useState, useEffect } from 'react';
import { Course, Lesson, TestItem } from '../types';
import { generateLessonDetails } from '../services/geminiService';
import ExerciseCard from './ExerciseCard';
import TestCard from './TestCard';
import SlideViewer from './SlideViewer';

interface CoursePreviewProps {
  course: Course;
  onUpdateCourse: (updated: Course) => void;
  onBack: () => void;
}

const CoursePreview: React.FC<CoursePreviewProps> = ({ course, onUpdateCourse, onBack }) => {
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(course.lessons[0]?.id || null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'slides' | 'exercises' | 'tests'>('slides');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  const selectedLesson = course.lessons.find(l => l.id === selectedLessonId);

  useEffect(() => {
    if (selectedLesson) {
      setTempTitle(selectedLesson.title);
      setIsEditingTitle(false);
    }
  }, [selectedLessonId]);

  const handleGenerateContent = async () => {
    if (!selectedLesson) return;
    setLoading(true);
    try {
      const content = await generateLessonDetails(
        course.title, 
        selectedLesson.title, 
        selectedLesson.learningObjectives,
        course.referenceMaterial
      );
      
      const updatedLessons = course.lessons.map(l => {
        if (l.id === selectedLessonId) {
          return {
            ...l,
            practicalExercises: content.practicalExercises,
            slides: content.slides,
            tests: content.tests
          };
        }
        return l;
      });

      onUpdateCourse({ ...course, lessons: updatedLessons });
    } catch (error) {
      console.error("Failed to generate content:", error);
      alert("Error generating lesson materials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTitle = () => {
    if (!selectedLesson || !tempTitle.trim()) return;
    
    const updatedLessons = course.lessons.map(l => {
      if (l.id === selectedLessonId) {
        return { ...l, title: tempTitle.trim() };
      }
      return l;
    });

    onUpdateCourse({ ...course, lessons: updatedLessons });
    setIsEditingTitle(false);
  };

  const handleAddTestItem = (version: 'diagnostic' | 'formative' | 'summative', item: TestItem) => {
    if (!selectedLesson) return;

    const updatedLessons = course.lessons.map(l => {
      if (l.id === selectedLessonId) {
        return {
          ...l,
          tests: {
            ...l.tests,
            [version]: {
              ...l.tests[version],
              items: [...l.tests[version].items, item]
            }
          }
        };
      }
      return l;
    });

    onUpdateCourse({ ...course, lessons: updatedLessons });
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-80 space-y-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors mb-4"
        >
          &larr; Back to Dashboard
        </button>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-black uppercase text-amber-600 mb-1">MOS {course.mos}</div>
          <h2 className="text-xl font-bold leading-tight mb-2">{course.title}</h2>
          <p className="text-xs text-slate-500 mb-2">{course.description}</p>
          {course.referenceMaterial && (
            <div className="text-[9px] font-bold text-emerald-600 uppercase mb-4 flex items-center gap-1">
              <span>📚</span> Custom Reference Active
            </div>
          )}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 p-2 rounded">
             <span className="w-2 h-2 rounded-full bg-blue-500"></span>
             {course.status}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider px-2">POI Sequence</h3>
          {course.lessons.map(lesson => (
            <button
              key={lesson.id}
              onClick={() => setSelectedLessonId(lesson.id)}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                selectedLessonId === lesson.id 
                ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              <div className="text-[10px] font-bold uppercase opacity-60">Lesson {lesson.id.substr(0, 3).toUpperCase()}</div>
              <div className="font-bold text-sm truncate">{lesson.title}</div>
              <div className="text-[10px] mt-1">{lesson.durationHours} Hours</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-6">
        {selectedLesson ? (
          <>
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 mr-4">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text"
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        className="text-2xl font-bold text-slate-900 border-b-2 border-amber-500 focus:outline-none bg-slate-50 px-2 py-1 w-full rounded"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTitle();
                          if (e.key === 'Escape') setIsEditingTitle(false);
                        }}
                      />
                      <button 
                        onClick={handleSaveTitle}
                        className="bg-emerald-500 text-white p-2 rounded hover:bg-emerald-600 transition-colors"
                        title="Save Title"
                      >
                        ✓
                      </button>
                      <button 
                        onClick={() => { setIsEditingTitle(false); setTempTitle(selectedLesson.title); }}
                        className="bg-slate-200 text-slate-600 p-2 rounded hover:bg-slate-300 transition-colors"
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="group flex items-center gap-3">
                      <h3 className="text-2xl font-bold text-slate-900">{selectedLesson.title}</h3>
                      <button 
                        onClick={() => setIsEditingTitle(true)}
                        className="text-slate-300 hover:text-amber-600 transition-colors text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100"
                      >
                        [ Edit Title ]
                      </button>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-2">
                    <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Duration: {selectedLesson.durationHours} hrs</span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Objectives: {selectedLesson.learningObjectives.length}</span>
                  </div>
                </div>
                <button 
                  onClick={handleGenerateContent}
                  disabled={loading}
                  className={`bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded font-bold text-sm shadow-sm transition-all flex items-center gap-2 flex-shrink-0 ${loading ? 'opacity-50' : ''}`}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (selectedLesson.slides?.length ?? 0) > 0 ? 'Regenerate Materials' : 'Generate Lesson Materials'}
                </button>
              </div>

              <div className="flex border-b border-slate-200 mb-6">
                <button 
                  onClick={() => setActiveTab('slides')}
                  className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'slides' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Instructional Slides
                </button>
                <button 
                  onClick={() => setActiveTab('exercises')}
                  className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'exercises' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Practical Exercises
                </button>
                <button 
                  onClick={() => setActiveTab('tests')}
                  className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'tests' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Evaluations (3 Versions)
                </button>
              </div>

              <div className="space-y-8">
                {activeTab === 'slides' && (
                  selectedLesson.slides && selectedLesson.slides.length > 0 ? (
                    <SlideViewer slides={selectedLesson.slides} />
                  ) : <div className="text-center py-20 text-slate-400 italic">No slides generated.</div>
                )}

                {activeTab === 'exercises' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedLesson.practicalExercises.length > 0 ? (
                      selectedLesson.practicalExercises.map(ex => (
                        <ExerciseCard key={ex.id} exercise={ex} />
                      ))
                    ) : <div className="col-span-full text-center py-20 text-slate-400 italic">No exercises generated.</div>}
                  </div>
                )}

                {activeTab === 'tests' && (
                  <div className="space-y-8">
                    <TestCard 
                      test={selectedLesson.tests.diagnostic} 
                      onAddItem={(item) => handleAddTestItem('diagnostic', item)}
                    />
                    <TestCard 
                      test={selectedLesson.tests.formative} 
                      onAddItem={(item) => handleAddTestItem('formative', item)}
                    />
                    <TestCard 
                      test={selectedLesson.tests.summative} 
                      onAddItem={(item) => handleAddTestItem('summative', item)}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 italic">
            Select a lesson from the left to view details.
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePreview;
