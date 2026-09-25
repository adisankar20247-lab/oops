package com.example.scanner.security;

import org.springframework.stereotype.Component;

import java.net.Inet4Address;
import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.util.Locale;

@Component
public class UrlValidator {

    public URI validateAndNormalize(String rawUrl) {
        if (rawUrl == null || rawUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("URL cannot be empty.");
        }

        String trimmed = rawUrl.trim();
        // If scheme is missing, default to https:// for user convenience
        if (!trimmed.toLowerCase(Locale.ROOT).startsWith("http://") && !trimmed.toLowerCase(Locale.ROOT).startsWith("https://")) {
            if (trimmed.contains("://")) {
                throw new IllegalArgumentException("Unsupported protocol. Only http:// and https:// are permitted.");
            }
            trimmed = "https://" + trimmed;
        }

        URI uri;
        try {
            uri = new URI(trimmed);
        } catch (URISyntaxException e) {
            throw new IllegalArgumentException("Malformed URL syntax: " + e.getMessage());
        }

        String scheme = uri.getScheme();
        if (scheme == null || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))) {
            throw new IllegalArgumentException("Unsupported protocol '" + scheme + "'. Only http:// and https:// are permitted.");
        }

        String host = uri.getHost();
        if (host == null || host.trim().isEmpty()) {
            throw new IllegalArgumentException("URL host is missing or invalid.");
        }

        validateHostSecurity(host);

        return uri;
    }

    public void validateHostSecurity(String host) {
        String lowerHost = host.toLowerCase(Locale.ROOT).trim();

        // 1. Literal hostname checks
        if (lowerHost.equals("localhost") || lowerHost.endsWith(".localhost") ||
            lowerHost.endsWith(".local") || lowerHost.endsWith(".internal") ||
            lowerHost.endsWith(".lan") || lowerHost.endsWith(".home.arpa") ||
            lowerHost.equals("127.0.0.1") || lowerHost.equals("0.0.0.0") ||
            lowerHost.equals("::1") || lowerHost.equals("[::1]")) {
            throw new SecurityException("Access to localhost, loopback, and internal hostnames is prohibited.");
        }

        // 2. DNS resolution and IP range validation
        InetAddress[] addresses;
        try {
            addresses = InetAddress.getAllByName(lowerHost);
        } catch (UnknownHostException e) {
            throw new IllegalArgumentException("Unable to resolve host: '" + lowerHost + "'. DNS lookup failed.");
        }

        if (addresses == null || addresses.length == 0) {
            throw new IllegalArgumentException("Unable to resolve host: '" + lowerHost + "'.");
        }

        for (InetAddress address : addresses) {
            if (isPrivateOrLocalAddress(address)) {
                throw new SecurityException("Target resolves to a private or restricted IP address (" +
                        address.getHostAddress() + "). Access is blocked for SSRF protection.");
            }
        }
    }

    public boolean isSafeUri(URI uri) {
        if (uri == null) return false;
        String scheme = uri.getScheme();
        if (scheme == null || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))) {
            return false;
        }
        String host = uri.getHost();
        if (host == null || host.trim().isEmpty()) {
            return false;
        }
        try {
            validateHostSecurity(host);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isPrivateOrLocalAddress(InetAddress address) {
        if (address.isLoopbackAddress() || address.isAnyLocalAddress() ||
            address.isLinkLocalAddress() || address.isSiteLocalAddress() ||
            address.isMulticastAddress()) {
            return true;
        }

        byte[] bytes = address.getAddress();

        if (address instanceof Inet4Address) {
            int b0 = bytes[0] & 0xFF;
            int b1 = bytes[1] & 0xFF;

            // 0.0.0.0/8
            if (b0 == 0) return true;
            // 10.0.0.0/8 (Site local, redundant check for safety)
            if (b0 == 10) return true;
            // 127.0.0.0/8 (Loopback)
            if (b0 == 127) return true;
            // 169.254.0.0/16 (Link local / Cloud metadata 169.254.169.254)
            if (b0 == 169 && b1 == 254) return true;
            // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
            if (b0 == 172 && (b1 >= 16 && b1 <= 31)) return true;
            // 192.168.0.0/16
            if (b0 == 192 && b1 == 168) return true;
            // 100.64.0.0/10 (Carrier-grade NAT)
            if (b0 == 100 && (b1 >= 64 && b1 <= 127)) return true;
            // 192.0.2.0/24 (TEST-NET-1)
            if (b0 == 192 && b1 == 0 && (bytes[2] & 0xFF) == 2) return true;
            // 198.18.0.0/15 (Network benchmark tests)
            if (b0 == 198 && ((b1 & 0xFE) == 18)) return true;
            // 198.51.100.0/24 (TEST-NET-2)
            if (b0 == 198 && b1 == 51 && (bytes[2] & 0xFF) == 100) return true;
            // 203.0.113.0/24 (TEST-NET-3)
            if (b0 == 203 && b1 == 0 && (bytes[2] & 0xFF) == 113) return true;
            // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
            if (b0 >= 224) return true;
        } else if (address instanceof Inet6Address) {
            // Check for IPv4-mapped IPv6 address (::ffff:w.x.y.z)
            if (isIPv4MappedIPv6(bytes)) {
                try {
                    byte[] ipv4Bytes = new byte[4];
                    System.arraycopy(bytes, 12, ipv4Bytes, 0, 4);
                    InetAddress ipv4 = InetAddress.getByAddress(ipv4Bytes);
                    return isPrivateOrLocalAddress(ipv4);
                } catch (UnknownHostException e) {
                    return true;
                }
            }

            // fc00::/7 (Unique Local Address)
            int firstByte = bytes[0] & 0xFF;
            if ((firstByte & 0xFE) == 0xFC) return true;
            // fe80::/10 (Link-Local)
            if (firstByte == 0xFE && ((bytes[1] & 0xC0) == 0x80)) return true;
        }

        return false;
    }

    private boolean isIPv4MappedIPv6(byte[] bytes) {
        if (bytes.length != 16) return false;
        for (int i = 0; i < 10; i++) {
            if (bytes[i] != 0) return false;
        }
        return (bytes[10] & 0xFF) == 0xFF && (bytes[11] & 0xFF) == 0xFF;
    }
}
