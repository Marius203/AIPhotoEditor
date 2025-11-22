import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import './ImageUpload.css';

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
        <div className="image-upload-container">
            <form
                className={`upload-form ${dragActive ? 'drag-active' : ''}`}
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
                />

                <div className="upload-icon-wrapper">
                    <Upload className="upload-icon" />
                </div>
                <div className="upload-content">
                    <p className="upload-text">
                        <span className="upload-text-highlight">Click to upload</span> or drag and drop
                    </p>
                    <p className="upload-subtext">JPG, PNG, WEBP (Max 10MB)</p>
                </div>
            </form>
        </div>
    );
}

export default ImageUpload;