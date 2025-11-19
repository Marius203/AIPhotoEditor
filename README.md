# AI Photo Editor

Full-stack application for editing images using AI (Gemini API).

## Project Structure

```
AIPhotoEditor/
├── frontend/          # React + Vite frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Spring Boot backend
│   ├── src/
│   └── pom.xml
└── README.md
```

## Setup

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

### Backend
```bash
cd backend
# Create .env file with GEMINI_API_KEY=your_key
mvn spring-boot:run
```
Backend runs on `http://localhost:8080`

## Features

- Upload images via drag & drop or file browser
- Describe edits using natural language
- AI-powered image editing using Gemini API
- Download edited images
- Modern dark theme UI

## Tech Stack

**Frontend:**
- React 19
- Vite 7
- CSS3

**Backend:**
- Java 17
- Spring Boot 3.2
- Maven
- Google Gemini API

