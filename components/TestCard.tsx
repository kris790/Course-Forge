
import React, { useState } from 'react';
import { TestVersion, TestItem, TestItemType } from '../types';

interface TestCardProps {
  test: TestVersion;
  onAddItem: (item: TestItem) => void;
}

const TestCard: React.FC<TestCardProps> = ({ test, onAddItem }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<TestItem>({
    type: 'Multiple Choice',
    question: '',
    options: ['', '', '', ''],
    answer: '',
    rubric: '',
    bloomLevel: 'K1'
  });

  const handleAddItem = () => {
    if (!newItem.question || !newItem.answer) {
      alert("Question and Answer are required.");
      return;
    }
    onAddItem({ ...newItem });
    setIsModalOpen(false);
    setNewItem({ type: 'Multiple Choice', question: '', options: ['', '', '', ''], answer: '', rubric: '', bloomLevel: 'K1' });
  };

  const updateOption = (idx: number, val: string) => {
    const nextOpts = [...(newItem.options || [])];
    nextOpts[idx] = val;
    setNewItem({ ...newItem, options: nextOpts });
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-slate-800 text-white px-5 py-4 flex justify-between items-center">
        <div className="flex flex-col">
          <h4 className="font-bold text-sm uppercase tracking-wide">{test.versionType} Examination</h4>
          <span className="text-[10px] italic opacity-70 mt-0.5">{test.purpose}</span>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold uppercase px-4 py-2 rounded transition-all shadow-md active:scale-95"
        >
          + Add Question
        </button>
      </div>
      
      <div className="p-6 space-y-8">
        {test.items.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs italic">
            No questions generated. Click "Generate" in the dashboard or add manually.
          </div>
        ) : (
          test.items.map((item, idx) => (
            <div key={idx} className="space-y-4 border-b border-slate-200 pb-8 last:border-0 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1">
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">
                    {item.bloomLevel}
                  </span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    {idx + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      item.type === 'Short Answer Essay' ? 'bg-purple-100 text-purple-700' :
                      item.type === 'Complex Multiple Choice' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed mb-3">{item.question}</p>
                  
                  {/* Rendering logic per type */}
                  {item.options && (item.type === 'Multiple Choice' || item.type === 'Complex Multiple Choice' || item.type === 'True/False') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      {item.options.map((opt, oIdx) => (
                        <div key={oIdx} className="text-xs text-slate-600 border border-slate-200 p-3 rounded-xl bg-white flex items-center gap-3">
                          <span className="font-black text-slate-400 w-4">{String.fromCharCode(65 + oIdx)}.</span>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {item.type === 'Fill in the Blank' && (
                    <div className="border-2 border-dashed border-slate-100 p-4 rounded-xl text-slate-400 text-xs italic mb-3">
                      Student response required...
                    </div>
                  )}

                  {item.type === 'Short Answer Essay' && (
                    <div className="space-y-3 mb-3">
                      <div className="border-2 border-slate-100 p-6 rounded-xl text-slate-400 text-xs italic bg-slate-50 min-h-[100px]">
                        Student essay response area...
                      </div>
                      {item.rubric && (
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                          <h5 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2">Scoring Rubric</h5>
                          <div className="text-xs text-amber-800 whitespace-pre-wrap leading-relaxed">{item.rubric}</div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-2">
                    <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                      Key: {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Manual Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-4">
                <div className="bg-amber-500 text-slate-900 p-2 rounded-lg font-bold">QA</div>
                <h3 className="font-bold uppercase tracking-widest text-sm">Add {test.versionType} Item</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Question Type</label>
                  <select 
                    className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                    value={newItem.type}
                    onChange={(e) => setNewItem({...newItem, type: e.target.value as TestItemType, options: e.target.value === 'True/False' ? ['True', 'False'] : newItem.options})}
                  >
                    <option value="Multiple Choice">Multiple Choice</option>
                    <option value="Complex Multiple Choice">Complex Multiple Choice</option>
                    <option value="Short Answer Essay">Short Answer Essay</option>
                    <option value="True/False">True/False</option>
                    <option value="Fill in the Blank">Fill in the Blank</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Bloom's Level</label>
                  <select 
                    className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                    value={newItem.bloomLevel}
                    onChange={(e) => setNewItem({...newItem, bloomLevel: e.target.value as any})}
                  >
                    <option value="K1">K1 - Recall</option>
                    <option value="K2">K2 - Comprehension</option>
                    <option value="K3">K3 - Application</option>
                    <option value="K4">K4 - Analysis</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Question Text</label>
                <textarea 
                  className="w-full border border-slate-200 p-4 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none shadow-inner"
                  rows={3}
                  value={newItem.question}
                  onChange={(e) => setNewItem({...newItem, question: e.target.value})}
                  placeholder="Draft the question according to Army standards..."
                />
              </div>

              {(newItem.type === 'Multiple Choice' || newItem.type === 'Complex Multiple Choice') && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Answer Options</label>
                  <div className="grid grid-cols-2 gap-4">
                    {newItem.options?.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="text-xs font-black text-slate-300 w-4">{String.fromCharCode(65 + idx)}</span>
                        <input 
                          type="text"
                          className="flex-1 border border-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-slate-50 focus:bg-white"
                          value={opt}
                          onChange={(e) => updateOption(idx, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {newItem.type === 'Short Answer Essay' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Scoring Rubric (Grading Points)</label>
                  <textarea 
                    className="w-full border border-slate-200 p-4 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none shadow-inner bg-amber-50/30"
                    rows={4}
                    value={newItem.rubric}
                    onChange={(e) => setNewItem({...newItem, rubric: e.target.value})}
                    placeholder="List specific points required for full credit..."
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Correct Answer / Key</label>
                <input 
                  type="text"
                  className="w-full border border-slate-200 p-3 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-emerald-50/30"
                  value={newItem.answer}
                  onChange={(e) => setNewItem({...newItem, answer: e.target.value})}
                  placeholder="e.g. Option B, or specific phrase for Fill in Blank"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Discard
              </button>
              <button 
                onClick={handleAddItem}
                className="px-10 py-3 bg-amber-600 text-white rounded-xl text-sm font-black shadow-lg hover:bg-amber-700 transition-all active:scale-95 uppercase tracking-widest"
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
