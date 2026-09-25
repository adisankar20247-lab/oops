package com.example.scanner.dto;

public class SSLResult {

    private boolean httpsUsed;
    private String status; // Valid, Expired, Not Yet Valid, Invalid / Error, HTTPS is not being used.
    private boolean valid;
    private String issuer;
    private String subject;
    private String validFrom;
    private String validUntil;
    private Long daysRemaining;
    private String targetHostname;
    private Boolean hostnameMatch;
    private String errorMessage;
    private String signatureAlgorithm;

    public SSLResult() {
    }

    public static SSLResult notHttps() {
        SSLResult result = new SSLResult();
        result.setHttpsUsed(false);
        result.setStatus("HTTPS is not being used.");
        result.setValid(false);
        return result;
    }

    public static SSLResult error(String errorMessage, String hostname) {
        SSLResult result = new SSLResult();
        result.setHttpsUsed(true);
        result.setStatus("Invalid / Error");
        result.setValid(false);
        result.setTargetHostname(hostname);
        result.setErrorMessage(errorMessage);
        return result;
    }

    public boolean isHttpsUsed() {
        return httpsUsed;
    }

    public void setHttpsUsed(boolean httpsUsed) {
        this.httpsUsed = httpsUsed;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getValidFrom() {
        return validFrom;
    }

    public void setValidFrom(String validFrom) {
        this.validFrom = validFrom;
    }

    public String getValidUntil() {
        return validUntil;
    }

    public void setValidUntil(String validUntil) {
        this.validUntil = validUntil;
    }

    public Long getDaysRemaining() {
        return daysRemaining;
    }

    public void setDaysRemaining(Long daysRemaining) {
        this.daysRemaining = daysRemaining;
    }

    public String getTargetHostname() {
        return targetHostname;
    }

    public void setTargetHostname(String targetHostname) {
        this.targetHostname = targetHostname;
    }

    public Boolean getHostnameMatch() {
        return hostnameMatch;
    }

    public void setHostnameMatch(Boolean hostnameMatch) {
        this.hostnameMatch = hostnameMatch;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getSignatureAlgorithm() {
        return signatureAlgorithm;
    }

    public void setSignatureAlgorithm(String signatureAlgorithm) {
        this.signatureAlgorithm = signatureAlgorithm;
    }
}
