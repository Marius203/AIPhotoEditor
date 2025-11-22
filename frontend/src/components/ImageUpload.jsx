import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

function ImageUpload({ onImageUpload }) {
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        if (file.type.startsWith('image/')) {
            onImageUpload(file);
        } else {
            alert('Please upload an image file');
        }
    };

    return (
        <div className="h-full w-full">
            <form
                className={`h-full w-full relative group flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-all duration-300 ${dragActive
                    ? 'border-cyan-500 bg-cyan-500/10 scale-[0.99]'
                    : 'border-white/10 bg-slate-900/50 hover:border-white/20 hover:bg-slate-900/80'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onSubmit={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                />

                <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                    <div className={`p-4 rounded-full bg-slate-800/50 ring-1 ring-white/10 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)] ${dragActive ? 'text-cyan-400' : 'text-slate-400'}`}>
                        <Upload className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-200">
                            <span className="text-cyan-400">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-slate-500">JPG, PNG, WEBP (Max 10MB)</p>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default ImageUpload;