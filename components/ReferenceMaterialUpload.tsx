
import React, { useState, useRef } from 'react';
import { extractContentFromSlides } from '../services/geminiService';

interface ReferenceMaterialUploadProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  isGoldStandard?: boolean;
}

const ReferenceMaterialUpload: React.FC<ReferenceMaterialUploadProps> = ({ value, onChange, label, isGoldStandard }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{data: string, name: string, mimeType: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isText = file.name.endsWith('.txt') || file.name.endsWith('.md');

    if (!isImage && !isText) {
      alert('Please upload only .txt, .md, or image files (PNG/JPG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (isText) {
        onChange((value ? value + '\n\n' : '') + result);
      } else {
        setUploadedImages(prev => [...prev, { data: result, name: file.name, mimeType: file.type }]);
      }
    };

    if (isText) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const handleExtractSlides = async () => {
    if (uploadedImages.length === 0) return;
    setExtracting(true);
    try {
      const extractedText = await extractContentFromSlides(uploadedImages);
      onChange((value ? value + '\n\n--- EXTRACTED FROM SLIDES ---\n' : '') + extractedText);
      setUploadedImages([]);
    } catch (error) {
      console.error(error);
      alert("Failed to extract content from slides.");
    } finally {
      setExtracting(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(handleFile);
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
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-3 ${
          isDragging 
            ? 'border-amber-500 bg-amber-50' 
            : value || uploadedImages.length > 0
              ? 'border-emerald-200 bg-emerald-50/30' 
              : 'border-slate-200 hover:border-amber-400 hover:bg-slate-50'
        }`}
      >
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files) {
              Array.from(e.target.files).forEach(handleFile);
            }
          }}
          accept=".txt,.md,.png,.jpg,.jpeg"
          className="hidden"
        />
        
        <div className="flex items-center gap-4">
            <div className={`text-3xl ${value || uploadedImages.length > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
            {uploadedImages.length > 0 ? '🖼️' : value ? '📄' : '📤'}
            </div>
            {uploadedImages.length > 0 && (
                <div className="bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-full animate-bounce">
                    {uploadedImages.length}
                </div>
            )}
        </div>
        
        <div className="text-center" onClick={() => fileInputRef.current?.click()}>
          <p className="text-sm font-bold text-slate-700 cursor-pointer">
            {uploadedImages.length > 0 ? 'Images Staged for Extraction' : value ? 'Reference Material Loaded' : 'Upload Slides or Text Docs'}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
            Drag screenshots of slides or doctrinal text
          </p>
        </div>

        {uploadedImages.length > 0 && (
          <div className="w-full mt-4 flex flex-col gap-3">
             <div className="flex flex-wrap gap-2 justify-center">
                {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative w-12 h-12 rounded border border-slate-200 overflow-hidden group">
                        <img src={img.data} className="w-full h-full object-cover opacity-60 group-hover:opacity-100" />
                        <button 
                            onClick={(e) => { e.stopPropagation(); setUploadedImages(prev => prev.filter((_, i) => i !== idx)); }}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 text-[8px] font-bold"
                        >
                            REMOVE
                        </button>
                    </div>
                ))}
             </div>
             <button 
                onClick={(e) => { e.stopPropagation(); handleExtractSlides(); }}
                disabled={extracting}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50"
             >
                {extracting ? '🤖 Scanning & Extracting...' : '✨ Magic Extract from Slides'}
             </button>
          </div>
        )}

        {(value || uploadedImages.length > 0) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              setUploadedImages([]);
            }}
            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 text-xs font-bold"
          >
            Clear All ✕
          </button>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">
          {label || 'Material Content Preview / Manual Entry'}
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border p-4 rounded-xl focus:ring-2 outline-none h-40 text-sm font-mono leading-relaxed bg-white shadow-inner transition-all ${
            isGoldStandard ? 'border-emerald-200 focus:ring-emerald-500' : 'border-slate-200 focus:ring-amber-500'
          }`}
          placeholder="Extracted content from slides, regulations, or style guides will appear here..."
        ></textarea>
      </div>
    </div>
  );
};

export default ReferenceMaterialUpload;
