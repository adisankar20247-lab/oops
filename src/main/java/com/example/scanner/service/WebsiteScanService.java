package com.example.scanner.service;

import com.example.scanner.dto.*;
import com.example.scanner.model.BrokenLink;
import com.example.scanner.model.Scan;
import com.example.scanner.model.SecurityHeader;
import com.example.scanner.repository.BrokenLinkRepository;
import com.example.scanner.repository.ScanRepository;
import com.example.scanner.repository.SecurityHeaderRepository;
import com.example.scanner.security.UrlValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WebsiteScanService {

    private static final Logger log = LoggerFactory.getLogger(WebsiteScanService.class);

    private final UrlValidator urlValidator;
    private final ResponseTimeScanner responseTimeScanner;
    private final SecurityHeaderScanner securityHeaderScanner;
    private final SSLScanner sslScanner;
    private final BrokenLinkScanner brokenLinkScanner;
    private final ScanRepository scanRepository;
    private final SecurityHeaderRepository securityHeaderRepository;
    private final BrokenLinkRepository brokenLinkRepository;

    public WebsiteScanService(
            UrlValidator urlValidator,
            ResponseTimeScanner responseTimeScanner,
            SecurityHeaderScanner securityHeaderScanner,
            SSLScanner sslScanner,
            BrokenLinkScanner brokenLinkScanner,
            ScanRepository scanRepository,
            SecurityHeaderRepository securityHeaderRepository,
            BrokenLinkRepository brokenLinkRepository) {
        this.urlValidator = urlValidator;
        this.responseTimeScanner = responseTimeScanner;
        this.securityHeaderScanner = securityHeaderScanner;
        this.sslScanner = sslScanner;
        this.brokenLinkScanner = brokenLinkScanner;
        this.scanRepository = scanRepository;
        this.securityHeaderRepository = securityHeaderRepository;
        this.brokenLinkRepository = brokenLinkRepository;
    }

    @Transactional
    public ScanResponse performScan(String rawUrl) {
        // Step 1: Server-side validation and normalization
        URI targetUri = urlValidator.validateAndNormalize(rawUrl);
        String normalizedUrl = targetUri.toString();

        log.info("Starting website scan for: {}", normalizedUrl);

        // Step 2: Execute four independent scanners
        ResponseTimeResult responseTimeResult = responseTimeScanner.scan(targetUri);
        SecurityHeaderResult securityHeaderResult = securityHeaderScanner.scan(targetUri);
        SSLResult sslResult = sslScanner.scan(targetUri);
        BrokenLinkResult brokenLinkResult = brokenLinkScanner.scan(targetUri);

        LocalDateTime now = LocalDateTime.now();

        // Step 3: Persist results to Database
        Scan scan = new Scan();
        scan.setUrl(normalizedUrl);
        scan.setFinalUrl(responseTimeResult.getFinalUrl());
        scan.setScanDate(now);
        scan.setResponseTime(responseTimeResult.getResponseTimeMs());
        scan.setHttpStatus(responseTimeResult.getHttpStatusCode());
        scan.setResponseClassification(responseTimeResult.getClassification());

        scan.setSslStatus(sslResult.getStatus());
        scan.setSslIssuer(sslResult.getIssuer());
        scan.setSslValidFrom(sslResult.getValidFrom());
        scan.setSslValidUntil(sslResult.getValidUntil());
        scan.setSslDaysRemaining(sslResult.getDaysRemaining());
        scan.setSslHostnameMatch(sslResult.getHostnameMatch());

        scan.setSecurityHeadersFound(securityHeaderResult.getFoundCount());
        scan.setSecurityHeadersTotal(securityHeaderResult.getTotalCount());

        scan.setTotalLinks(brokenLinkResult.getTotalLinks());
        scan.setWorkingLinks(brokenLinkResult.getWorkingLinks());
        scan.setBrokenLinks(brokenLinkResult.getBrokenLinks());

        // Associate details
        for (SecurityHeaderItem item : securityHeaderResult.getHeaders()) {
            SecurityHeader sh = new SecurityHeader(
                    item.getHeaderName(),
                    item.isPresent(),
                    item.getHeaderValue(),
                    item.getDescription()
            );
            scan.addSecurityHeader(sh);
        }

        for (BrokenLinkItem linkItem : brokenLinkResult.getLinks()) {
            BrokenLink bl = new BrokenLink(
                    linkItem.getUrl(),
                    linkItem.getStatusCode(),
                    linkItem.getStatus()
            );
            scan.addBrokenLink(bl);
        }

        Scan savedScan = scanRepository.save(scan);
        log.info("Scan completed and stored with ID: {}", savedScan.getId());

        // Step 4: Return DTO
        return new ScanResponse(
                savedScan.getId(),
                normalizedUrl,
                responseTimeResult.getFinalUrl(),
                now,
                responseTimeResult,
                securityHeaderResult,
                sslResult,
                brokenLinkResult
        );
    }

    @Transactional(readOnly = true)
    public List<ScanSummaryDto> getScanHistory() {
        return scanRepository.findAllByOrderByScanDateDesc().stream()
                .map(s -> new ScanSummaryDto(
                        s.getId(),
                        s.getUrl(),
                        s.getScanDate(),
                        s.getResponseTime(),
                        s.getHttpStatus(),
                        s.getResponseClassification(),
                        s.getSslStatus(),
                        s.getSecurityHeadersFound(),
                        s.getSecurityHeadersTotal(),
                        s.getTotalLinks(),
                        s.getBrokenLinks()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ScanResponse getScanById(Long id) {
        Scan scan = scanRepository.findWithDetailsById(id)
                .orElseThrow(() -> new IllegalArgumentException("Scan with ID " + id + " not found."));

        // Build ResponseTimeResult
        ResponseTimeResult rtr = new ResponseTimeResult(
                scan.getResponseTime() != null ? scan.getResponseTime() : -1,
                scan.getHttpStatus() != null ? scan.getHttpStatus() : 0,
                scan.getHttpStatus() != null ? String.valueOf(scan.getHttpStatus()) : "N/A",
                scan.getResponseClassification(),
                scan.getFinalUrl(),
                scan.getScanDate(),
                "Loaded from scan history."
        );

        // Build SecurityHeaderResult
        List<SecurityHeaderItem> headerItems = scan.getSecurityHeaders().stream()
                .map(sh -> new SecurityHeaderItem(sh.getHeaderName(), sh.isPresent(), sh.getHeaderValue(), sh.getDescription()))
                .collect(Collectors.toList());
        SecurityHeaderResult shr = new SecurityHeaderResult(
                scan.getSecurityHeadersFound() != null ? scan.getSecurityHeadersFound() : 0,
                scan.getSecurityHeadersTotal() != null ? scan.getSecurityHeadersTotal() : headerItems.size(),
                headerItems,
                scan.getSecurityHeadersFound() + " / " + scan.getSecurityHeadersTotal() + " Present"
        );

        // Build SSLResult
        SSLResult sslr = new SSLResult();
        sslr.setStatus(scan.getSslStatus());
        sslr.setIssuer(scan.getSslIssuer());
        sslr.setValidFrom(scan.getSslValidFrom());
        sslr.setValidUntil(scan.getSslValidUntil());
        sslr.setDaysRemaining(scan.getSslDaysRemaining());
        sslr.setHostnameMatch(scan.getSslHostnameMatch());
        sslr.setValid("Valid".equalsIgnoreCase(scan.getSslStatus()));
        sslr.setHttpsUsed(!"HTTPS is not being used.".equalsIgnoreCase(scan.getSslStatus()));

        // Build BrokenLinkResult
        List<BrokenLinkItem> linkItems = scan.getBrokenLinkList().stream()
                .map(bl -> new BrokenLinkItem(bl.getUrl(), bl.getStatusCode(), bl.getStatus()))
                .collect(Collectors.toList());
        BrokenLinkResult blr = new BrokenLinkResult(
                scan.getTotalLinks() != null ? scan.getTotalLinks() : 0,
                scan.getWorkingLinks() != null ? scan.getWorkingLinks() : 0,
                scan.getBrokenLinks() != null ? scan.getBrokenLinks() : 0,
                linkItems,
                "Loaded from scan history."
        );

        return new ScanResponse(
                scan.getId(),
                scan.getUrl(),
                scan.getFinalUrl(),
                scan.getScanDate(),
                rtr,
                shr,
                sslr,
                blr
        );
    }

    @Transactional
    public void deleteScan(Long id) {
        if (!scanRepository.existsById(id)) {
            throw new IllegalArgumentException("Scan with ID " + id + " does not exist.");
        }
        scanRepository.deleteById(id);
        log.info("Deleted scan record ID: {}", id);
    }
}
