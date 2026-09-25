package com.example.scanner.service;

import com.example.scanner.dto.SSLResult;
import com.example.scanner.security.UrlValidator;
import org.springframework.stereotype.Service;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.URI;
import java.security.cert.Certificate;
import java.security.cert.CertificateExpiredException;
import java.security.cert.CertificateNotYetValidException;
import java.security.cert.X509Certificate;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

@Service
public class SSLScanner implements Scanner<SSLResult> {

    private final UrlValidator urlValidator;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
            .withZone(ZoneId.systemDefault());

    public SSLScanner(UrlValidator urlValidator) {
        this.urlValidator = urlValidator;
    }

    @Override
    public SSLResult scan(URI uri) {
        if (!"https".equalsIgnoreCase(uri.getScheme())) {
            return SSLResult.notHttps();
        }

        String host = uri.getHost();
        int port = uri.getPort() > 0 ? uri.getPort() : 443;

        try {
            urlValidator.validateHostSecurity(host);

            SSLContext sslContext = SSLContext.getDefault();
            SSLSocketFactory socketFactory = sslContext.getSocketFactory();

            try (Socket plainSocket = new Socket()) {
                plainSocket.connect(new InetSocketAddress(host, port), 6000);
                plainSocket.setSoTimeout(6000);

                try (SSLSocket sslSocket = (SSLSocket) socketFactory.createSocket(
                        plainSocket, host, port, true)) {
                    
                    try {
                        javax.net.ssl.SSLParameters params = sslSocket.getSSLParameters();
                        params.setServerNames(java.util.Collections.singletonList(new javax.net.ssl.SNIHostName(host)));
                        sslSocket.setSSLParameters(params);
                    } catch (Exception ignored) {
                    }

                    sslSocket.startHandshake();

                    Certificate[] certs = sslSocket.getSession().getPeerCertificates();
                    if (certs == null || certs.length == 0 || !(certs[0] instanceof X509Certificate)) {
                        return SSLResult.error("No X.509 certificate presented by server.", host);
                    }

                    X509Certificate x509 = (X509Certificate) certs[0];

                    SSLResult result = new SSLResult();
                    result.setHttpsUsed(true);
                    result.setTargetHostname(host);
                    result.setSignatureAlgorithm(x509.getSigAlgName());

                    // Issuer & Subject extraction
                    result.setIssuer(extractCommonNameOrOrg(x509.getIssuerX500Principal().getName()));
                    result.setSubject(extractCommonNameOrOrg(x509.getSubjectX500Principal().getName()));

                    // Dates
                    Instant notBefore = x509.getNotBefore().toInstant();
                    Instant notAfter = x509.getNotAfter().toInstant();
                    Instant now = Instant.now();

                    result.setValidFrom(DATE_FORMATTER.format(notBefore));
                    result.setValidUntil(DATE_FORMATTER.format(notAfter));

                    long daysRemaining = ChronoUnit.DAYS.between(now, notAfter);
                    result.setDaysRemaining(daysRemaining);

                    // Hostname match verification using SANs and CN
                    boolean match = verifyHostnameMatch(host, x509);
                    result.setHostnameMatch(match);

                    // Check validity
                    try {
                        x509.checkValidity();
                        if (match && daysRemaining >= 0) {
                            result.setValid(true);
                            result.setStatus("Valid");
                        } else if (!match) {
                            result.setValid(false);
                            result.setStatus("Hostname Mismatch");
                        } else {
                            result.setValid(false);
                            result.setStatus("Expired");
                        }
                    } catch (CertificateExpiredException e) {
                        result.setValid(false);
                        result.setStatus("Expired");
                        result.setErrorMessage("Certificate expired on " + DATE_FORMATTER.format(notAfter));
                    } catch (CertificateNotYetValidException e) {
                        result.setValid(false);
                        result.setStatus("Not Yet Valid");
                        result.setErrorMessage("Certificate is not valid until " + DATE_FORMATTER.format(notBefore));
                    }

                    return result;
                }
            }
        } catch (Exception e) {
            String errorMsg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            return SSLResult.error(errorMsg, host);
        }
    }

    private boolean verifyHostnameMatch(String host, X509Certificate x509) {
        if (host == null || x509 == null) return false;
        String lowerHost = host.toLowerCase(java.util.Locale.ROOT);

        try {
            java.util.Collection<java.util.List<?>> sanList = x509.getSubjectAlternativeNames();
            if (sanList != null) {
                for (java.util.List<?> sanItem : sanList) {
                    if (sanItem.size() >= 2 && Integer.valueOf(2).equals(sanItem.get(0))) {
                        Object val = sanItem.get(1);
                        if (val instanceof String && matchHostPattern(lowerHost, ((String) val).toLowerCase(java.util.Locale.ROOT))) {
                            return true;
                        }
                    }
                }
            }
        } catch (Exception ignored) {
        }

        String cn = extractCnOnly(x509.getSubjectX500Principal().getName());
        return cn != null && matchHostPattern(lowerHost, cn.toLowerCase(java.util.Locale.ROOT));
    }

    private boolean matchHostPattern(String host, String pattern) {
        if (pattern.startsWith("*.")) {
            String domain = pattern.substring(2);
            return host.equals(domain) || host.endsWith("." + domain);
        }
        return host.equalsIgnoreCase(pattern);
    }

    private String extractCnOnly(String principalName) {
        if (principalName == null) return null;
        String[] parts = principalName.split(",");
        for (String part : parts) {
            String trimmed = part.trim();
            if (trimmed.startsWith("CN=")) {
                return trimmed.substring(3);
            }
        }
        return null;
    }

    private String extractCommonNameOrOrg(String principalName) {
        if (principalName == null) return "Unknown";
        String[] parts = principalName.split(",");
        String cn = null;
        String o = null;
        for (String part : parts) {
            String trimmed = part.trim();
            if (trimmed.startsWith("CN=")) {
                cn = trimmed.substring(3);
            } else if (trimmed.startsWith("O=")) {
                o = trimmed.substring(2);
            }
        }
        if (o != null && !o.isEmpty()) {
            return cn != null ? cn + " (" + o + ")" : o;
        }
        return cn != null ? cn : principalName;
    }
}
