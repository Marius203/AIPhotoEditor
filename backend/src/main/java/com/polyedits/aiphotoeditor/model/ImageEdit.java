package com.polyedits.aiphotoeditor.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "image_edits")
public class ImageEdit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String prompt;

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    private boolean success;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // We won't store the full image data in DB by default to avoid performance issues
    // But we can store it if needed. For now let's just track the request.
    
    public ImageEdit() {
        this.createdAt = LocalDateTime.now();
    }

    public ImageEdit(String prompt, String mimeType, boolean success, String errorMessage) {
        this.prompt = prompt;
        this.mimeType = mimeType;
        this.success = success;
        this.errorMessage = errorMessage;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
