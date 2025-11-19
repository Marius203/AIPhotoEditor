import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './App.css';
import ImageUpload from './components/ImageUpload';
import PromptInput from './components/PromptInput';
import ImageEditor from './components/ImageEditor';

function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [editedImage, setEditedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

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
        const base64Image = reader.result.split(',')[1];

        // Call Gemini API
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error('API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
        }

        const ai = new GoogleGenerativeAI(apiKey);
        const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

        const promptParts = [
          { text: prompt },
          {
            inlineData: {
              mimeType: uploadedImage.type,
              data: base64Image,
            },
          },
        ];

        const result = await model.generateContent(promptParts);
        const response = await result.response;

        console.log('API Response:', response);

        // Check if the response contains parts
        if (response.candidates && response.candidates[0]?.content?.parts) {
          const parts = response.candidates[0].content.parts;
          console.log('Response parts:', parts);

          // Look for inlineData with image
          const imagePart = parts.find(part => part.inlineData);
          if (imagePart && imagePart.inlineData) {
            const editedImageData = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
            setEditedImage(editedImageData);
            console.log('Image found in response');
          } else {
            // If no image returned, show the text response
            const textResponse = parts.map(part => part.text).filter(Boolean).join('');
            console.log('Text response:', textResponse);
            setError(`API Response: ${textResponse}\n\nNote: Gemini API returned text instead of an edited image. Image editing may not be supported in the current API version.`);
          }
        } else {
          console.log('Unexpected response format');
          setError('Unexpected API response format');
        }
      };
      reader.readAsDataURL(uploadedImage);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Photo Editor</h1>
        <p>Upload a photo and describe how you'd like to edit it</p>
      </header>

      <main className="app-main">
        <div className="upload-section">
          <ImageUpload onImageUpload={handleImageUpload} />
          {uploadedImage && (
            <div className="uploaded-preview">
              <h3>Original Image</h3>
              <img src={URL.createObjectURL(uploadedImage)} alt="Uploaded" />
            </div>
          )}
        </div>

        <div className="editor-section">
          <PromptInput
            prompt={prompt}
            onPromptChange={handlePromptChange}
            onSubmit={handleEditImage}
            disabled={!uploadedImage || isProcessing}
          />

          {isProcessing && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Processing your image...</p>
            </div>
          )}

          {error && (
            <div className="error">
              <p>{error}</p>
            </div>
          )}

          {editedImage && (
            <ImageEditor editedImage={editedImage} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
