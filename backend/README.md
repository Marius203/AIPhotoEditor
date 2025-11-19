# AI Photo Editor Backend

Spring Boot backend service for handling Gemini API image editing requests.

## Setup

1. Install Java 17 or higher
2. Install Maven

3. Create `.env` file in the backend directory:
```
GEMINI_API_KEY=your_actual_gemini_api_key
```

4. Build the project:
```bash
cd backend
mvn clean install
```

5. Run the application:
```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

## API Endpoints

### POST /api/edit-image
Edit an image using Gemini API

**Request Body:**
```json
{
  "imageData": "base64_encoded_image",
  "prompt": "description of edits",
  "mimeType": "image/jpeg"
}
```

**Response:**
```json
{
  "success": true,
  "imageData": "base64_encoded_result",
  "mimeType": "image/png",
  "message": "Image edited successfully"
}
```

### GET /api/health
Health check endpoint

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/polyedits/aiphotoeditor/
│   │   │   ├── AiPhotoEditorApplication.java
│   │   │   ├── config/
│   │   │   │   └── CorsConfig.java
│   │   │   ├── controller/
│   │   │   │   └── ImageEditController.java
│   │   │   ├── dto/
│   │   │   │   ├── ImageEditRequest.java
│   │   │   │   └── ImageEditResponse.java
│   │   │   └── service/
│   │   │       └── GeminiService.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── pom.xml
└── .env.example
```
