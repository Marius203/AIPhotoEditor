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

    public ImageEditResponse editImage(String base64Image, String prompt, String mimeType) throws IOException {
        String url = String.format(
                "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                model, apiKey
        );

        // Build request JSON
        JsonObject requestBody = new JsonObject();
        JsonArray contents = new JsonArray();
        JsonObject content = new JsonObject();
        JsonArray parts = new JsonArray();

        // Add text part
        JsonObject textPart = new JsonObject();
        textPart.addProperty("text", prompt);
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
