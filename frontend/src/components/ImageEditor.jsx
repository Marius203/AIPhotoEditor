import React from 'react';
import { Download } from 'lucide-react';

function ImageEditor({ editedImage }) {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = editedImage;
        link.download = `polyedits-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative group">
            <div className="relative max-w-full max-h-[600px] overflow-hidden rounded-lg border border-white/10 shadow-2xl">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img
                    src={editedImage}
                    alt="Edited Result"
                    className="max-w-full h-auto max-h-[600px] object-contain"
                />
                <button
                    onClick={handleDownload}
                    className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-cyan-600/90 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg backdrop-blur-md shadow-lg transition-all transform translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                >
                    <Download className="w-4 h-4" /> Save Asset
                </button>
            </div>
        </div>
    );
}

export default ImageEditor;