package com.example.scanner.service;

import com.example.scanner.dto.ResponseTimeResult;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.time.LocalDateTime;

@Service
public class ResponseTimeScanner implements Scanner<ResponseTimeResult> {

    private final SafeHttpHelper httpHelper;

    public ResponseTimeScanner(SafeHttpHelper httpHelper) {
        this.httpHelper = httpHelper;
    }

    @Override
    public ResponseTimeResult scan(URI uri) {
        try {
            SafeHttpHelper.SafeHttpResponse response = httpHelper.executeSafeGet(uri);
            long responseTimeMs = response.getDurationMs();
            int statusCode = response.getStatusCode();

            String statusText;
            try {
                HttpStatus status = HttpStatus.valueOf(statusCode);
                statusText = statusCode + " " + status.getReasonPhrase();
            } catch (Exception e) {
                statusText = String.valueOf(statusCode);
            }

            String classification = ResponseTimeResult.classify(responseTimeMs);
            String finalUrl = response.getFinalUri().toString();

            return new ResponseTimeResult(
                    responseTimeMs,
                    statusCode,
                    statusText,
                    classification,
                    finalUrl,
                    LocalDateTime.now(),
                    "Measured round-trip server response time."
            );
        } catch (Exception e) {
            return new ResponseTimeResult(
                    -1,
                    0,
                    "Error: " + e.getMessage(),
                    "Unavailable",
                    uri.toString(),
                    LocalDateTime.now(),
                    "Target server could not be reached."
            );
        }
    }
}
