package com.polyedits.aiphotoeditor.controller;

import com.polyedits.aiphotoeditor.model.User;
import com.polyedits.aiphotoeditor.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/download")
public class DownloadController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/mark-downloaded")
    public ResponseEntity<Map<String, Object>> markDownloaded() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                response.put("success", false);
                response.put("message", "User not authenticated");
                return ResponseEntity.status(401).body(response);
            }

            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Set paid flag to false after download
            user.setPaid(false);
            userRepository.save(user);

            response.put("success", true);
            response.put("message", "Download tracked successfully");
            response.put("paid", false);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error tracking download: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/can-download")
    public ResponseEntity<Map<String, Object>> canDownload() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                response.put("canDownload", false);
                response.put("reason", "not_authenticated");
                response.put("message", "Please sign in to download");
                return ResponseEntity.ok(response);
            }

            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getPaid()) {
                response.put("canDownload", true);
                response.put("credits", user.getCredits());
                response.put("message", "You can download your image");
            } else {
                response.put("canDownload", false);
                response.put("reason", "not_paid");
                response.put("credits", user.getCredits());
                response.put("message", "Please generate an image first or purchase credits");
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("canDownload", false);
            response.put("message", "Error checking download eligibility: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
