# AI Photo Editor

A React application that allows users to upload images and edit them using AI-powered prompts via the Google Gemini API.

## Features

- 🖼️ Drag & drop or browse to upload images
- ✨ AI-powered image editing with natural language prompts
- 💾 Download edited images
- 📱 Responsive design
- 🎨 Modern, clean UI

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file from the example:
```bash
cp .env.example .env
```

3. Get your Gemini API key from [Google AI Studio](https://ai.google.dev/) and add it to the `.env` file:
```
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

## Usage

1. Upload an image by dragging and dropping or clicking to browse
2. Enter a prompt describing how you'd like to edit the image (e.g., "Make it black and white", "Add a vintage filter")
3. Click "Edit Image" and wait for the AI to process your request
4. Download the edited image

## Tech Stack

- React + Vite
- Google Gemini API
- CSS3 with modern styling

## Notes

**Important:** The Gemini API's image editing capabilities may vary. The current implementation uses the Gemini 2.0 Flash model for vision tasks. If image editing is not directly supported, the API will analyze the image and provide text descriptions instead.

For actual image manipulation (filters, effects, etc.), you may need to:
- Use additional image processing libraries (like Canvas API, fabric.js, or sharp)
- Implement client-side image filters based on AI suggestions
- Use specialized image editing APIs

## License

MIT

