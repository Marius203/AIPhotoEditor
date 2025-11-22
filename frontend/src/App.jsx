import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Wand2,
  Download,
  LogOut,
  User,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Aperture,
  Layers
} from 'lucide-react';
import ImageUpload from './components/ImageUpload';
import PromptInput from './components/PromptInput';
import ImageEditor from './components/ImageEditor';
import Auth from './components/Auth';
<<<<<<< HEAD
import ExpertSelector from './components/ExpertSelector';
import logo from './assets/logo.png';
=======
>>>>>>> 2091ddeeb59edebd9a0218b844ca12d557cc3aff

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [selectedExpert, setSelectedExpert] = useState('photographer');
  const [editedImage, setEditedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Grid Ref for glowing effect
  const containerRef = useRef(null);

  useEffect(() => {
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
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
    setUploadedImage(null);
    setEditedImage(null);
    setPrompt('');
    setError(null);
  };

  const handleEditImage = async () => {
    if (!uploadedImage || !prompt) {
      setError('Please upload an image and enter a directive.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result.split(',')[1];
          const response = await fetch('http://localhost:8081/api/edit-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
              imageData: base64Image,
              prompt: prompt,
              mimeType: uploadedImage.type,
              expert: selectedExpert
            })
          });

          if (!response.ok) throw new Error('Processing failed');

          const data = await response.json();
          if (data.success && data.imageData) {
            setEditedImage(`data:${data.mimeType};base64,${data.imageData}`);
          } else {
            setError(data.message || 'Failed to generate image');
          }
        } catch (err) {
          console.error(err);
          setError('Failed to connect to AI core. Ensure backend is running.');
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(uploadedImage);
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) return <Auth onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col">

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Aperture className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              PolyEdits
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/5">
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-cyan-400 font-bold">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-300">{user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col gap-6">

<<<<<<< HEAD
          <div className="grid-item prompt-box">
            <ExpertSelector
              selectedExpert={selectedExpert}
              onExpertChange={setSelectedExpert}
              disabled={isProcessing}
            />
            <PromptInput
              prompt={prompt}
              onPromptChange={handlePromptChange}
              disabled={isProcessing}
              hideButton={true}
            />
          </div>
=======
        {/* Top Grid: Upload | Prompt | Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[400px]">
>>>>>>> 2091ddeeb59edebd9a0218b844ca12d557cc3aff

          {/* Col 1: Upload */}
          <div className="flex flex-col h-full bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm relative">
            <div className="px-5 py-4 border-b border-white/5 bg-slate-900/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" /> Input Source
              </h3>
            </div>
            <div className="flex-1 p-4">
              <ImageUpload onImageUpload={setUploadedImage} />
            </div>
          </div>

          {/* Col 2: Prompt */}
          <div className="flex flex-col h-full bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="px-5 py-4 border-b border-white/5 bg-slate-900/50">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-purple-400" /> Configuration
              </h3>
            </div>
            <div className="flex-1 p-4">
              <PromptInput
                prompt={prompt}
                onPromptChange={setPrompt}
                disabled={isProcessing}
                hideButton={true}
              />
            </div>
          </div>

          {/* Col 3: Original Preview */}
          <div className="flex flex-col h-full bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="px-5 py-4 border-b border-white/5 bg-slate-900/50">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" /> Source Preview
              </h3>
            </div>
            <div className="flex-1 p-4 flex items-center justify-center bg-slate-950/30 m-4 rounded-xl border border-white/5 border-dashed">
              {uploadedImage ? (
                <img
                  src={URL.createObjectURL(uploadedImage)}
                  alt="Original"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
                />
              ) : (
                <div className="text-slate-600 flex flex-col items-center gap-2">
                  <ImageIcon className="w-10 h-10 opacity-20" />
                  <span className="text-xs uppercase tracking-widest opacity-50">No Asset Loaded</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Actions & Result */}
        <div className="flex-1 min-h-[400px] flex flex-col bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm relative">

          {/* Glowing border effect */}
          {isProcessing && (
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse" />
          )}

          <div className="px-6 py-4 border-b border-white/5 bg-slate-900/50 flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Aperture className="w-4 h-4 text-emerald-400" /> Output Terminal
            </h3>
            <div className="flex gap-3">
              <button
                onClick={handleEditImage}
                disabled={!uploadedImage || !prompt.trim() || isProcessing}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Output
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 p-8 flex items-center justify-center relative">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

            {isProcessing ? (
              <div className="flex flex-col items-center gap-4 z-10">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-purple-500 rounded-full animate-spin [animation-duration:1.5s]" />
                </div>
                <p className="text-cyan-400 text-sm font-mono animate-pulse">AI MODEL PROCESSING...</p>
              </div>
            ) : editedImage ? (
              <ImageEditor editedImage={editedImage} />
            ) : (
              <div className="text-center space-y-4 z-10 opacity-50">
                <div className="w-24 h-24 mx-auto rounded-full bg-slate-800/50 border border-white/5 flex items-center justify-center">
                  <Wand2 className="w-8 h-8 text-slate-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 font-medium">Ready to Generate</p>
                  <p className="text-slate-600 text-sm">Upload an image and provide a prompt to begin</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm backdrop-blur-md shadow-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
