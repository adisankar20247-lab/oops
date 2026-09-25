package com.example.scanner.service;

import com.example.scanner.dto.SecurityHeaderItem;
import com.example.scanner.dto.SecurityHeaderResult;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpHeaders;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SecurityHeaderScanner implements Scanner<SecurityHeaderResult> {

    private final SafeHttpHelper httpHelper;
    private final Map<String, String> headerDescriptions = new LinkedHashMap<>();

    public SecurityHeaderScanner(SafeHttpHelper httpHelper) {
        this.httpHelper = httpHelper;
        initializeDescriptions();
    }

    private void initializeDescriptions() {
        headerDescriptions.put("Strict-Transport-Security",
                "Enforces HTTPS connections and prevents SSL-stripping man-in-the-middle attacks.");
        headerDescriptions.put("Content-Security-Policy",
                "Restricts approved sources of scripts and resources to mitigate XSS and injection attacks.");
        headerDescriptions.put("X-Frame-Options",
                "Protects users against clickjacking by controlling whether the site can be embedded in an iframe.");
        headerDescriptions.put("X-Content-Type-Options",
                "Instructs browsers not to MIME-sniff content away from the declared Content-Type header.");
        headerDescriptions.put("Referrer-Policy",
                "Governs how much referrer information is transmitted with outbound requests.");
        headerDescriptions.put("Permissions-Policy",
                "Enables or disables browser features and hardware APIs (camera, microphone, geolocation).");
        headerDescriptions.put("Cross-Origin-Opener-Policy",
                "Isolates browsing context to protect against cross-origin leaks and side-channel attacks.");
        headerDescriptions.put("Cross-Origin-Resource-Policy",
                "Blocks cross-origin reads of sensitive static and dynamic assets.");
    }

    @Override
    public SecurityHeaderResult scan(URI uri) {
        List<SecurityHeaderItem> items = new ArrayList<>();
        int foundCount = 0;

        try {
            SafeHttpHelper.SafeHttpResponse response = httpHelper.executeSafeGet(uri);
            HttpHeaders headers = response.getHeaders();

            for (Map.Entry<String, String> entry : headerDescriptions.entrySet()) {
                String headerName = entry.getKey();
                String desc = entry.getValue();

                Optional<String> headerValue = headers.firstValue(headerName);
                boolean present = headerValue.isPresent() && !headerValue.get().trim().isEmpty();

                if (present) {
                    foundCount++;
                    items.add(new SecurityHeaderItem(headerName, true, headerValue.get(), desc));
                } else {
                    items.add(new SecurityHeaderItem(headerName, false, null, desc));
                }
            }

            int total = headerDescriptions.size();
            String summary = foundCount + " / " + total + " Present";
            return new SecurityHeaderResult(foundCount, total, items, summary);
        } catch (Exception e) {
            // Target unavailable or connection failure
            for (Map.Entry<String, String> entry : headerDescriptions.entrySet()) {
                items.add(new SecurityHeaderItem(entry.getKey(), false, null, entry.getValue()));
            }
            return new SecurityHeaderResult(0, headerDescriptions.size(), items, "Scan failed: " + e.getMessage());
        }
    }
}
