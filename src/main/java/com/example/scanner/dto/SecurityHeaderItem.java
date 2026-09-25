package com.example.scanner.dto;

public class SecurityHeaderItem {

    private String headerName;
    private boolean present;
    private String headerValue;
    private String description;

    public SecurityHeaderItem() {
    }

    public SecurityHeaderItem(String headerName, boolean present, String headerValue, String description) {
        this.headerName = headerName;
        this.present = present;
        this.headerValue = headerValue;
        this.description = description;
    }

    public String getHeaderName() {
        return headerName;
    }

    public void setHeaderName(String headerName) {
        this.headerName = headerName;
    }

    public boolean isPresent() {
        return present;
    }

    public void setPresent(boolean present) {
        this.present = present;
    }

    public String getHeaderValue() {
        return headerValue;
    }

    public void setHeaderValue(String headerValue) {
        this.headerValue = headerValue;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
