package com.example.scanner.controller;

import com.example.scanner.dto.ScanRequest;
import com.example.scanner.dto.ScanResponse;
import com.example.scanner.dto.ScanSummaryDto;
import com.example.scanner.service.WebsiteScanService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ScanController {

    private final WebsiteScanService scanService;

    public ScanController(WebsiteScanService scanService) {
        this.scanService = scanService;
    }

    /**
     * POST /api/scan
     * Performs four independent scans against the target URL.
     */
    @PostMapping("/scan")
    public ResponseEntity<ScanResponse> scanWebsite(@Valid @RequestBody ScanRequest request) {
        ScanResponse response = scanService.performScan(request.getUrl());
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/scans
     * Retrieves previous scan history.
     */
    @GetMapping("/scans")
    public ResponseEntity<List<ScanSummaryDto>> getScanHistory() {
        return ResponseEntity.ok(scanService.getScanHistory());
    }

    /**
     * GET /api/scans/{id}
     * Retrieves full results of a specific historical scan.
     */
    @GetMapping("/scans/{id}")
    public ResponseEntity<ScanResponse> getScanById(@PathVariable Long id) {
        return ResponseEntity.ok(scanService.getScanById(id));
    }

    /**
     * DELETE /api/scans/{id}
     * Deletes an individual scan record and its associated details.
     */
    @DeleteMapping("/scans/{id}")
    public ResponseEntity<Void> deleteScan(@PathVariable Long id) {
        scanService.deleteScan(id);
        return ResponseEntity.noContent().build();
    }
}
