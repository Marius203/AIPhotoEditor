package com.polyedits.aiphotoeditor.dto;

public class PaymentRequest {
    private Integer credits;

    public PaymentRequest() {
    }

    public PaymentRequest(Integer credits) {
        this.credits = credits;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }
}
