package com.polyedits.aiphotoeditor.dto;

public class ImageEditRequest {
    private String imageData;
    private String prompt;
    private String mimeType;

    public ImageEditRequest() {}

    public ImageEditRequest(String imageData, String prompt, String mimeType) {
        this.imageData = imageData;
        this.prompt = prompt;
        this.mimeType = mimeType;
    }

    public String getImageData() {
        return imageData;
    }

    public void setImageData(String imageData) {
        this.imageData = imageData;
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
}
