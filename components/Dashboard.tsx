
import React from 'react';
import { Course } from '../types';

interface DashboardProps {
  courses: Course[];
  onSelectCourse: (id: string) => void;
  onNewCourse: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ courses, onSelectCourse, onNewCourse }) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Training Management</h2>
          <p className="text-slate-500">Overview of courses currently in the ADDIE lifecycle.</p>
        </div>
        <button 
          onClick={onNewCourse}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-semibold shadow-sm transition-all"
        >
          + Build New Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-400 text-sm font-bold uppercase mb-1">Active Courses</div>
          <div className="text-4xl font-bold">{courses.length}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-400 text-sm font-bold uppercase mb-1">Accredited</div>
          <div className="text-4xl font-bold">{courses.filter(c => c.status === 'Accredited').length}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-400 text-sm font-bold uppercase mb-1">In Development</div>
          <div className="text-4xl font-bold">{courses.filter(c => c.status === 'Draft').length}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">MOS / Topic</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Lessons</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {courses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No courses found. Start by building a new one.</td>
              </tr>
            ) : (
              courses.map(course => (
                <tr key={course.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onSelectCourse(course.id)}>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{course.title}</div>
                    <div className="text-xs text-slate-500">MOS {course.mos}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{course.totalDuration} Hrs</td>
                  <td className="px-6 py-4 text-slate-600">{course.lessons.length} Modules</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      course.status === 'Accredited' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-amber-600 hover:text-amber-800 font-bold text-sm">Manage</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
