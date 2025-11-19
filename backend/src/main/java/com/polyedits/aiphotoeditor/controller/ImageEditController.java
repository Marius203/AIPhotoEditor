package com.polyedits.aiphotoeditor.controller;

import com.polyedits.aiphotoeditor.dto.ImageEditRequest;
import com.polyedits.aiphotoeditor.dto.ImageEditResponse;
import com.polyedits.aiphotoeditor.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ImageEditController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/edit-image")
    public ResponseEntity<ImageEditResponse> editImage(@RequestBody ImageEditRequest request) {
        try {
            if (request.getImageData() == null || request.getPrompt() == null) {
                return ResponseEntity.badRequest()
                        .body(new ImageEditResponse(false, null, null, "Image data and prompt are required"));
            }

            ImageEditResponse response = geminiService.editImage(
                    request.getImageData(),
                    request.getPrompt(),
                    request.getMimeType()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ImageEditResponse(false, null, null, "Error processing image: " + e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("AI Photo Editor Backend is running");
    }
}
