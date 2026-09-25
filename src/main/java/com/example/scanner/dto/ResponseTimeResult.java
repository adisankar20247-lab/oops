package com.example.scanner.dto;

import java.time.LocalDateTime;

public class ResponseTimeResult {

    private long responseTimeMs;
    private int httpStatusCode;
    private String httpStatusText;
    private String classification; // Fast, Moderate, Slow, Very Slow
    private String finalUrl;
    private LocalDateTime timestamp;
    private String note;

    public ResponseTimeResult() {
    }

    public ResponseTimeResult(long responseTimeMs, int httpStatusCode, String httpStatusText,
                              String classification, String finalUrl, LocalDateTime timestamp, String note) {
        this.responseTimeMs = responseTimeMs;
        this.httpStatusCode = httpStatusCode;
        this.httpStatusText = httpStatusText;
        this.classification = classification;
        this.finalUrl = finalUrl;
        this.timestamp = timestamp;
        this.note = note;
    }

    public static String classify(long responseTimeMs) {
        if (responseTimeMs < 200) {
            return "Fast";
        } else if (responseTimeMs <= 500) {
            return "Moderate";
        } else if (responseTimeMs <= 1000) {
            return "Slow";
        } else {
            return "Very Slow";
        }
    }

    public long getResponseTimeMs() {
        return responseTimeMs;
    }

    public void setResponseTimeMs(long responseTimeMs) {
        this.responseTimeMs = responseTimeMs;
    }

    public int getHttpStatusCode() {
        return httpStatusCode;
    }

    public void setHttpStatusCode(int httpStatusCode) {
        this.httpStatusCode = httpStatusCode;
    }

    public String getHttpStatusText() {
        return httpStatusText;
    }

    public void setHttpStatusText(String httpStatusText) {
        this.httpStatusText = httpStatusText;
    }

    public String getClassification() {
        return classification;
    }

    public void setClassification(String classification) {
        this.classification = classification;
    }

    public String getFinalUrl() {
        return finalUrl;
    }

    public void setFinalUrl(String finalUrl) {
        this.finalUrl = finalUrl;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
