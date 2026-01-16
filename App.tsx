
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AddieWizard from './components/AddieWizard';
import CoursePreview from './components/CoursePreview';
import { Course } from './types';

const App: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [view, setView] = useState<'dashboard' | 'wizard' | 'preview'>('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Load from local storage for persistence (solo-dev friendly)
  useEffect(() => {
    const saved = localStorage.getItem('army_courses');
    if (saved) setCourses(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('army_courses', JSON.stringify(courses));
  }, [courses]);

  const handleCourseCreated = (newCourse: Course) => {
    setCourses([...courses, newCourse]);
    setSelectedCourseId(newCourse.id);
    setView('preview');
  };

  const handleUpdateCourse = (updated: Course) => {
    setCourses(courses.map(c => c.id === updated.id ? updated : c));
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <Layout>
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
