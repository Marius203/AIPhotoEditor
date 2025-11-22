package com.polyedits.aiphotoeditor.dto;

public class PaymentResponse {
    private boolean success;
    private String checkoutUrl;
    private String message;

    public PaymentResponse() {
    }

    public PaymentResponse(boolean success, String checkoutUrl, String message) {
        this.success = success;
        this.checkoutUrl = checkoutUrl;
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getCheckoutUrl() {
        return checkoutUrl;
    }

    public void setCheckoutUrl(String checkoutUrl) {
        this.checkoutUrl = checkoutUrl;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
