package com.polyedits.aiphotoeditor.service;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.polyedits.aiphotoeditor.dto.ImageEditResponse;
import com.polyedits.aiphotoeditor.model.ImageEdit;
import com.polyedits.aiphotoeditor.model.User;
import com.polyedits.aiphotoeditor.repository.ImageEditRepository;
import com.polyedits.aiphotoeditor.repository.UserRepository;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model}")
    private String model;

    @Autowired
    private ImageEditRepository imageEditRepository;

    @Autowired
    private UserRepository userRepository;

    private final OkHttpClient client = new OkHttpClient();
    private final Gson gson = new Gson();

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !(authentication.getPrincipal() instanceof String)) {
            String username = authentication.getName();
            return userRepository.findByUsername(username).orElse(null);
        }
        return null;
    }

    private String getExpertSystemPrompt(String expert) {
        if (expert == null || expert.isEmpty()) {
            return "";
        }

        return switch (expert.toLowerCase()) {
            
    case "interior_decorator" -> 
        "You are an elite interior designer with decades of experience in transforming spaces. " +
        "Your expertise includes color theory, spatial arrangement, lighting design, and creating harmonious living environments. " +
        "Analyze the image carefully and apply your professional knowledge to fulfill the client's vision with precision and style. " +
        "Consider lighting, proportions, color harmony, and modern design trends. ";

    case "celebrity_make_up_artist" ->
        "You are a world-renowned celebrity makeup artist with extensive experience in high-fashion and editorial beauty. " +
        "Your expertise includes facial structure analysis, color cosmetics, and realistic texture application. " +
        "Analyze the facial features and apply your artistry to enhance beauty while maintaining skin realism and texture. " +
        "Consider bone structure, skin tone compatibility, and current beauty trends. ";

    case "fashion_stylist" ->
        "You are a high-end fashion stylist known for curating iconic looks for magazines and red carpets. " +
        "Your expertise includes garment fit, textile physics, trend forecasting, and color coordination. " +
        "Analyze the subject's pose and physique to digitally dress them in outfits that drape naturally and look authentic. " +
        "Consider fabric weight, lighting interaction, and sartorial elegance. ";

    case "lighting_director" ->
        "You are a master lighting director and cinematographer with a portfolio of award-winning visual storytelling. " +
        "Your expertise includes volumetric lighting, shadow manipulation, color grading, and creating atmospheric depth. " +
        "Analyze the scene's geometry and re-light it to create a specific mood while maintaining physical consistency. " +
        "Consider light source direction, shadow falloff, and emotional impact. ";

    case "digital_painter" ->
        "You are a virtuoso digital artist capable of mimicking traditional media with indistinguishable accuracy. " +
        "Your expertise includes brush stroke simulation, texture blending, composition, and artistic abstraction. " +
        "Analyze the image composition and re-render it into the requested artistic style, maintaining the essence of the subject. " +
        "Consider stroke direction, medium physical properties (e.g., watercolor bleed), and color palettes. ";

    case "time_traveler" ->
        "You are a specialized archival photo restoration expert with deep knowledge of historical photography techniques. " +
        "Your expertise includes damage removal, noise reduction, detail reconstruction, and historically accurate colorization. " +
        "Analyze the image for degradation and restore it to its original glory without creating artificial artifacts. " +
        "Consider authentic period colors, grain structure, and historical context. ";

    case "product_photographer" ->
        "You are a commercial product photographer known for creating crisp, high-converting e-commerce imagery. " +
        "Your expertise includes studio lighting setups, background removal, reflection management, and material enhancement. " +
        "Analyze the product's material properties and present it in the cleanest, most attractive way possible. " +
        "Consider edge definition, surface reflections, and neutral color balance. ";

    default -> 
        "You are an expert AI image editor capable of precise and creative photo manipulation. " +
        "Analyze the user's request and the provided image to generate high-quality visual results. ";
        };
    }

    public ImageEditResponse editImage(String base64Image, String prompt, String mimeType, String expert) throws IOException {
        // Check if user is authenticated and handle credits
        User currentUser = getCurrentUser();
        if (currentUser != null) {
            // User is authenticated - check and deduct credits
            if (currentUser.getCredits() < 10) {
                return new ImageEditResponse(false, null, null, "Insufficient credits. You need 10 credits to generate an image.");
            }
            
            // Deduct credits and set paid flag
            currentUser.setCredits(currentUser.getCredits() - 10);
            currentUser.setPaid(true);
            userRepository.save(currentUser);
        }
        // If currentUser is null, guest user - allow generation without credits
        
        String url = String.format(
                "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                model, apiKey
        );

        // Build request JSON
        JsonObject requestBody = new JsonObject();
        JsonArray contents = new JsonArray();
        JsonObject content = new JsonObject();
        JsonArray parts = new JsonArray();

        // Add text part with expert system prompt
        JsonObject textPart = new JsonObject();
        String fullPrompt = getExpertSystemPrompt(expert) + "Client Request: " + prompt;
        textPart.addProperty("text", fullPrompt);
        parts.add(textPart);

        // Add image part
        JsonObject imagePart = new JsonObject();
        JsonObject inlineData = new JsonObject();
        inlineData.addProperty("mimeType", mimeType != null ? mimeType : "image/jpeg");
        inlineData.addProperty("data", base64Image);
        imagePart.add("inlineData", inlineData);
        parts.add(imagePart);

        content.add("parts", parts);
        contents.add(content);
        requestBody.add("contents", contents);

        RequestBody body = RequestBody.create(
                gson.toJson(requestBody),
                MediaType.parse("application/json")
        );

        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Unexpected response: " + response);
            }

            String responseBody = response.body().string();
            JsonObject jsonResponse = gson.fromJson(responseBody, JsonObject.class);

            // Parse response
            if (jsonResponse.has("candidates")) {
                JsonArray candidates = jsonResponse.getAsJsonArray("candidates");
                if (candidates.size() > 0) {
                    JsonObject candidate = candidates.get(0).getAsJsonObject();
                    JsonObject contentObj = candidate.getAsJsonObject("content");
                    JsonArray responseParts = contentObj.getAsJsonArray("parts");

                    // Look for image in response
                    for (int i = 0; i < responseParts.size(); i++) {
                        JsonObject part = responseParts.get(i).getAsJsonObject();
                        if (part.has("inlineData")) {
                            JsonObject inlineDataResponse = part.getAsJsonObject("inlineData");
                            String imageData = inlineDataResponse.get("data").getAsString();
                            String responseMimeType = inlineDataResponse.get("mimeType").getAsString();

                            // Save to DB with current user
                            try {
                                ImageEdit imageEdit = new ImageEdit(prompt, mimeType, true, null);
                                imageEdit.setUser(currentUser);
                                imageEditRepository.save(imageEdit);
                            } catch (Exception e) {
                                System.err.println("Failed to save edit history: " + e.getMessage());
                            }

                            return new ImageEditResponse(true, imageData, responseMimeType, "Image edited successfully");
                        }
                    }

                    // If no image found, return text response
                    StringBuilder textResponse = new StringBuilder();
                    for (int i = 0; i < responseParts.size(); i++) {
                        JsonObject part = responseParts.get(i).getAsJsonObject();
                        if (part.has("text")) {
                            textResponse.append(part.get("text").getAsString());
                        }
                    }

                    String errorMsg = "API returned text instead of image: " + textResponse.toString();
                    try {
                        ImageEdit imageEdit = new ImageEdit(prompt, mimeType, false, errorMsg);
                        imageEdit.setUser(currentUser);
                        imageEditRepository.save(imageEdit);
                    } catch (Exception e) {
                        System.err.println("Failed to save edit history: " + e.getMessage());
                    }

                    return new ImageEditResponse(false, null, null, errorMsg);
                }
            }

            try {
                ImageEdit imageEdit = new ImageEdit(prompt, mimeType, false, "Unexpected API response format");
                imageEdit.setUser(currentUser);
                imageEditRepository.save(imageEdit);
            } catch (Exception e) {
                System.err.println("Failed to save edit history: " + e.getMessage());
            }

            return new ImageEditResponse(false, null, null, "Unexpected API response format");
        }
    }
}
