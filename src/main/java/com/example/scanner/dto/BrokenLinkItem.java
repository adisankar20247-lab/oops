package com.example.scanner.dto;

public class BrokenLinkItem {

    private String url;
    private Integer statusCode;
    private String status; // Working, Broken, Error, Skipped

    public BrokenLinkItem() {
    }

    public BrokenLinkItem(String url, Integer statusCode, String status) {
        this.url = url;
        this.statusCode = statusCode;
        this.status = status;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Integer getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(Integer statusCode) {
        this.statusCode = statusCode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
