package com.polyedits.aiphotoeditor.dto;

public class ImageEditResponse {
    private String imageData;
    private String mimeType;
    private String message;
    private boolean success;

    public ImageEditResponse() {}

    public ImageEditResponse(boolean success, String imageData, String mimeType, String message) {
        this.success = success;
        this.imageData = imageData;
        this.mimeType = mimeType;
        this.message = message;
    }

    public String getImageData() {
        return imageData;
    }

    public void setImageData(String imageData) {
        this.imageData = imageData;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }
}
