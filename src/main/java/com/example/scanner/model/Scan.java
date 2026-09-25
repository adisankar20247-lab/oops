package com.example.scanner.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "scans")
public class Scan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2048)
    private String url;

    @Column(name = "final_url", length = 2048)
    private String finalUrl;

    @Column(name = "scan_date", nullable = false)
    private LocalDateTime scanDate;

    @Column(name = "response_time")
    private Long responseTime;

    @Column(name = "http_status")
    private Integer httpStatus;

    @Column(name = "response_classification", length = 32)
    private String responseClassification;

    @Column(name = "ssl_status", length = 64)
    private String sslStatus;

    @Column(name = "ssl_issuer", length = 255)
    private String sslIssuer;

    @Column(name = "ssl_valid_from", length = 64)
    private String sslValidFrom;

    @Column(name = "ssl_valid_until", length = 64)
    private String sslValidUntil;

    @Column(name = "ssl_days_remaining")
    private Long sslDaysRemaining;

    @Column(name = "ssl_hostname_match")
    private Boolean sslHostnameMatch;

    @Column(name = "security_headers_found")
    private Integer securityHeadersFound = 0;

    @Column(name = "security_headers_total")
    private Integer securityHeadersTotal = 0;

    @Column(name = "total_links")
    private Integer totalLinks = 0;

    @Column(name = "working_links")
    private Integer workingLinks = 0;

    @Column(name = "broken_links")
    private Integer brokenLinks = 0;

    @OneToMany(mappedBy = "scan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SecurityHeader> securityHeaders = new ArrayList<>();

    @OneToMany(mappedBy = "scan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<BrokenLink> brokenLinkList = new ArrayList<>();

    public Scan() {
    }

    public void addSecurityHeader(SecurityHeader header) {
        securityHeaders.add(header);
        header.setScan(this);
    }

    public void addBrokenLink(BrokenLink link) {
        brokenLinkList.add(link);
        link.setScan(this);
    }

    // Getters and Setters
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

    public String getSslIssuer() {
        return sslIssuer;
    }

    public void setSslIssuer(String sslIssuer) {
        this.sslIssuer = sslIssuer;
    }

    public String getSslValidFrom() {
        return sslValidFrom;
    }

    public void setSslValidFrom(String sslValidFrom) {
        this.sslValidFrom = sslValidFrom;
    }

    public String getSslValidUntil() {
        return sslValidUntil;
    }

    public void setSslValidUntil(String sslValidUntil) {
        this.sslValidUntil = sslValidUntil;
    }

    public Long getSslDaysRemaining() {
        return sslDaysRemaining;
    }

    public void setSslDaysRemaining(Long sslDaysRemaining) {
        this.sslDaysRemaining = sslDaysRemaining;
    }

    public Boolean getSslHostnameMatch() {
        return sslHostnameMatch;
    }

    public void setSslHostnameMatch(Boolean sslHostnameMatch) {
        this.sslHostnameMatch = sslHostnameMatch;
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

    public Integer getWorkingLinks() {
        return workingLinks;
    }

    public void setWorkingLinks(Integer workingLinks) {
        this.workingLinks = workingLinks;
    }

    public Integer getBrokenLinks() {
        return brokenLinks;
    }

    public void setBrokenLinks(Integer brokenLinks) {
        this.brokenLinks = brokenLinks;
    }

    public List<SecurityHeader> getSecurityHeaders() {
        return securityHeaders;
    }

    public void setSecurityHeaders(List<SecurityHeader> securityHeaders) {
        this.securityHeaders = securityHeaders;
    }

    public List<BrokenLink> getBrokenLinkList() {
        return brokenLinkList;
    }

    public void setBrokenLinkList(List<BrokenLink> brokenLinkList) {
        this.brokenLinkList = brokenLinkList;
    }
}
