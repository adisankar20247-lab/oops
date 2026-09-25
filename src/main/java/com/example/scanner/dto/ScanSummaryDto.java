package com.example.scanner.dto;

import java.time.LocalDateTime;

public class ScanSummaryDto {

    private Long id;
    private String url;
    private LocalDateTime scanDate;
    private Long responseTime;
    private Integer httpStatus;
    private String responseClassification;
    private String sslStatus;
    private Integer securityHeadersFound;
    private Integer securityHeadersTotal;
    private Integer totalLinks;
    private Integer brokenLinks;

    public ScanSummaryDto() {
    }

    public ScanSummaryDto(Long id, String url, LocalDateTime scanDate, Long responseTime,
                          Integer httpStatus, String responseClassification, String sslStatus,
                          Integer securityHeadersFound, Integer securityHeadersTotal,
                          Integer totalLinks, Integer brokenLinks) {
        this.id = id;
        this.url = url;
        this.scanDate = scanDate;
        this.responseTime = responseTime;
        this.httpStatus = httpStatus;
        this.responseClassification = responseClassification;
        this.sslStatus = sslStatus;
        this.securityHeadersFound = securityHeadersFound;
        this.securityHeadersTotal = securityHeadersTotal;
        this.totalLinks = totalLinks;
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

    public LocalDateTime getScanDate() {
        return scanDate;
    }

    public void setScanDate(LocalDateTime scanDate) {
        this.scanDate = scanDate;
    }

    public Long getResponseTime() {
        return responseTime;
    }

    public void setResponseTime(Long responseTime) {
        this.responseTime = responseTime;
    }

    public Integer getHttpStatus() {
        return httpStatus;
    }

    public void setHttpStatus(Integer httpStatus) {
        this.httpStatus = httpStatus;
    }

    public String getResponseClassification() {
        return responseClassification;
    }

    public void setResponseClassification(String responseClassification) {
        this.responseClassification = responseClassification;
    }

    public String getSslStatus() {
        return sslStatus;
    }

    public void setSslStatus(String sslStatus) {
        this.sslStatus = sslStatus;
    }

    public Integer getSecurityHeadersFound() {
        return securityHeadersFound;
    }

    public void setSecurityHeadersFound(Integer securityHeadersFound) {
        this.securityHeadersFound = securityHeadersFound;
    }

    public Integer getSecurityHeadersTotal() {
        return securityHeadersTotal;
    }

    public void setSecurityHeadersTotal(Integer securityHeadersTotal) {
        this.securityHeadersTotal = securityHeadersTotal;
    }

    public Integer getTotalLinks() {
        return totalLinks;
    }

    public void setTotalLinks(Integer totalLinks) {
        this.totalLinks = totalLinks;
    }

    public Integer getBrokenLinks() {
        return brokenLinks;
    }

    public void setBrokenLinks(Integer brokenLinks) {
        this.brokenLinks = brokenLinks;
    }
}
