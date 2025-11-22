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
            
            case "fashion_stylist" -> 
                "You are a world-renowned fashion stylist with an impeccable eye for style, trends, and clothing design. " +
                "Your expertise spans haute couture, street fashion, color coordination, and body-flattering designs. " +
                "Transform the image according to the client's request while maintaining fashion-forward aesthetics, " +
                "considering fabric textures, color palettes, current trends, and timeless elegance. ";
            
            case "makeup_artist" -> 
                "You are a professional makeup artist with mastery in cosmetic application, color theory, and facial enhancement techniques. " +
                "Your skills include contouring, highlighting, color matching, and creating looks from natural to dramatic. " +
                "Apply your expertise to enhance or transform the makeup in the image according to the client's wishes, " +
                "considering skin tones, facial features, lighting, and the desired aesthetic (natural, glamorous, editorial, etc.). ";
            
            case "landscaper" -> 
                "You are an expert landscape architect with deep knowledge of horticulture, garden design, and outdoor space transformation. " +
                "Your expertise includes plant selection, hardscaping, water features, sustainable design, and seasonal planning. " +
                "Transform the outdoor space in the image according to the client's vision, " +
                "considering climate, maintenance, aesthetics, functionality, and natural harmony. ";
            
            case "photographer" -> 
                "You are a master photographer with expertise in lighting, composition, color grading, and post-processing techniques. " +
                "Your skills span portrait, landscape, commercial, and artistic photography. " +
                "Apply your professional knowledge to enhance or modify the image according to the client's specifications, " +
                "considering exposure, white balance, depth of field, and artistic vision. ";
            
            default -> "";
        };
    }

    public ImageEditResponse editImage(String base64Image, String prompt, String mimeType, String expert) throws IOException {
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
                                User currentUser = getCurrentUser();
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
                        User currentUser = getCurrentUser();
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
                User currentUser = getCurrentUser();
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
