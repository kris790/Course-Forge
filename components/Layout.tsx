
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (view: 'dashboard' | 'wizard') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div 
          className="flex items-center space-x-3 cursor-pointer group" 
          onClick={() => onNavigate('dashboard')}
        >
          <div className="bg-amber-500 text-slate-900 p-2 rounded-md font-bold text-lg group-hover:bg-amber-400 transition-colors">CF</div>
          <h1 className="text-xl font-bold tracking-tight">Army CourseForge</h1>
        </div>
        <nav className="flex space-x-6 text-sm font-medium">
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="hover:text-amber-400 transition-colors bg-transparent border-none cursor-pointer"
          >
            Dashboard
          </button>
          <button 
            onClick={() => onNavigate('wizard')} 
            className="hover:text-amber-400 transition-colors bg-transparent border-none cursor-pointer"
          >
            New Course
          </button>
          <div className="border-l border-slate-700 pl-6 flex items-center space-x-2">
            <span className="text-slate-400">User: SFC Miller</span>
            <div className="w-8 h-8 rounded-full bg-slate-700"></div>
          </div>
        </nav>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-slate-500 text-sm">
        &copy; 2026 TRADOC CourseForge System. Restricted Use.
      </footer>
    </div>
  );
};

export default Layout;
