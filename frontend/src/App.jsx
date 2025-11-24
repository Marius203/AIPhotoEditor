import { useState, useEffect } from 'react';
import './App.css';
import ImageUpload from './components/ImageUpload';
import PromptInput from './components/PromptInput';
import ImageEditor from './components/ImageEditor';
import Auth from './components/Auth';
import ExpertSelector from './components/ExpertSelector';
import DownloadModal from './components/DownloadModal';
import PricingModal from './components/PricingModal';
import logo from './assets/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.96.1:8081';
console.log('API_URL:', API_URL);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [selectedExpert, setSelectedExpert] = useState('interior_decorator');
  const [editedImage, setEditedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [guestGenerationUsed, setGuestGenerationUsed] = useState(false); // Track guest generation

  useEffect(() => {
    // Check if user is already logged in and fetch their credits
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');

    if (token && username) {
      setIsAuthenticated(true);
      // Fetch fresh user data including credits
      fetchUserData(token, username, email);
    }

    // Check if guest has already generated an image
    const guestUsed = sessionStorage.getItem('guestGenerationUsed');
    if (guestUsed === 'true') {
      setGuestGenerationUsed(true);
    }
  }, []);

  const fetchUserData = async (token, username, email) => {
    try {
      // You can create an endpoint to fetch user data, for now we'll set basic info
      setUser({ username, email, token, credits: 0, paid: false });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser({ username, email, token, credits: 0, paid: false });
    }
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser({ ...userData, credits: userData.credits || 0, paid: userData.paid || false });
    setShowAuthModal(false);
    // Reset guest generation limit after login
    setGuestGenerationUsed(false);
    sessionStorage.removeItem('guestGenerationUsed');
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
    setGuestGenerationUsed(false);
    sessionStorage.removeItem('guestGenerationUsed');
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

    // Check if guest has already used their free generation
    if (!isAuthenticated && guestGenerationUsed) {
      setError('You have used your free generation. Please sign in to continue.');
      setShowAuthModal(true);
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

          // Build headers - only add Authorization if user is authenticated
          const headers = {
            'Content-Type': 'application/json'
          };

          if (user && user.token) {
            headers['Authorization'] = `Bearer ${user.token}`;
          }

          // Call backend API
          const response = await fetch(`${API_URL}/api/edit-image`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
              imageData: base64Image,
              prompt: prompt,
              mimeType: uploadedImage.type,
              expert: selectedExpert
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

            // If guest, mark their free generation as used
            if (!isAuthenticated) {
              setGuestGenerationUsed(true);
              sessionStorage.setItem('guestGenerationUsed', 'true');
            }

            // If authenticated, refresh user credits
            if (isAuthenticated && user && data.remainingCredits !== undefined) {
              setUser({ ...user, credits: data.remainingCredits, paid: true });
            }

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

  return (
    <div className="app">
      <header className="app-header">
        <h1><img src={logo} alt="PolyEdits" className="header-logo" />PolyEdits</h1>
        <div className="header-user">
          {isAuthenticated ? (
            <>
              <div className="credits-display" onClick={() => setShowPricingModal(true)}>
                <span className="credits-icon">⚡</span>
                <span className="credits-count">{user.credits || 0}</span>
                <span className="credits-text">credits</span>
              </div>
              <span className="username">Welcome, {user.username}</span>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="login-button">Sign In</button>
          )}
        </div>
      </header>

      <main className="app-main">
        <section className="hero-section">
          <div className="hero-background">
            {/* Add your hero image here */}
            <div className="hero-overlay"></div>
          </div>
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              AI-POWERED VISION
            </div>
            <h1 className="hero-title">
              Transform Reality with
              <span className="hero-title-gradient"> Neural Precision</span>
            </h1>
            <p className="hero-description">
              Seven domain experts. Infinite possibilities. Watch as cutting-edge AI reshapes your images
              with professional-grade artistry—from interior design to time-traveling restoration.
            </p>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="stat-number">7</div>
                <div className="stat-label">Expert Domains</div>
              </div>
              <div className="hero-stat">
                <div className="stat-number">∞</div>
                <div className="stat-label">Creative Possibilities</div>
              </div>
              <div className="hero-stat">
                <div className="stat-number">AI</div>
                <div className="stat-label">Neural Engine</div>
              </div>
            </div>
          </div>
        </section>

        {/* Guest generation limit warning */}
        {!isAuthenticated && guestGenerationUsed && (
          <div className="guest-limit-banner">
            <p>🎉 You've used your free generation! <button onClick={() => setShowAuthModal(true)} className="banner-link">Sign in</button> to create unlimited images with credits.</p>
          </div>
        )}

        <div className="top-section">
          <div className="grid-item upload-box">
            <ImageUpload onImageUpload={handleImageUpload} />
          </div>

          <div className="grid-item prompt-box">
            <ExpertSelector
              selectedExpert={selectedExpert}
              onExpertChange={setSelectedExpert}
              disabled={isProcessing || (!isAuthenticated && guestGenerationUsed)}
            />
            <PromptInput
              prompt={prompt}
              onPromptChange={handlePromptChange}
              disabled={isProcessing || (!isAuthenticated && guestGenerationUsed)}
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
                disabled={!uploadedImage || !prompt.trim() || isProcessing || (!isAuthenticated && guestGenerationUsed)}
              >
                {isProcessing ? 'Generating...' : (!isAuthenticated && guestGenerationUsed ? 'Sign In to Continue' : 'Generate Picture')}
              </button>

              {editedImage && (
                <button onClick={async () => {
                  // Block guests from downloading
                  if (!isAuthenticated) {
                    setShowDownloadModal(true);
                    return;
                  }

                  // Check if user has paid flag
                  if (!user.paid) {
                    setShowDownloadModal(true);
                    return;
                  }

                  // User can download - proceed with download and mark as downloaded
                  try {
                    const link = document.createElement('a');
                    link.href = editedImage;
                    link.download = `polyedits-${Date.now()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // Mark download in backend (sets paid=false)
                    await fetch(`${API_URL}/api/download/mark-downloaded`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${user.token}`
                      }
                    });

                    // Update local user state
                    setUser({ ...user, paid: false });
                  } catch (error) {
                    console.error('Download error:', error);
                  }
                }} className="download-button-main">
                  {!isAuthenticated ? '🔒 Sign In to Download' : 'Download'}
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

      {/* Modals */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <Auth onLogin={handleLogin} />
          </div>
        </div>
      )}

      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogin={() => {
          setShowDownloadModal(false);
          setShowAuthModal(true);
        }}
        onBuyCredits={() => {
          setShowDownloadModal(false);
          setShowPricingModal(true);
        }}
      />

      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        user={user}
      />
    </div>
  );
}

export default App;
