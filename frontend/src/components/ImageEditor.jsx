import React from 'react';
import { Download } from 'lucide-react';
import './ImageEditor.css';

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
        <div className="image-editor-container">
            <img src={editedImage} alt="Edited" className="edited-image" />
            <button onClick={handleDownload} className="download-button">
                <Download className="download-icon" />
                Download Image
            </button>
        </div>
    );
}

export default ImageEditor;