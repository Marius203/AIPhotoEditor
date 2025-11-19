import './ImageEditor.css';

function ImageEditor({ editedImage }) {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = editedImage;
        link.download = `edited-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="image-editor-container">
            <h3>Edited Result</h3>
            <div className="edited-image-wrapper">
                <img src={editedImage} alt="Edited" />
            </div>
            <button onClick={handleDownload} className="download-button">
                Download Edited Image
            </button>
        </div>
    );
}

export default ImageEditor;
