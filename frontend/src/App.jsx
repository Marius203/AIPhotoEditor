import { useState, useEffect } from 'react';
import './App.css';
import ImageUpload from './components/ImageUpload';
import PromptInput from './components/PromptInput';
import ImageEditor from './components/ImageEditor';
import Auth from './components/Auth';
import logo from './assets/logo.png';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [editedImage, setEditedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');

    if (token && username) {
      setIsAuthenticated(true);
      setUser({ username, email, token });
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    setIsAuthenticated(false);
    setUser(null);
    setUploadedImage(null);
    setEditedImage(null);
    setPrompt('');
    setError(null);
  };

  const handleImageUpload = (imageFile) => {
    setUploadedImage(imageFile);
    setEditedImage(null);
    setError(null);
  };

  const handlePromptChange = (newPrompt) => {
    setPrompt(newPrompt);
  };

  const handleEditImage = async () => {
    if (!uploadedImage || !prompt) {
      setError('Please upload an image and enter a prompt');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result.split(',')[1];

          // Call backend API
          const response = await fetch('http://localhost:8081/api/edit-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
              imageData: base64Image,
              prompt: prompt,
              mimeType: uploadedImage.type
            })
          });

          if (!response.ok) {
            throw new Error('Failed to process image');
          }

          const data = await response.json();
          console.log('API Response:', data);

          if (data.success && data.imageData) {
            const editedImageData = `data:${data.mimeType};base64,${data.imageData}`;
            setEditedImage(editedImageData);
            console.log('Image edited successfully');
          } else {
            setError(data.message || 'Failed to edit image');
          }
        } catch (err) {
          console.error('Error:', err);
          setError(err.message);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(uploadedImage);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1><img src={logo} alt="PolyEdits" className="header-logo" />PolyEdits</h1>
        <div className="header-user">
          <span className="username">Welcome, {user.username}</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <main className="app-main">
        <div className="top-section">
          <div className="grid-item upload-box">
            <ImageUpload onImageUpload={handleImageUpload} />
          </div>

          <div className="grid-item prompt-box">
            <PromptInput
              prompt={prompt}
              onPromptChange={handlePromptChange}
              disabled={isProcessing}
              hideButton={true}
            />
          </div>

          <div className="grid-item original-preview">
            {uploadedImage ? (
              <div className="image-display">
                <h3>Original</h3>
                <img src={URL.createObjectURL(uploadedImage)} alt="Uploaded" />
              </div>
            ) : (
              <div className="placeholder-box">
                <p>Preview</p>
              </div>
            )}
          </div>
        </div>

        <div className="result-section">
          <div className="result-header">
            <h3>Generated Result</h3>
            <div className="result-actions">
              <button
                onClick={handleEditImage}
                className="generate-button"
                disabled={!uploadedImage || !prompt.trim() || isProcessing}
              >
                {isProcessing ? 'Generating...' : 'Generate Picture'}
              </button>

              {editedImage && (
                <button onClick={() => {
                  const link = document.createElement('a');
                  link.href = editedImage;
                  link.download = `edited-image-${Date.now()}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }} className="download-button-main">
                  Download
                </button>
              )}
            </div>
          </div>

          <div className="result-content">
            {isProcessing ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Generating your image...</p>
                <div className="loading-dots">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              </div>
            ) : editedImage ? (
              <div className="result-image-display">
                <img src={editedImage} alt="Edited" />
              </div>
            ) : (
              <div className="placeholder-box">
                <p>Your generated image will appear here</p>
              </div>
            )}
          </div>

          {error && (
            <div className="error">
              <p>{error}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;