package com.example.scanner.dto;

import java.util.ArrayList;
import java.util.List;

public class BrokenLinkResult {

    private int totalLinks;
    private int workingLinks;
    private int brokenLinks;
    private List<BrokenLinkItem> links = new ArrayList<>();
    private String notice;

    public BrokenLinkResult() {
        this.notice = "Checks links directly discovered from the supplied page (not a recursive full-site crawl). Limited to safety bounds.";
    }

    public BrokenLinkResult(int totalLinks, int workingLinks, int brokenLinks, List<BrokenLinkItem> links, String notice) {
        this.totalLinks = totalLinks;
        this.workingLinks = workingLinks;
        this.brokenLinks = brokenLinks;
        this.links = links;
        this.notice = notice;
    }

    public int getTotalLinks() {
        return totalLinks;
    }

    public void setTotalLinks(int totalLinks) {
        this.totalLinks = totalLinks;
    }

    public int getWorkingLinks() {
        return workingLinks;
    }

    public void setWorkingLinks(int workingLinks) {
        this.workingLinks = workingLinks;
    }

    public int getBrokenLinks() {
        return brokenLinks;
    }

    public void setBrokenLinks(int brokenLinks) {
        this.brokenLinks = brokenLinks;
    }

    public List<BrokenLinkItem> getLinks() {
        return links;
    }

    public void setLinks(List<BrokenLinkItem> links) {
        this.links = links;
    }

    public String getNotice() {
        return notice;
    }

    public void setNotice(String notice) {
        this.notice = notice;
    }
}
