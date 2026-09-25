package com.example.scanner.service;

import com.example.scanner.security.UrlValidator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Component
public class SafeHttpHelper {

    private final UrlValidator urlValidator;
    private final HttpClient httpClient;
    private final int maxRedirects;
    private final int maxResponseSizeBytes;
    private final Duration timeoutDuration;
    private final String userAgent;

    public SafeHttpHelper(
            UrlValidator urlValidator,
            @Value("${scanner.connection-timeout-ms:8000}") int connectionTimeoutMs,
            @Value("${scanner.max-redirects:5}") int maxRedirects,
            @Value("${scanner.max-response-size-bytes:2097152}") int maxResponseSizeBytes,
            @Value("${scanner.user-agent:Mozilla/5.0 (compatible; SecurityScannerBot/1.0)}") String userAgent) {
        this.urlValidator = urlValidator;
        this.maxRedirects = maxRedirects;
        this.maxResponseSizeBytes = maxResponseSizeBytes;
        this.timeoutDuration = Duration.ofMillis(connectionTimeoutMs);
        this.userAgent = userAgent;

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(this.timeoutDuration)
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();
    }

    public static class SafeHttpResponse {
        private final URI finalUri;
        private final int statusCode;
        private final HttpHeaders headers;
        private final String body;
        private final long durationMs;

        public SafeHttpResponse(URI finalUri, int statusCode, HttpHeaders headers, String body, long durationMs) {
            this.finalUri = finalUri;
            this.statusCode = statusCode;
            this.headers = headers;
            this.body = body;
            this.durationMs = durationMs;
        }

        public URI getFinalUri() {
            return finalUri;
        }

        public int getStatusCode() {
            return statusCode;
        }

        public HttpHeaders getHeaders() {
            return headers;
        }

        public String getBody() {
            return body;
        }

        public long getDurationMs() {
            return durationMs;
        }
    }

    public SafeHttpResponse executeSafeGet(URI initialUri) throws Exception {
        URI currentUri = initialUri;
        int redirectCount = 0;
        long totalStart = System.nanoTime();

        while (true) {
            urlValidator.validateHostSecurity(currentUri.getHost());

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(currentUri)
                    .timeout(timeoutDuration)
                    .header("User-Agent", userAgent)
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                    .header("Accept-Language", "en-US,en;q=0.5")
                    .GET()
                    .build();

            long stepStart = System.nanoTime();
            HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
            long stepEnd = System.nanoTime();

            int status = response.statusCode();

            // Check if redirect
            if (status >= 300 && status < 400 && response.headers().firstValue("Location").isPresent()) {
                redirectCount++;
                if (redirectCount > maxRedirects) {
                    throw new IllegalStateException("Maximum redirect limit (" + maxRedirects + ") exceeded.");
                }

                String location = response.headers().firstValue("Location").get();
                URI nextUri = currentUri.resolve(location);

                if (!nextUri.getScheme().equalsIgnoreCase("http") && !nextUri.getScheme().equalsIgnoreCase("https")) {
                    throw new SecurityException("Unsupported redirect protocol: " + nextUri.getScheme());
                }

                urlValidator.validateHostSecurity(nextUri.getHost());
                currentUri = nextUri;
                continue;
            }

            // Read bounded response body
            String bodyContent = "";
            try (InputStream in = response.body();
                 ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                int totalBytes = 0;
                while ((bytesRead = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                    totalBytes += bytesRead;
                    if (totalBytes > maxResponseSizeBytes) {
                        break; // Stop reading beyond max allowed size for safety
                    }
                }
                bodyContent = out.toString(StandardCharsets.UTF_8);
            }

            long totalElapsedMs = (System.nanoTime() - totalStart) / 1_000_000;
            return new SafeHttpResponse(currentUri, status, response.headers(), bodyContent, totalElapsedMs);
        }
    }

    public int probeLink(URI linkUri) {
        try {
            if (!urlValidator.isSafeUri(linkUri)) {
                return 400; // Block unsafe/private host
            }

            // Send HEAD or lightweight GET
            HttpRequest headReq = HttpRequest.newBuilder()
                    .uri(linkUri)
                    .timeout(Duration.ofSeconds(5))
                    .header("User-Agent", userAgent)
                    .method("HEAD", HttpRequest.BodyPublishers.noBody())
                    .build();

            HttpResponse<Void> resp = httpClient.send(headReq, HttpResponse.BodyHandlers.discarding());
            int code = resp.statusCode();

            // Some servers return 405 Method Not Allowed or 403 to HEAD requests, try quick GET if so
            if (code == 405 || code == 403) {
                HttpRequest getReq = HttpRequest.newBuilder()
                        .uri(linkUri)
                        .timeout(Duration.ofSeconds(5))
                        .header("User-Agent", userAgent)
                        .GET()
                        .build();
                HttpResponse<Void> getResp = httpClient.send(getReq, HttpResponse.BodyHandlers.discarding());
                code = getResp.statusCode();
            }

            return code;
        } catch (Exception e) {
            return 0; // Unreachable / connection failure
        }
    }
}
