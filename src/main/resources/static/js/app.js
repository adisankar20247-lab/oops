/**
 * CYBER-SCAN FRONTEND CONTROLLER
 * Handles client-side validation, API communication, dynamic dashboard rendering,
 * modal dialogs, and scan history persistence interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const scanForm = document.getElementById('scanForm');
    const targetUrlInput = document.getElementById('targetUrlInput');
    const scanBtn = document.getElementById('scanBtn');
    const alertBox = document.getElementById('alertBox');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');
    const alertCloseBtn = document.getElementById('alertCloseBtn');
    const alertIcon = document.getElementById('alertIcon');

    const loadingContainer = document.getElementById('loadingContainer');
    const loadingStage = document.getElementById('loadingStage');
    const loadingTargetUrl = document.getElementById('loadingTargetUrl');
    const progressBarFill = document.getElementById('progressBarFill');

    const resultsSection = document.getElementById('resultsSection');
    const resScannedUrl = document.getElementById('resScannedUrl');
    const resFinalUrl = document.getElementById('resFinalUrl');
    const resFinalUrlWrapper = document.getElementById('resFinalUrlWrapper');
    const resScanTimestamp = document.getElementById('resScanTimestamp');
    const reScanBtn = document.getElementById('reScanBtn');

    // Card 1: Response Time
    const cardLatencyVal = document.getElementById('cardLatencyVal');
    const cardLatencyBadge = document.getElementById('cardLatencyBadge');
    const cardHttpCodeBadge = document.getElementById('cardHttpCodeBadge');
    const cardLatencyClassification = document.getElementById('cardLatencyClassification');
    const cardHttpStatusText = document.getElementById('cardHttpStatusText');

    // Card 2: Security Headers
    const cardHeadersCount = document.getElementById('cardHeadersCount');
    const cardHeadersBadge = document.getElementById('cardHeadersBadge');
    const cardHstsStatus = document.getElementById('cardHstsStatus');
    const cardCspStatus = document.getElementById('cardCspStatus');
    const openHeadersModalBtn = document.getElementById('openHeadersModalBtn');

    // Card 3: SSL
    const cardSslStatus = document.getElementById('cardSslStatus');
    const cardSslDaysBadge = document.getElementById('cardSslDaysBadge');
    const cardSslMatchBadge = document.getElementById('cardSslMatchBadge');
    const cardSslIssuer = document.getElementById('cardSslIssuer');
    const cardSslValidUntil = document.getElementById('cardSslValidUntil');
    const openSslModalBtn = document.getElementById('openSslModalBtn');

    // Card 4: Links
    const cardBrokenCount = document.getElementById('cardBrokenCount');
    const cardTotalLinksCount = document.getElementById('cardTotalLinksCount');
    const cardLinksBadge = document.getElementById('cardLinksBadge');
    const cardLinksRate = document.getElementById('cardLinksRate');
    const openLinksModalBtn = document.getElementById('openLinksModalBtn');

    // History Table
    const historyTableBody = document.getElementById('historyTableBody');
    const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');

    // Modals
    const headersModal = document.getElementById('headersModal');
    const headersTableBody = document.getElementById('headersTableBody');
    const headersModalRatio = document.getElementById('headersModalRatio');

    const sslModal = document.getElementById('sslModal');
    const sslModalHost = document.getElementById('sslModalHost');
    const sslDetailStatus = document.getElementById('sslDetailStatus');
    const sslDetailMatch = document.getElementById('sslDetailMatch');
    const sslDetailIssuer = document.getElementById('sslDetailIssuer');
    const sslDetailSubject = document.getElementById('sslDetailSubject');
    const sslDetailValidFrom = document.getElementById('sslDetailValidFrom');
    const sslDetailValidUntil = document.getElementById('sslDetailValidUntil');
    const sslDetailDaysRemaining = document.getElementById('sslDetailDaysRemaining');
    const sslDetailSignature = document.getElementById('sslDetailSignature');

    const linksModal = document.getElementById('linksModal');
    const linksTableBody = document.getElementById('linksTableBody');
    const linksModalSubtitle = document.getElementById('linksModalSubtitle');
    const linksNoticeText = document.getElementById('linksNoticeText');

    // State
    let currentScanData = null;
    let progressTimer = null;

    // Initialize
    loadScanHistory();

    // Event Listeners
    scanForm.addEventListener('submit', handleScanSubmit);
    scanBtn.addEventListener('click', handleScanSubmit);
    reScanBtn.addEventListener('click', () => {
        if (currentScanData && currentScanData.url) {
            targetUrlInput.value = currentScanData.url;
            executeScan(currentScanData.url);
        }
    });

    refreshHistoryBtn.addEventListener('click', loadScanHistory);

    alertCloseBtn.addEventListener('click', hideAlert);

    // Preset Buttons
    document.querySelectorAll('.preset-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.getAttribute('data-url');
            targetUrlInput.value = url;
            executeScan(url);
        });
    });

    // Modal Triggers
    openHeadersModalBtn.addEventListener('click', () => {
        if (currentScanData && currentScanData.securityHeaders) {
            renderHeadersModal(currentScanData.securityHeaders);
            showModal(headersModal);
        }
    });

    openSslModalBtn.addEventListener('click', () => {
        if (currentScanData && currentScanData.sslCertificate) {
            renderSslModal(currentScanData.sslCertificate);
            showModal(sslModal);
        }
    });

    openLinksModalBtn.addEventListener('click', () => {
        if (currentScanData && currentScanData.brokenLinks) {
            renderLinksModal(currentScanData.brokenLinks);
            showModal(linksModal);
        }
    });

    // Close Modals
    document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target === el || el.classList.contains('modal-close')) {
                closeAllModals();
            }
        });
    });

    document.querySelectorAll('.modal-dialog').forEach(dialog => {
        dialog.addEventListener('click', (e) => e.stopPropagation());
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllModals();
    });

    // Form Submit Handler
    function handleScanSubmit(e) {
        if (e) e.preventDefault();
        const rawUrl = targetUrlInput.value.trim();
        executeScan(rawUrl);
    }

    // Client-side Validation & Execution
    function executeScan(rawUrl) {
        hideAlert();

        // 1. Empty Check
        if (!rawUrl) {
            showAlert('Validation Error', 'Please enter a website URL to begin scanning.', '⚠️');
            targetUrlInput.focus();
            return;
        }

        // 2. Client-side URL & Protocol Validation
        let normalizedUrl = rawUrl;
        if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
            if (normalizedUrl.includes('://')) {
                showAlert('Unsupported Protocol', 'Only http:// and https:// protocols are permitted.', '🚫');
                return;
            }
            normalizedUrl = 'https://' + normalizedUrl;
        }

        try {
            const parsed = new URL(normalizedUrl);
            const hostname = parsed.hostname.toLowerCase();

            // Client-side SSRF blocklist check
            if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' || hostname === '::1' ||
                hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
                showAlert('Security Policy Rejection', 'Access to localhost and internal hostnames is prohibited.', '🛡️');
                return;
            }
        } catch (err) {
            showAlert('Malformed URL', 'The specified URL format is invalid. Example: https://example.com', '⚠️');
            return;
        }

        // Start Loading
        startLoading(normalizedUrl);

        // Send POST request to backend
        fetch('/api/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: normalizedUrl })
        })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) {
                    const errorMsg = data.message || data.error || 'Server returned an error status: ' + response.status;
                    throw new Error(errorMsg);
                }
                return data;
            })
            .then((data) => {
                stopLoading();
                currentScanData = data;
                renderDashboard(data);
                loadScanHistory();
            })
            .catch((error) => {
                stopLoading();
                showAlert('Scan Failed', error.message || 'Unable to connect to the target website. The server may be unavailable or the URL may be invalid.', '❌');
            });
    }

    // Loading State & Progress Animation
    function startLoading(url) {
        scanBtn.disabled = true;
        loadingTargetUrl.textContent = url;
        loadingContainer.classList.remove('hidden');
        resultsSection.classList.add('hidden');

        let progress = 5;
        progressBarFill.style.width = '5%';
        const stages = [
            { threshold: 15, text: 'Resolving DNS & Host Security Verification...' },
            { threshold: 40, text: 'Measuring Round-Trip Latency & Headers...' },
            { threshold: 65, text: 'Conducting TLS/SSL Handshake & Verification...' },
            { threshold: 85, text: 'Extracting DOM Anchors & Probing Reachability...' },
            { threshold: 95, text: 'Finalizing Report & Persisting Records...' }
        ];

        let stageIdx = 0;
        loadingStage.textContent = stages[0].text;

        clearInterval(progressTimer);
        progressTimer = setInterval(() => {
            if (progress < 92) {
                progress += Math.floor(Math.random() * 8) + 2;
                if (progress > 92) progress = 92;
                progressBarFill.style.width = progress + '%';

                if (stageIdx < stages.length && progress >= stages[stageIdx].threshold) {
                    loadingStage.textContent = stages[stageIdx].text;
                    stageIdx++;
                }
            }
        }, 350);
    }

    function stopLoading() {
        clearInterval(progressTimer);
        progressBarFill.style.width = '100%';
        setTimeout(() => {
            loadingContainer.classList.add('hidden');
            scanBtn.disabled = false;
        }, 300);
    }

    // Dashboard Rendering
    function renderDashboard(data) {
        resultsSection.classList.remove('hidden');

        // Meta
        resScannedUrl.textContent = data.url;
        resScannedUrl.href = data.url;

        if (data.finalUrl && data.finalUrl !== data.url) {
            resFinalUrlWrapper.classList.remove('hidden');
            resFinalUrl.textContent = data.finalUrl;
        } else {
            resFinalUrlWrapper.classList.add('hidden');
        }

        const scanDate = data.scanDate ? formatDateTime(data.scanDate) : new Date().toLocaleString();
        resScanTimestamp.textContent = `Scanned: ${scanDate}`;

        // Module 1: Latency
        const rt = data.responseTime || {};
        if (rt.responseTimeMs >= 0) {
            cardLatencyVal.textContent = rt.responseTimeMs;
            cardLatencyVal.classList.remove('text-rose');
            cardLatencyClassification.textContent = rt.classification || '--';
            cardHttpStatusText.textContent = rt.httpStatusText || '200 OK';

            // Latency Badge
            cardLatencyBadge.className = 'badge';
            const cls = (rt.classification || '').toLowerCase().replace(/\s+/g, '');
            if (cls === 'fast') cardLatencyBadge.classList.add('badge-fast');
            else if (cls === 'moderate') cardLatencyBadge.classList.add('badge-moderate');
            else if (cls === 'slow') cardLatencyBadge.classList.add('badge-slow');
            else cardLatencyBadge.classList.add('badge-veryslow');
            cardLatencyBadge.textContent = rt.classification || 'Fast';

            cardHttpCodeBadge.textContent = `HTTP ${rt.httpStatusCode || 200}`;
        } else {
            cardLatencyVal.textContent = 'Err';
            cardLatencyVal.classList.add('text-rose');
            cardLatencyBadge.className = 'badge badge-veryslow';
            cardLatencyBadge.textContent = 'Failed';
            cardLatencyClassification.textContent = 'Unreachable';
            cardHttpStatusText.textContent = rt.httpStatusText || 'Connection Error';
            cardHttpCodeBadge.textContent = 'HTTP ERR';
        }

        // Module 2: Security Headers
        const sh = data.securityHeaders || {};
        const found = sh.foundCount !== undefined ? sh.foundCount : 0;
        const total = sh.totalCount || 8;
        cardHeadersCount.textContent = `${found} / ${total}`;

        if (found >= 6) {
            cardHeadersBadge.className = 'badge badge-fast';
            cardHeadersBadge.textContent = 'Strongly Hardened';
        } else if (found >= 3) {
            cardHeadersBadge.className = 'badge badge-moderate';
            cardHeadersBadge.textContent = 'Moderate Hardening';
        } else {
            cardHeadersBadge.className = 'badge badge-slow';
            cardHeadersBadge.textContent = 'Action Advised';
        }

        // Quick check on HSTS and CSP
        let hasHsts = false;
        let hasCsp = false;
        if (sh.headers) {
            sh.headers.forEach(h => {
                if (h.headerName === 'Strict-Transport-Security' && h.present) hasHsts = true;
                if (h.headerName === 'Content-Security-Policy' && h.present) hasCsp = true;
            });
        }
        cardHstsStatus.innerHTML = hasHsts ? '<span class="status-present">✓ Present</span>' : '<span class="status-missing">✗ Missing</span>';
        cardCspStatus.innerHTML = hasCsp ? '<span class="status-present">✓ Present</span>' : '<span class="status-missing">✗ Missing</span>';

        // Module 3: SSL Certificate
        const ssl = data.sslCertificate || {};
        if (!ssl.httpsUsed) {
            cardSslStatus.textContent = 'No HTTPS';
            cardSslDaysBadge.className = 'badge badge-slow';
            cardSslDaysBadge.textContent = 'HTTP in use';
            cardSslMatchBadge.className = 'badge badge-subtle';
            cardSslMatchBadge.textContent = 'No TLS';
            cardSslIssuer.textContent = 'N/A';
            cardSslValidUntil.textContent = 'N/A';
        } else {
            cardSslStatus.textContent = ssl.status || (ssl.valid ? 'Valid' : 'Invalid');
            if (ssl.valid) {
                cardSslDaysBadge.className = 'badge badge-fast';
                cardSslDaysBadge.textContent = `${ssl.daysRemaining !== null ? ssl.daysRemaining : '--'} days remaining`;
                cardSslMatchBadge.className = 'badge badge-fast';
                cardSslMatchBadge.textContent = 'Hostname Match ✓';
            } else {
                cardSslDaysBadge.className = 'badge badge-veryslow';
                cardSslDaysBadge.textContent = ssl.status || 'Invalid';
                cardSslMatchBadge.className = ssl.hostnameMatch ? 'badge badge-fast' : 'badge badge-veryslow';
                cardSslMatchBadge.textContent = ssl.hostnameMatch ? 'Hostname Match ✓' : 'Hostname Mismatch ✗';
            }
            cardSslIssuer.textContent = ssl.issuer || 'Unknown';
            cardSslIssuer.title = ssl.issuer || '';
            cardSslValidUntil.textContent = ssl.validUntil || 'N/A';
        }

        // Module 4: Broken Links
        const bl = data.brokenLinks || {};
        const totalLinks = bl.totalLinks || 0;
        const brokenLinks = bl.brokenLinks || 0;
        const workingLinks = bl.workingLinks || 0;

        cardBrokenCount.textContent = brokenLinks;
        cardTotalLinksCount.textContent = totalLinks;
        cardLinksBadge.className = brokenLinks === 0 ? 'badge badge-fast' : 'badge badge-veryslow';
        cardLinksBadge.textContent = `${workingLinks} Working`;

        const rate = totalLinks > 0 ? Math.round((workingLinks / totalLinks) * 100) : 100;
        cardLinksRate.textContent = `${rate}%`;

        // Smooth scroll into results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Render Modals
    function renderHeadersModal(securityHeaders) {
        headersModalRatio.textContent = `Found ${securityHeaders.foundCount || 0} of ${securityHeaders.totalCount || 8} Recommended Headers`;
        headersTableBody.innerHTML = '';

        if (!securityHeaders.headers || securityHeaders.headers.length === 0) {
            headersTableBody.innerHTML = '<tr><td colspan="3" class="empty-state">No headers data available.</td></tr>';
            return;
        }

        securityHeaders.headers.forEach(h => {
            const tr = document.createElement('tr');
            const statusHtml = h.present
                ? '<span class="status-present">✓ Present</span>'
                : '<span class="status-missing">✗ Missing</span>';

            const valueHtml = h.present
                ? `<div class="header-val-pill" title="${escapeHtml(h.headerValue || '')}">${escapeHtml(h.headerValue || '')}</div><span class="header-purpose">${escapeHtml(h.description || '')}</span>`
                : `<span class="header-purpose">${escapeHtml(h.description || '')}</span>`;

            tr.innerHTML = `
                <td><code>${escapeHtml(h.headerName)}</code></td>
                <td>${statusHtml}</td>
                <td>${valueHtml}</td>
            `;
            headersTableBody.appendChild(tr);
        });
    }

    function renderSslModal(ssl) {
        sslModalHost.textContent = ssl.targetHostname || 'Target Host';
        if (!ssl.httpsUsed) {
            sslDetailStatus.textContent = 'HTTPS is not being used.';
            sslDetailMatch.textContent = 'N/A';
            sslDetailIssuer.textContent = 'N/A';
            sslDetailSubject.textContent = 'N/A';
            sslDetailValidFrom.textContent = 'N/A';
            sslDetailValidUntil.textContent = 'N/A';
            sslDetailDaysRemaining.textContent = 'N/A';
            sslDetailSignature.textContent = 'N/A';
            return;
        }

        sslDetailStatus.textContent = ssl.status || (ssl.valid ? 'Valid' : 'Invalid');
        sslDetailStatus.className = 'cert-value ' + (ssl.valid ? 'status-present' : 'status-missing');

        sslDetailMatch.innerHTML = ssl.hostnameMatch
            ? '<span class="status-present">✓ Verified Match</span>'
            : '<span class="status-missing">✗ Mismatch</span>';

        sslDetailIssuer.textContent = ssl.issuer || 'Unknown';
        sslDetailSubject.textContent = ssl.subject || 'Unknown';
        sslDetailValidFrom.textContent = ssl.validFrom || 'N/A';
        sslDetailValidUntil.textContent = ssl.validUntil || 'N/A';
        sslDetailDaysRemaining.textContent = ssl.daysRemaining !== null ? `${ssl.daysRemaining} days` : 'N/A';
        sslDetailSignature.textContent = ssl.signatureAlgorithm || 'N/A';
    }

    function renderLinksModal(brokenLinks) {
        linksModalSubtitle.textContent = `Discovered ${brokenLinks.totalLinks || 0} links (${brokenLinks.workingLinks || 0} working, ${brokenLinks.brokenLinks || 0} broken)`;
        linksNoticeText.textContent = brokenLinks.notice || 'Discovered links from anchor tags on the current page.';
        linksTableBody.innerHTML = '';

        if (!brokenLinks.links || brokenLinks.links.length === 0) {
            linksTableBody.innerHTML = '<tr><td colspan="3" class="empty-state">No links discovered on the scanned page.</td></tr>';
            return;
        }

        brokenLinks.links.forEach(l => {
            const tr = document.createElement('tr');
            let badgeCls = 'badge-subtle';
            if (l.status === 'Working') badgeCls = 'badge-fast';
            else if (l.status === 'Broken') badgeCls = 'badge-broken';
            else if (l.status === 'Unreachable') badgeCls = 'badge-slow';

            tr.innerHTML = `
                <td><a href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer" class="table-url" title="${escapeHtml(l.url)}">${escapeHtml(l.url)}</a></td>
                <td><span class="badge ${badgeCls}">${escapeHtml(l.status)}</span></td>
                <td><code>${l.statusCode !== null && l.statusCode !== undefined ? l.statusCode : '--'}</code></td>
            `;
            linksTableBody.appendChild(tr);
        });
    }

    // Scan History CRUD
    function loadScanHistory() {
        fetch('/api/scans')
            .then(res => res.json())
            .then(scans => {
                renderHistoryTable(scans);
            })
            .catch(err => {
                historyTableBody.innerHTML = '<tr><td colspan="7" class="empty-state">Unable to load scan history.</td></tr>';
            });
    }

    function renderHistoryTable(scans) {
        historyTableBody.innerHTML = '';
        if (!scans || scans.length === 0) {
            historyTableBody.innerHTML = '<tr><td colspan="7" class="empty-state">No previous scans found. Run your first scan above!</td></tr>';
            return;
        }

        scans.forEach(scan => {
            const tr = document.createElement('tr');
            const dateStr = scan.scanDate ? formatDateTime(scan.scanDate) : 'Unknown';
            const latencyStr = scan.responseTime !== null && scan.responseTime >= 0 ? `${scan.responseTime} ms` : 'Failed';
            const sslStr = scan.sslStatus || 'N/A';
            const headersStr = `${scan.securityHeadersFound || 0} / ${scan.securityHeadersTotal || 8}`;
            const linksStr = `${scan.brokenLinks || 0} broken / ${scan.totalLinks || 0}`;

            tr.innerHTML = `
                <td><span class="table-url" title="${escapeHtml(scan.url)}">${escapeHtml(scan.url)}</span></td>
                <td style="font-family: var(--font-mono); font-size: 0.8rem;">${dateStr}</td>
                <td><code>${latencyStr}</code></td>
                <td><span class="badge ${sslStr === 'Valid' ? 'badge-fast' : 'badge-subtle'}">${escapeHtml(sslStr)}</span></td>
                <td>${headersStr}</td>
                <td>${linksStr}</td>
                <td>
                    <div class="table-actions">
                        <button type="button" class="table-btn view-scan-btn" data-id="${scan.id}">View</button>
                        <button type="button" class="table-btn table-btn-delete delete-scan-btn" data-id="${scan.id}">Delete</button>
                    </div>
                </td>
            `;
            historyTableBody.appendChild(tr);
        });

        // Attach action handlers
        document.querySelectorAll('.view-scan-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                fetchScanDetails(id);
            });
        });

        document.querySelectorAll('.delete-scan-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                deleteScanRecord(id);
            });
        });
    }

    function fetchScanDetails(id) {
        fetch(`/api/scans/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Scan not found');
                return res.json();
            })
            .then(scan => {
                currentScanData = scan;
                targetUrlInput.value = scan.url;
                renderDashboard(scan);
            })
            .catch(err => {
                showAlert('Error', 'Unable to retrieve scan details: ' + err.message, '⚠️');
            });
    }

    function deleteScanRecord(id) {
        if (!confirm('Are you sure you want to delete this scan record from database?')) {
            return;
        }

        fetch(`/api/scans/${id}`, { method: 'DELETE' })
            .then(res => {
                if (!res.ok) throw new Error('Failed to delete scan record');
                loadScanHistory();
            })
            .catch(err => {
                showAlert('Error', 'Failed to delete record: ' + err.message, '⚠️');
            });
    }

    // Modal Helpers
    function showModal(modalEl) {
        modalEl.classList.remove('hidden');
    }

    function closeAllModals() {
        headersModal.classList.add('hidden');
        sslModal.classList.add('hidden');
        linksModal.classList.add('hidden');
    }

    // Alert Box Helpers
    function showAlert(title, message, icon = '⚠️') {
        alertTitle.textContent = title;
        alertMessage.textContent = message;
        alertIcon.textContent = icon;
        alertBox.classList.remove('hidden');
    }

    function hideAlert() {
        alertBox.classList.add('hidden');
    }

    // Utility Helpers
    function formatDateTime(dtStr) {
        try {
            const dt = new Date(dtStr);
            if (isNaN(dt.getTime())) return dtStr;
            const day = String(dt.getDate()).padStart(2, '0');
            const month = String(dt.getMonth() + 1).padStart(2, '0');
            const year = dt.getFullYear();
            const hours = String(dt.getHours()).padStart(2, '0');
            const mins = String(dt.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${mins}`;
        } catch (e) {
            return dtStr;
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
