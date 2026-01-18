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
    
    const isQuestionMissing = !newItem.question.trim();
    const isAnswerMissing = !newItem.answer.trim();
    const isRubricMissing = newItem.type === 'Short Answer Essay' && !newItem.rubric?.trim();

    if (isQuestionMissing || isAnswerMissing || isRubricMissing) {
      return;
    }

    onAddItem({ ...newItem });
    setIsModalOpen(false);
    setAttemptedSubmit(false);
    setNewItem({ type: 'Multiple Choice', question: '', options: ['', '', '', ''], answer: '', rubric: '', bloomLevel: 'K1' });
  };

  const updateOption = (idx: number, val: string) => {
    const nextOpts = [...(newItem.options || [])];
    nextOpts[idx] = val;
    setNewItem({ ...newItem, options: nextOpts });
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

  const bloomGuidance = {
    K1: {
      label: "Knowledge (Recall)",
      description: "Focuses on knowledge retrieval. Use for identifying definitions, facts, or basic regulations.",
      example: "e.g. 'Define Jurisdiction according to AR 27-10.'"
    },
    K2: {
      label: "Comprehension (Understand)",
      description: "Requires interpreting or explaining concepts. Use to verify understanding of a scenario.",
      example: "e.g. 'Explain the purpose of a summary court-martial board.'"
    },
    K3: {
      label: "Application (Apply)",
      description: "Applying rules to specific tactical situations. Use for procedural tasks and scenario application.",
      example: "e.g. 'Apply the rule for probable cause to the provided search warrant scenario.'"
    },
    K4: {
      label: "Analysis (Analyze)",
      description: "Breaking down complex problems into components. Use for legal sufficiency reviews and analysis.",
      example: "e.g. 'Analyze the investigation file to determine which evidence is legally sufficient.'"
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-slate-800 text-white px-5 py-4 flex justify-between items-center">
        <div className="flex flex-col">
          <h4 className="font-bold text-sm uppercase tracking-wide">{test.versionType} Examination</h4>
          <span className="text-[10px] italic opacity-70 mt-0.5">{test.purpose}</span>
        </div>
        <button 
          onClick={() => { setIsModalOpen(true); setAttemptedSubmit(false); }}
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
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border ${getBloomColor(item.bloomLevel)}`}>
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
                      item.type === 'Matching' ? 'bg-indigo-100 text-indigo-700' :
                      item.type === 'Sequencing' ? 'bg-cyan-100 text-cyan-700' :
                      item.type === 'Complex Multiple Choice' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed mb-3">{item.question}</p>
                  
                  {(item.type === 'Multiple Choice' || item.type === 'Complex Multiple Choice' || item.type === 'True/False') && item.options && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      {item.options.map((opt, oIdx) => (
                        <div key={oIdx} className="text-xs text-slate-600 border border-slate-200 p-3 rounded-xl bg-white flex items-center gap-3">
                          <span className="font-black text-slate-400 w-4">{String.fromCharCode(65 + oIdx)}.</span>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {item.type === 'Matching' && item.options && (
                    <div className="grid grid-cols-1 gap-2 mb-3">
                      {item.options.filter(o => o.includes('|')).map((opt, oIdx) => {
                        const [left, right] = opt.split('|');
                        return (
                          <div key={oIdx} className="flex items-center gap-4 text-xs">
                             <div className="flex-1 bg-white border border-slate-200 p-2 rounded-lg font-medium">{left}</div>
                             <div className="text-slate-300 font-black">← ? →</div>
                             <div className="flex-1 bg-slate-100 border border-slate-200 p-2 rounded-lg text-slate-500 italic">Match Item {oIdx + 1}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {item.type === 'Sequencing' && item.options && (
                    <div className="space-y-2 mb-3">
                      {item.options.map((opt, oIdx) => (
                        <div key={oIdx} className="text-xs text-slate-600 border border-slate-200 border-dashed p-2 rounded-lg bg-white flex items-center gap-3">
                          <span className="font-black text-slate-300 uppercase text-[8px]">Step {oIdx + 1}</span>
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
                      {item.rubric ? (
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                          <h5 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="text-sm">📝</span> Grading Rubric
                          </h5>
                          <div className="text-xs text-amber-800 whitespace-pre-wrap leading-relaxed">{item.rubric}</div>
                        </div>
                      ) : (
                        <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-[10px] font-black uppercase flex items-center gap-2">
                          <span className="text-sm">⚠️</span> Missing Mandatory Rubric
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
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Question Type</label>
                  <select 
                    className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                    value={newItem.type}
                    onChange={(e) => {
                      const type = e.target.value as TestItemType;
                      let options = newItem.options;
                      if (type === 'True/False') options = ['True', 'False'];
                      else if (type === 'Matching') options = ['Term 1|Def 1', 'Term 2|Def 2', 'Term 3|Def 3'];
                      else if (type === 'Sequencing') options = ['Step 1', 'Step 2', 'Step 3'];
                      else options = ['', '', '', ''];
                      setNewItem({...newItem, type, options});
                    }}
                  >
                    <option value="Multiple Choice">Multiple Choice</option>
                    <option value="Complex Multiple Choice">Complex Multiple Choice</option>
                    <option value="Short Answer Essay">Short Answer Essay</option>
                    <option value="Matching">Matching (Alignment)</option>
                    <option value="Sequencing">Sequencing (Order)</option>
                    <option value="True/False">True/False</option>
                    <option value="Fill in the Blank">Fill in the Blank</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Cognitive Level (Bloom's) <span className="text-red-500">*</span></label>
                  <select 
                    className={`w-full border p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 font-bold transition-all ${
                      newItem.bloomLevel === 'K1' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                      newItem.bloomLevel === 'K2' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                      newItem.bloomLevel === 'K3' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                      'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                    value={newItem.bloomLevel}
                    onChange={(e) => setNewItem({...newItem, bloomLevel: e.target.value as any})}
                  >
                    <option value="K1">K1 - {bloomGuidance.K1.label}</option>
                    <option value="K2">K2 - {bloomGuidance.K2.label}</option>
                    <option value="K3">K3 - {bloomGuidance.K3.label}</option>
                    <option value="K4">K4 - {bloomGuidance.K4.label}</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Bloom's Explanation */}
              <div className={`p-4 rounded-2xl border transition-all ${getBloomColor(newItem.bloomLevel)} shadow-sm`}>
                <h5 className="text-[10px] font-black uppercase mb-1 tracking-widest flex items-center gap-2">
                  <span className="text-lg">💡</span> {bloomGuidance[newItem.bloomLevel].label} Context
                </h5>
                <p className="text-xs leading-relaxed opacity-90">{bloomGuidance[newItem.bloomLevel].description}</p>
                <p className="text-[10px] mt-2 font-bold italic opacity-70 underline underline-offset-4 decoration-current">{bloomGuidance[newItem.bloomLevel].example}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Question Instruction <span className="text-red-500">*</span></label>
                  {attemptedSubmit && !newItem.question.trim() && <span className="text-[9px] font-black text-red-500 uppercase tracking-widest animate-pulse">Required</span>}
                </div>
                <textarea 
                  className={`w-full border p-4 rounded-xl text-sm focus:ring-2 outline-none shadow-inner transition-all ${
                    attemptedSubmit && !newItem.question.trim() ? 'border-red-300 ring-2 ring-red-100 bg-red-50' : 'border-slate-200 focus:ring-amber-500'
                  }`}
                  rows={2}
                  value={newItem.question}
                  onChange={(e) => setNewItem({...newItem, question: e.target.value})}
                  placeholder={newItem.type === 'Matching' ? "Align the doctrinal terms with their correct definitions." : newItem.type === 'Sequencing' ? "Place the following procedural steps in the correct doctrinal order." : "Draft the question text..."}
                />
              </div>

              {newItem.type === 'Matching' && (
                <div className="space-y-3">
                   <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Define Pairs (Column A | Column B)</label>
                    <button onClick={() => setNewItem({...newItem, options: [...(newItem.options || []), '|']})} className="text-[9px] font-black text-amber-600 uppercase">+ Add Pair</button>
                  </div>
                  <div className="space-y-3">
                    {newItem.options?.map((opt, idx) => {
                      const [left, right] = opt.split('|');
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <input 
                            placeholder="Term" 
                            className="flex-1 border border-slate-200 p-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-amber-500" 
                            value={left} 
                            onChange={(e) => updateOption(idx, `${e.target.value}|${right}`)}
                          />
                          <span className="text-slate-300 font-bold">|</span>
                          <input 
                            placeholder="Definition" 
                            className="flex-1 border border-slate-200 p-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-amber-500" 
                            value={right} 
                            onChange={(e) => updateOption(idx, `${left}|${e.target.value}`)}
                          />
                          <button onClick={() => setNewItem({...newItem, options: newItem.options?.filter((_, i) => i !== idx)})} className="text-slate-300 hover:text-red-500">✕</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {newItem.type === 'Sequencing' && (
                <div className="space-y-3">
                   <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Steps in Correct Order</label>
                    <button onClick={() => setNewItem({...newItem, options: [...(newItem.options || []), '']})} className="text-[9px] font-black text-amber-600 uppercase">+ Add Step</button>
                  </div>
                  <div className="space-y-3">
                    {newItem.options?.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-300 w-4">{idx + 1}</span>
                        <input 
                          type="text"
                          className="flex-1 border border-slate-200 p-2 rounded-lg text-xs outline-none focus:ring-1 focus:ring-amber-500"
                          value={opt}
                          onChange={(e) => updateOption(idx, e.target.value)}
                          placeholder={`Procedural Step ${idx + 1}`}
                        />
                        <button onClick={() => setNewItem({...newItem, options: newItem.options?.filter((_, i) => i !== idx)})} className="text-slate-300 hover:text-red-500">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {newItem.type === 'Short Answer Essay' && (
                <div className={`space-y-3 p-5 rounded-2xl border-2 transition-all shadow-sm ${
                  attemptedSubmit && !newItem.rubric?.trim() 
                    ? 'bg-red-50 border-red-300 ring-4 ring-red-100' 
                    : 'bg-purple-50 border-purple-200 border-dashed'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-black uppercase text-purple-800 tracking-widest flex items-center gap-2">
                      <span className="text-base">🎯</span> 
                      <span>Mandatory Grading Rubric <span className="text-red-500">*</span></span>
                    </label>
                  </div>
                  <textarea 
                    className={`w-full border p-4 rounded-xl text-sm focus:ring-2 outline-none shadow-lg bg-white transition-all ${
                      attemptedSubmit && !newItem.rubric?.trim() ? 'border-red-400 focus:ring-red-500' : 'border-purple-200 focus:ring-purple-500'
                    }`}
                    rows={5}
                    value={newItem.rubric}
                    onChange={(e) => setNewItem({...newItem, rubric: e.target.value})}
                    placeholder="List specific evaluation points..."
                  />
                </div>
              )}

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

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Correct Answer / Key <span className="text-red-500">*</span></label>
                  {attemptedSubmit && !newItem.answer.trim() && <span className="text-[9px] font-black text-red-500 uppercase tracking-widest animate-pulse">Required</span>}
                </div>
                <input 
                  type="text"
                  className={`w-full border p-3 rounded-xl text-sm font-bold focus:ring-2 outline-none transition-all ${
                    attemptedSubmit && !newItem.answer.trim() ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-slate-200 bg-emerald-50/30 focus:ring-emerald-500'
                  }`}
                  value={newItem.answer}
                  onChange={(e) => setNewItem({...newItem, answer: e.target.value})}
                  placeholder={newItem.type === 'Matching' ? "e.g. 1-B, 2-A, 3-C" : newItem.type === 'Sequencing' ? "e.g. 1, 2, 3, 4" : "e.g. Option B"}
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
                Save Item to Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCard;