import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AddieWizard from './components/AddieWizard';
import CoursePreview from './components/CoursePreview';
import { Course } from './types';
import { SAMPLE_COURSE } from './sampleData';

const App: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [view, setView] = useState<'dashboard' | 'wizard' | 'preview'>('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('army_courses_v2');
    if (saved) {
      setCourses(JSON.parse(saved));
    } else {
      // Inject sample course for new users
      setCourses([SAMPLE_COURSE]);
      localStorage.setItem('army_courses_v2', JSON.stringify([SAMPLE_COURSE]));
    }
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      localStorage.setItem('army_courses_v2', JSON.stringify(courses));
    }
  }, [courses]);

  const handleCourseCreated = (newCourse: Course) => {
    setCourses([...courses, newCourse]);
    setSelectedCourseId(newCourse.id);
    setView('preview');
  };

  const handleUpdateCourse = (updated: Course) => {
    setCourses(courses.map(c => c.id === updated.id ? updated : c));
  };

  const handleNavigate = (newView: 'dashboard' | 'wizard') => {
    setView(newView);
    if (newView === 'dashboard') setSelectedCourseId(null);
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <Layout onNavigate={handleNavigate}>
      {view === 'dashboard' && (
        <Dashboard 
          courses={courses} 
          onSelectCourse={(id) => { setSelectedCourseId(id); setView('preview'); }} 
          onNewCourse={() => setView('wizard')}
        />
      )}
      {view === 'wizard' && (
        <AddieWizard 
          onCourseCreated={handleCourseCreated} 
          onCancel={() => setView('dashboard')}
        />
      )}
      {view === 'preview' && selectedCourse && (
        <CoursePreview 
          course={selectedCourse} 
          onUpdateCourse={handleUpdateCourse}
          onBack={() => setView('dashboard')}
        />
      )}
    </Layout>
  );
};

export default App;