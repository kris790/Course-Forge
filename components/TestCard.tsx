
import React, { useState } from 'react';
import { TestVersion, TestItem } from '../types';

interface TestCardProps {
  test: TestVersion;
  onAddItem: (item: TestItem) => void;
}

const TestCard: React.FC<TestCardProps> = ({ test, onAddItem }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<TestItem>({
    question: '',
    options: ['', '', '', ''],
    answer: '',
    bloomLevel: 'K1'
  });

  const handleAddItem = () => {
    if (!newItem.question || !newItem.answer) {
      alert("Question and Answer are required.");
      return;
    }
    // Filter out empty options
    const filteredOptions = newItem.options?.filter(opt => opt.trim() !== '');
    onAddItem({ ...newItem, options: filteredOptions?.length ? filteredOptions : undefined });
    setIsModalOpen(false);
    setNewItem({ question: '', options: ['', '', '', ''], answer: '', bloomLevel: 'K1' });
  };

  const updateOption = (idx: number, val: string) => {
    const nextOpts = [...(newItem.options || [])];
    nextOpts[idx] = val;
    setNewItem({ ...newItem, options: nextOpts });
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
      <div className="bg-slate-800 text-white px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h4 className="font-bold text-sm uppercase tracking-wide">{test.versionType} Version</h4>
          <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded italic opacity-70">{test.purpose}</span>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold uppercase px-3 py-1 rounded transition-colors shadow-sm"
        >
          + Add Question
        </button>
      </div>
      
      <div className="p-4 space-y-6">
        {test.items.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs italic">
            No questions in this version. Use AI generation or add manually.
          </div>
        ) : (
          test.items.map((item, idx) => (
            <div key={idx} className="space-y-2 border-b border-slate-200 pb-4 last:border-0 last:pb-0">
              <div className="flex items-start gap-2">
                <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold mt-1">
                  {item.bloomLevel}
                </span>
                <p className="text-sm font-medium text-slate-800">{idx + 1}. {item.question}</p>
              </div>
              {item.options && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-8">
                  {item.options.map((opt, oIdx) => (
                    <div key={oIdx} className="text-xs text-slate-600 border border-slate-200 p-2 rounded bg-white">
                      {String.fromCharCode(65 + oIdx)}. {opt}
                    </div>
                  ))}
                </div>
              )}
              <div className="pl-8 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                Correct Answer: {item.answer}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Manual Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-slate-800 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold uppercase tracking-widest text-sm">Add {test.versionType} Item</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Question Text</label>
                <textarea 
                  className="w-full border border-slate-200 p-3 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  rows={3}
                  value={newItem.question}
                  onChange={(e) => setNewItem({...newItem, question: e.target.value})}
                  placeholder="e.g. What is the primary purpose of a preliminary investigation?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Bloom's Level</label>
                  <select 
                    className="w-full border border-slate-200 p-2 rounded-lg text-sm bg-white"
                    value={newItem.bloomLevel}
                    onChange={(e) => setNewItem({...newItem, bloomLevel: e.target.value as any})}
                  >
                    <option value="K1">K1 - Knowledge</option>
                    <option value="K2">K2 - Comprehension</option>
                    <option value="K3">K3 - Application</option>
                    <option value="K4">K4 - Analysis</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Correct Answer</label>
                  <input 
                    type="text"
                    className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    value={newItem.answer}
                    onChange={(e) => setNewItem({...newItem, answer: e.target.value})}
                    placeholder="e.g. Option B"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Options (Optional)</label>
                {newItem.options?.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 w-4">{String.fromCharCode(65 + idx)}</span>
                    <input 
                      type="text"
                      className="flex-1 border border-slate-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                      value={opt}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddItem}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-amber-700 transition-all"
              >
                Save Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCard;
