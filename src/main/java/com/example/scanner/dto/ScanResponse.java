package com.example.scanner.dto;

import java.time.LocalDateTime;

public class ScanResponse {

    private Long id;
    private String url;
    private String finalUrl;
    private LocalDateTime scanDate;
    private ResponseTimeResult responseTime;
    private SecurityHeaderResult securityHeaders;
    private SSLResult sslCertificate;
    private BrokenLinkResult brokenLinks;

    public ScanResponse() {
    }

    public ScanResponse(Long id, String url, String finalUrl, LocalDateTime scanDate,
                        ResponseTimeResult responseTime, SecurityHeaderResult securityHeaders,
                        SSLResult sslCertificate, BrokenLinkResult brokenLinks) {
        this.id = id;
        this.url = url;
        this.finalUrl = finalUrl;
        this.scanDate = scanDate;
        this.responseTime = responseTime;
        this.securityHeaders = securityHeaders;
        this.sslCertificate = sslCertificate;
        this.brokenLinks = brokenLinks;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getFinalUrl() {
        return finalUrl;
    }

    public void setFinalUrl(String finalUrl) {
        this.finalUrl = finalUrl;
    }

    public LocalDateTime getScanDate() {
        return scanDate;
    }

    public void setScanDate(LocalDateTime scanDate) {
        this.scanDate = scanDate;
    }

    public ResponseTimeResult getResponseTime() {
        return responseTime;
    }

    public void setResponseTime(ResponseTimeResult responseTime) {
        this.responseTime = responseTime;
    }

    public SecurityHeaderResult getSecurityHeaders() {
        return securityHeaders;
    }

    public void setSecurityHeaders(SecurityHeaderResult securityHeaders) {
        this.securityHeaders = securityHeaders;
    }

    public SSLResult getSslCertificate() {
        return sslCertificate;
    }

    public void setSslCertificate(SSLResult sslCertificate) {
        this.sslCertificate = sslCertificate;
    }

    public BrokenLinkResult getBrokenLinks() {
        return brokenLinks;
    }

    public void setBrokenLinks(BrokenLinkResult brokenLinks) {
        this.brokenLinks = brokenLinks;
    }
}
