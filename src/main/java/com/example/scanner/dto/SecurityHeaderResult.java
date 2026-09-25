package com.example.scanner.dto;

import java.util.ArrayList;
import java.util.List;

public class SecurityHeaderResult {

    private int foundCount;
    private int totalCount;
    private List<SecurityHeaderItem> headers = new ArrayList<>();
    private String summary;

    public SecurityHeaderResult() {
    }

    public SecurityHeaderResult(int foundCount, int totalCount, List<SecurityHeaderItem> headers, String summary) {
        this.foundCount = foundCount;
        this.totalCount = totalCount;
        this.headers = headers;
        this.summary = summary;
    }

    public int getFoundCount() {
        return foundCount;
    }

    public void setFoundCount(int foundCount) {
        this.foundCount = foundCount;
    }

    public int getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }

    public List<SecurityHeaderItem> getHeaders() {
        return headers;
    }

    public void setHeaders(List<SecurityHeaderItem> headers) {
        this.headers = headers;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }
}
