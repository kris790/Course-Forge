
import React, { useState } from 'react';
import { Course, Lesson, TestItem, TloSuggestion, PracticalExercise } from '../types';
import { generateLessonDetails, generateCourseTests, reviewCourseTlos } from '../services/geminiService';
import TestCard from './TestCard';
import SlideViewer from './SlideViewer';
import CourseOutline from './CourseOutline';
import TrainingSupportPackage from './TrainingSupportPackage';
import LessonPlanDocument from './LessonPlanDocument';
import TloReviewer from './TloReviewer';

interface CoursePreviewProps {
  course: Course;
  onUpdateCourse: (updated: Course) => void;
  onBack: () => void;
}

const CoursePreview: React.FC<CoursePreviewProps> = ({ course, onUpdateCourse, onBack }) => {
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(course.lessons[0]?.id || null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'objectives' | 'slides' | 'script' | 'tests' | 'outline' | 'tsp' | 'lessonplan'>('lessonplan');
  const [isEditingScript, setIsEditingScript] = useState(false);
  const [tloSuggestions, setTloSuggestions] = useState<TloSuggestion[] | null>(null);

  const selectedLesson = course.lessons.find(l => l.id === selectedLessonId);

  const handleStatusChange = (newStatus: Course['status']) => {
    onUpdateCourse({ ...course, status: newStatus });
  };

  const handleGenerateLessonContent = async () => {
    if (!selectedLesson) return;
    setLoading(true);
    try {
      const content = await generateLessonDetails(
        course.title, 
        selectedLesson, 
        course.referenceMaterial, 
        course.goldStandardExamples
      );
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

  const handleAddPlaceholderPE = () => {
    if (!selectedLesson) return;
    
    if (selectedLesson.elos.length === 0) {
      alert("Please generate or add Enabling Learning Objectives (ELOs) first.");
      return;
    }

    const placeholderPE: PracticalExercise = {
      id: Math.random().toString(36).substr(2, 5),
      title: `Practical Exercise: ${selectedLesson.title} Simulation`,
      type: 'Hands-on',
      description: "A placeholder exercise designed to validate core skills and tasks through realistic simulation and application of doctrine.",
      steps: [
        "Review the tactical scenario and provided job aids.",
        "Perform initial task analysis according to TRADOC standards.",
        "Execute the primary task sequence within the designated time limit.",
        "Conduct a peer review and After Action Review (AAR)."
      ],
      scoringCriteria: [
        "Task completed within 100% accuracy",
        "Proper technical terminology utilized",
        "Zero safety violations",
        "References cited correctly"
      ]
    };

    const updatedLessons = course.lessons.map(l => {
      if (l.id === selectedLessonId) {
        const nextElos = [...l.elos];
        if (nextElos[0].learningStepActivities.length === 0) {
            nextElos[0].learningStepActivities.push({
                title: 'Practical Application',
                timeMinutes: 30,
                method: 'Practical Exercise',
                description: 'Hands-on validation of module concepts.'
            });
        }
        const nextLSAs = [...nextElos[0].learningStepActivities];
        nextLSAs[0] = { ...nextLSAs[0], practicalExercise: placeholderPE };
        nextElos[0] = { ...nextElos[0], learningStepActivities: nextLSAs };
        return { ...l, elos: nextElos };
      }
      return l;
    });

    onUpdateCourse({ ...course, lessons: updatedLessons });
    alert("Practical Exercise added to LSA 1.");
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

  const handleReviewTlos = async () => {
    setLoading(true);
    try {
      const suggestions = await reviewCourseTlos(course);
      setTloSuggestions(suggestions);
    } catch (error) {
      console.error(error);
      alert("Error reviewing objectives.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTloSuggestion = (sug: TloSuggestion) => {
    const updatedLessons = course.lessons.map(l => {
      if (l.id === sug.lessonId) {
        return {
          ...l,
          tlo: {
            action: sug.suggestedAction,
            condition: sug.suggestedCondition,
            standard: sug.suggestedStandard
          }
        };
      }
      return l;
    });
    onUpdateCourse({ ...course, lessons: updatedLessons });
    setTloSuggestions(prev => prev ? prev.filter(s => s.lessonId !== sug.lessonId) : null);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[80vh]">
      <div className="w-full md:w-80 space-y-4">
        <button onClick={onBack} className="text-slate-500 font-bold text-xs uppercase hover:text-slate-800 transition-colors">
          &larr; Dashboard
        </button>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-black uppercase text-amber-600 mb-1">MOS {course.mos}</div>
          <h2 className="text-xl font-bold leading-tight mb-4 text-slate-900">{course.title}</h2>
          
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Lifecycle Status</label>
            <select 
              value={course.status}
              onChange={(e) => handleStatusChange(e.target.value as Course['status'])}
              className={`w-full p-2 rounded-lg text-[10px] font-black uppercase tracking-wider outline-none border transition-all ${
                course.status === 'Accredited' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                course.status === 'Validated' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              <option value="Draft">Drafting Phase</option>
              <option value="Validated">Validated (Internal)</option>
              <option value="Accredited">Accredited (Official)</option>
            </select>
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
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1 block">Module Management</span>
                <h3 className="text-3xl font-bold text-slate-900 leading-tight">{selectedLesson.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={handleReviewTlos} disabled={loading} className="bg-blue-50 text-blue-700 border border-blue-100 px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-blue-100 transition-all flex items-center gap-2">
                   ⚖️ Review TLO Compliance
                </button>
                <button onClick={handleAddPlaceholderPE} disabled={loading} className="bg-amber-50 text-amber-700 border border-amber-100 px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-amber-100 transition-all flex items-center gap-2">
                   🛠 Add Placeholder PE
                </button>
                <button onClick={handleGenerateLessonContent} disabled={loading} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-slate-800 shadow-lg transition-all flex items-center gap-2">
                  {loading ? 'Thinking...' : '⚡ Generate Materials'}
                </button>
              </div>
            </div>

            <div className="flex border-b border-slate-100 mb-6 gap-6">
               <button onClick={() => setActiveTab('lessonplan')} className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'lessonplan' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-400'}`}>Lesson Plan</button>
               <button onClick={() => setActiveTab('slides')} className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'slides' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-400'}`}>Slides</button>
               <button onClick={() => setActiveTab('script')} className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'script' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-400'}`}>Script</button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeTab === 'lessonplan' && <LessonPlanDocument course={course} lesson={selectedLesson} />}
              {activeTab === 'slides' && (
                selectedLesson.slides && selectedLesson.slides.length > 0 
                ? <SlideViewer slides={selectedLesson.slides} /> 
                : <div className="text-center py-20 text-slate-400 italic">No slides generated. Click "Generate Materials" to begin.</div>
              )}
              {activeTab === 'script' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-700 text-sm uppercase tracking-widest">Instructor Script & Narrative</h4>
                    <button onClick={() => setIsEditingScript(!isEditingScript)} className="text-amber-600 font-bold text-xs uppercase hover:underline">
                      {isEditingScript ? 'Done Editing' : 'Edit Script'}
                    </button>
                  </div>
                  {isEditingScript ? (
                    <textarea 
                      value={selectedLesson.script || ''} 
                      onChange={(e) => handleUpdateScript(e.target.value)}
                      className="w-full h-[500px] border border-slate-200 rounded-xl p-6 font-serif text-sm leading-relaxed outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 shadow-inner"
                    />
                  ) : (
                    <div className="bg-white border border-slate-100 rounded-xl p-8 font-serif text-sm leading-relaxed whitespace-pre-wrap text-slate-800 shadow-sm">
                      {selectedLesson.script || <p className="text-slate-400 italic text-center">No script available. Use the "Generate Materials" tool above.</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-40 bg-white rounded-2xl border border-slate-200">
             <p className="text-slate-400 italic">Select a module to view instructional content.</p>
          </div>
        )}
      </div>

      {tloSuggestions && (
        <TloReviewer 
          suggestions={tloSuggestions} 
          course={course} 
          onApply={handleApplyTloSuggestion} 
          onClose={() => setTloSuggestions(null)} 
        />
      )}
    </div>
  );
};

export default CoursePreview;
