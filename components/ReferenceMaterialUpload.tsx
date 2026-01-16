
import React, { useState, useRef } from 'react';

interface ReferenceMaterialUploadProps {
  value: string;
  onChange: (value: string) => void;
}

const ReferenceMaterialUpload: React.FC<ReferenceMaterialUploadProps> = ({ value, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      alert('Please upload only .txt or .md files.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      onChange(text);
    };
    reader.readAsText(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
          isDragging 
            ? 'border-amber-500 bg-amber-50' 
            : value 
              ? 'border-emerald-200 bg-emerald-50/30' 
              : 'border-slate-200 hover:border-amber-400 hover:bg-slate-50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          accept=".txt,.md"
          className="hidden"
        />
        
        <div className={`text-3xl ${value ? 'text-emerald-500' : 'text-slate-400'}`}>
          {value ? '📄' : '📤'}
        </div>
        
        <div className="text-center">
          <p className="text-sm font-bold text-slate-700">
            {value ? 'Reference Material Loaded' : 'Click or drag reference material here'}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
            Supports .txt and .md files
          </p>
        </div>

        {value && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 text-xs font-bold"
          >
            Clear ✕
          </button>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">
          Material Content Preview / Manual Entry
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none h-40 text-sm font-mono leading-relaxed bg-white shadow-inner"
          placeholder="Doctrinal text, lesson transcripts, or task descriptions..."
        ></textarea>
      </div>
    </div>
  );
};

export default ReferenceMaterialUpload;
