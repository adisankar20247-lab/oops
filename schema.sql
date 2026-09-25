-- Database schema for Web-Based Website Scanner

CREATE DATABASE IF NOT EXISTS websitescanner CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE websitescanner;

-- 1. Scans Table
CREATE TABLE IF NOT EXISTS scans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(2048) NOT NULL,
    final_url VARCHAR(2048),
    scan_date DATETIME NOT NULL,
    response_time BIGINT,
    http_status INT,
    response_classification VARCHAR(32),
    ssl_status VARCHAR(64),
    ssl_issuer VARCHAR(255),
    ssl_valid_from VARCHAR(64),
    ssl_valid_until VARCHAR(64),
    ssl_days_remaining BIGINT,
    ssl_hostname_match BOOLEAN,
    security_headers_found INT DEFAULT 0,
    security_headers_total INT DEFAULT 0,
    total_links INT DEFAULT 0,
    working_links INT DEFAULT 0,
    broken_links INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Security Headers Table
CREATE TABLE IF NOT EXISTS security_headers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    scan_id BIGINT NOT NULL,
    header_name VARCHAR(128) NOT NULL,
    present BOOLEAN NOT NULL,
    header_value TEXT,
    description VARCHAR(512),
    CONSTRAINT fk_security_headers_scan FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Broken Links Table
CREATE TABLE IF NOT EXISTS broken_links (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    scan_id BIGINT NOT NULL,
    url VARCHAR(2048) NOT NULL,
    status_code INT,
    status VARCHAR(64) NOT NULL,
    CONSTRAINT fk_broken_links_scan FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Indexes for performance
CREATE INDEX idx_scans_date ON scans(scan_date);
CREATE INDEX idx_scans_url ON scans(url(255));
CREATE INDEX idx_headers_scan_id ON security_headers(scan_id);
CREATE INDEX idx_broken_links_scan_id ON broken_links(scan_id);
