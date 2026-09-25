package com.example.scanner.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "security_headers")
public class SecurityHeader {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scan_id", nullable = false)
    @JsonIgnore
    private Scan scan;

    @Column(name = "header_name", nullable = false, length = 128)
    private String headerName;

    @Column(nullable = false)
    private boolean present;

    @Column(name = "header_value", columnDefinition = "TEXT")
    private String headerValue;

    @Column(length = 512)
    private String description;

    public SecurityHeader() {
    }

    public SecurityHeader(String headerName, boolean present, String headerValue, String description) {
        this.headerName = headerName;
        this.present = present;
        this.headerValue = headerValue;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Scan getScan() {
        return scan;
    }

    public void setScan(Scan scan) {
        this.scan = scan;
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
