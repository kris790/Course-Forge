import React from 'react';
import { Course } from '../types';

interface DashboardProps {
  courses: Course[];
  onSelectCourse: (id: string) => void;
  onNewCourse: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ courses, onSelectCourse, onNewCourse }) => {
  const stats = {
    total: courses.length,
    draft: courses.filter(c => c.status === 'Draft').length,
    validated: courses.filter(c => c.status === 'Validated').length,
    accredited: courses.filter(c => c.status === 'Accredited').length,
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 leading-tight">Training Management</h2>
          <p className="text-slate-500 font-medium">Overview of courses currently in the ADDIE lifecycle.</p>
        </div>
        <button 
          onClick={onNewCourse}
          className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-amber-600/20 transition-all active:scale-95"
        >
          + Build New Course
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Active</div>
          <div className="text-4xl font-black text-slate-900">{stats.total}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500">
          <div className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-1">Draft Phase</div>
          <div className="text-4xl font-black text-slate-900">{stats.draft}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-amber-500">
          <div className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-1">Validated</div>
          <div className="text-4xl font-black text-slate-900">{stats.validated}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500">
          <div className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1">Accredited</div>
          <div className="text-4xl font-black text-slate-900">{stats.accredited}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Master Course List</h3>
          <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full">{courses.length} RECORDS</span>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">MOS / Topic</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Structure</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {courses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic">No courses found. Start by building a new one via the wizard.</td>
              </tr>
            ) : (
              courses.map(course => (
                <tr key={course.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => onSelectCourse(course.id)}>
                  <td className="px-6 py-4">
                    <div className="font-black text-slate-900">{course.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">MOS {course.mos}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-700 font-bold text-sm">{course.totalDuration} Academic Hrs</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-500 text-sm font-medium">{course.lessons.length} Learning Modules</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                      course.status === 'Accredited' ? 'bg-emerald-100 text-emerald-700' : 
                      course.status === 'Validated' ? 'bg-amber-100 text-amber-700' : 
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-amber-600 font-black text-[10px] uppercase tracking-widest group-hover:underline">Open Forge &rarr;</button>
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