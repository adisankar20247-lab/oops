package com.example.scanner.service;

import com.example.scanner.dto.BrokenLinkItem;
import com.example.scanner.dto.BrokenLinkResult;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.*;
import java.util.concurrent.*;

@Service
public class BrokenLinkScanner implements Scanner<BrokenLinkResult> {

    private final SafeHttpHelper httpHelper;
    private final int maxLinksToScan;

    public BrokenLinkScanner(
            SafeHttpHelper httpHelper,
            @Value("${scanner.max-links-to-scan:50}") int maxLinksToScan) {
        this.httpHelper = httpHelper;
        this.maxLinksToScan = maxLinksToScan;
    }

    @Override
    public BrokenLinkResult scan(URI uri) {
        BrokenLinkResult result = new BrokenLinkResult();

        try {
            SafeHttpHelper.SafeHttpResponse response = httpHelper.executeSafeGet(uri);
            String html = response.getBody();

            if (html == null || html.trim().isEmpty()) {
                result.setNotice("Target returned empty or non-HTML content; no links discovered.");
                return result;
            }

            Document doc = Jsoup.parse(html, uri.toString());
            Elements anchorElements = doc.select("a[href]");

            Set<String> discoveredUrls = new LinkedHashSet<>();
            for (Element anchor : anchorElements) {
                String absHref = anchor.attr("abs:href").trim();
                if (isValidWebLink(absHref)) {
                    discoveredUrls.add(absHref);
                    if (discoveredUrls.size() >= maxLinksToScan) {
                        break;
                    }
                }
            }

            if (discoveredUrls.isEmpty()) {
                result.setTotalLinks(0);
                result.setWorkingLinks(0);
                result.setBrokenLinks(0);
                result.setNotice("No hyperlinked anchors found on this page.");
                return result;
            }

            List<BrokenLinkItem> items = probeDiscoveredLinks(discoveredUrls);

            int working = 0;
            int broken = 0;
            for (BrokenLinkItem item : items) {
                if ("Working".equalsIgnoreCase(item.getStatus())) {
                    working++;
                } else {
                    broken++;
                }
            }

            result.setTotalLinks(items.size());
            result.setWorkingLinks(working);
            result.setBrokenLinks(broken);
            result.setLinks(items);
            result.setNotice(String.format(
                    "Checked %d links discovered on the supplied page (capped at safety limit of %d). This is not an infinite recursive site crawl.",
                    items.size(), maxLinksToScan
            ));

            return result;
        } catch (Exception e) {
            result.setNotice("Link extraction failed: " + e.getMessage());
            return result;
        }
    }

    private boolean isValidWebLink(String url) {
        if (url == null || url.isEmpty()) return false;
        String lower = url.toLowerCase(Locale.ROOT);
        return (lower.startsWith("http://") || lower.startsWith("https://")) &&
                !lower.startsWith("mailto:") &&
                !lower.startsWith("javascript:") &&
                !lower.startsWith("tel:");
    }

    private List<BrokenLinkItem> probeDiscoveredLinks(Set<String> urls) {
        List<BrokenLinkItem> results = Collections.synchronizedList(new ArrayList<>());
        ExecutorService executor = Executors.newFixedThreadPool(Math.min(urls.size(), 10));

        try {
            List<CompletableFuture<Void>> futures = new ArrayList<>();
            for (String targetUrl : urls) {
                futures.add(CompletableFuture.runAsync(() -> {
                    try {
                        URI linkUri = new URI(targetUrl);
                        int statusCode = httpHelper.probeLink(linkUri);
                        String status;
                        if (statusCode >= 200 && statusCode < 400) {
                            status = "Working";
                        } else if (statusCode == 0) {
                            status = "Unreachable";
                        } else {
                            status = "Broken";
                        }
                        results.add(new BrokenLinkItem(targetUrl, statusCode > 0 ? statusCode : null, status));
                    } catch (Exception e) {
                        results.add(new BrokenLinkItem(targetUrl, null, "Broken"));
                    }
                }, executor));
            }

            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                    .get(30, TimeUnit.SECONDS);
        } catch (Exception e) {
            // Partial results retained on timeout
        } finally {
            executor.shutdownNow();
        }

        // Sort items: Broken/Unreachable first, then Working
        results.sort((a, b) -> {
            boolean aBroken = !"Working".equalsIgnoreCase(a.getStatus());
            boolean bBroken = !"Working".equalsIgnoreCase(b.getStatus());
            if (aBroken != bBroken) {
                return aBroken ? -1 : 1;
            }
            return a.getUrl().compareToIgnoreCase(b.getUrl());
        });

        return results;
    }
}
