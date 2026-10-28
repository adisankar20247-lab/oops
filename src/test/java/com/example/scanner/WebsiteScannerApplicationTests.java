package com.example.scanner;

import com.example.scanner.dto.*;
import com.example.scanner.security.UrlValidator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.net.URI;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class WebsiteScannerApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UrlValidator urlValidator;

    @Test
    @DisplayName("Context loads successfully")
    void contextLoads() {
        assertNotNull(mockMvc);
        assertNotNull(urlValidator);
    }

    @Test
    @DisplayName("UrlValidator permits public domains and blocks private IP / loopback")
    void testUrlValidator() {
        // Valid public domains
        URI validUri = urlValidator.validateAndNormalize("https://example.com");
        assertEquals("https", validUri.getScheme());
        assertEquals("example.com", validUri.getHost());

        // Protocol enforcement: file://, ftp:// rejected
        assertThrows(IllegalArgumentException.class, () -> urlValidator.validateAndNormalize("ftp://example.com"));

        // Loopback / SSRF blocked with SecurityException
        assertThrows(SecurityException.class, () -> urlValidator.validateAndNormalize("http://127.0.0.1"));
        assertThrows(SecurityException.class, () -> urlValidator.validateAndNormalize("http://localhost"));
    }

    @Test
    @DisplayName("ResponseTimeResult latency classification test")
    void testResponseTimeClassification() {
        assertEquals("Fast", ResponseTimeResult.classify(120));
        assertEquals("Moderate", ResponseTimeResult.classify(350));
        assertEquals("Slow", ResponseTimeResult.classify(750));
        assertEquals("Very Slow", ResponseTimeResult.classify(1500));
    }

    @Test
    @DisplayName("Scan history REST API endpoint returns 200 OK")
    void testGetScansEndpoint() throws Exception {
        mockMvc.perform(get("/api/scans"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Scan submission with invalid protocol returns 400 Bad Request")
    void testScanEndpointValidation() throws Exception {
        mockMvc.perform(post("/api/scan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"url\": \"ftp://invalid-scheme.com\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DTO construction and mapping integrity")
    void testDtoIntegrity() {
        ResponseTimeResult rt = new ResponseTimeResult(150, 200, "200 OK", "Fast", "https://example.com", null, "Note");
        assertEquals(150, rt.getResponseTimeMs());
        assertEquals("Fast", rt.getClassification());

        SecurityHeaderResult sh = new SecurityHeaderResult(6, 8, List.of(), "6 / 8");
        assertEquals(6, sh.getFoundCount());
        assertEquals(8, sh.getTotalCount());

        SSLResult ssl = new SSLResult();
        ssl.setHttpsUsed(true);
        ssl.setValid(true);
        ssl.setDaysRemaining(90L);
        assertTrue(ssl.isValid());
        assertEquals(90L, ssl.getDaysRemaining());

        BrokenLinkResult bl = new BrokenLinkResult(10, 10, 0, List.of(), "Notice");
        assertEquals(10, bl.getTotalLinks());
        assertEquals(0, bl.getBrokenLinks());

        ScanResponse resp = new ScanResponse(1L, "https://example.com", "https://example.com", null, rt, sh, ssl, bl);
        assertEquals(1L, resp.getId());
        assertEquals("https://example.com", resp.getUrl());
    }
}
