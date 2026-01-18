
import React, { useState } from 'react';
import { TestVersion, TestItem, TestItemType } from '../types';

interface TestCardProps {
  test: TestVersion;
  onAddItem: (item: TestItem) => void;
}

const TestCard: React.FC<TestCardProps> = ({ test, onAddItem }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [newItem, setNewItem] = useState<TestItem>({
    type: 'Multiple Choice',
    question: '',
    options: ['', '', '', ''],
    answer: '',
    rubric: '',
    bloomLevel: 'K1'
  });

  const handleAddItem = () => {
    setAttemptedSubmit(true);
    if (!newItem.question.trim() || !newItem.answer.trim()) return;
    onAddItem({ ...newItem });
    setIsModalOpen(false);
    setAttemptedSubmit(false);
    setNewItem({ type: 'Multiple Choice', question: '', options: ['', '', '', ''], answer: '', rubric: '', bloomLevel: 'K1' });
  };

  const getBloomColor = (level: string) => {
    switch(level) {
      case 'K1': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'K2': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'K3': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'K4': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      <div className="bg-slate-900 text-white px-8 py-6 flex justify-between items-center">
        <div>
          <h4 className="font-black text-lg uppercase tracking-widest">Version {test.versionType} Examination</h4>
          <span className="text-[10px] italic opacity-60 mt-1 block uppercase tracking-widest">Master Assessment Logic: {test.purpose || 'Comprehensive Mastery Check'}</span>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase px-6 py-2.5 rounded-xl transition-all shadow-lg active:scale-95"
        >
          Add Item
        </button>
      </div>
      
      <div className="p-8 space-y-8">
        {test.items.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs italic">No items generated for this version.</div>
        ) : (
          test.items.map((item, idx) => (
            <div key={idx} className="space-y-4 border-b border-slate-100 pb-8 last:border-0 last:pb-0">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border ${getBloomColor(item.bloomLevel || 'K1')}`}>
                    {item.bloomLevel || 'K1'}
                  </span>
                  <span className="text-[10px] font-black text-slate-300 uppercase">Q{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">{item.type}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: item.question.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                  
                  {item.options && item.options.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {item.options.map((opt, oIdx) => (
                        <div key={oIdx} className="text-xs text-slate-600 border border-slate-100 p-3 rounded-xl bg-slate-50 flex items-center gap-3">
                          <span className="font-black text-slate-300 w-4">{String.fromCharCode(65 + oIdx)}.</span>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                      Answer Key: {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
              <h3 className="font-black uppercase tracking-widest text-sm">Add Assessment Item</h3>
              <button onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="p-8 overflow-y-auto space-y-6">
              {/* Manual Entry Form - simplified for brevity */}
              <p className="text-sm text-slate-500">Form for adding manual test items goes here...</p>
            </div>
            <div className="p-6 bg-slate-50 border-t flex justify-end">
               <button onClick={handleAddItem} className="bg-amber-600 text-white px-10 py-3 rounded-xl font-black uppercase">Save Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCard;
