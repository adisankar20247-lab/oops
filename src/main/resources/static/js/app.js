/**
 * CYBER-SCAN FRONTEND CONTROLLER
 * Handles client-side validation, API communication, dynamic dashboard rendering,
 * benchmark scoring calculation, modal dialogs, and scan history persistence.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Core DOM Elements
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

    // Scorecard & Benchmark Matrix Elements
    const diagnosticScorecard = document.getElementById('diagnosticScorecard');
    const copyAsciiBtn = document.getElementById('copyAsciiBtn');
    const copyAsciiBtnText = document.getElementById('copyAsciiBtnText');
    const toggleTerminalBtn = document.getElementById('toggleTerminalBtn');
    const overallRingFill = document.getElementById('overallRingFill');
    const overallScoreVal = document.getElementById('overallScoreVal');
    const overallRatingBadge = document.getElementById('overallRatingBadge');
    const overallSummaryText = document.getElementById('overallSummaryText');

    const asciiBarPerformance = document.getElementById('asciiBarPerformance');
    const meterFillPerformance = document.getElementById('meterFillPerformance');
    const barStatusPerformance = document.getElementById('barStatusPerformance');
    const scoreValPerformance = document.getElementById('scoreValPerformance');

    const asciiBarSecurity = document.getElementById('asciiBarSecurity');
    const meterFillSecurity = document.getElementById('meterFillSecurity');
    const barStatusSecurity = document.getElementById('barStatusSecurity');
    const scoreValSecurity = document.getElementById('scoreValSecurity');

    const asciiBarSsl = document.getElementById('asciiBarSsl');
    const meterFillSsl = document.getElementById('meterFillSsl');
    const barStatusSsl = document.getElementById('barStatusSsl');
    const scoreValSsl = document.getElementById('scoreValSsl');

    const asciiBarLinks = document.getElementById('asciiBarLinks');
    const meterFillLinks = document.getElementById('meterFillLinks');
    const barStatusLinks = document.getElementById('barStatusLinks');
    const scoreValLinks = document.getElementById('scoreValLinks');

    const rawTerminalCard = document.getElementById('rawTerminalCard');
    const rawTerminalOutput = document.getElementById('rawTerminalOutput');
    const copyRawTerminalBtn = document.getElementById('copyRawTerminalBtn');

    // Issues & Recommendations Section
    const issuesContainer = document.getElementById('issuesContainer');
    const issuesSummaryBadge = document.getElementById('issuesSummaryBadge');
    const issuesList = document.getElementById('issuesList');

    // Technical Card 1: Response Time
    const cardLatencyVal = document.getElementById('cardLatencyVal');
    const cardLatencyBadge = document.getElementById('cardLatencyBadge');
    const cardHttpCodeBadge = document.getElementById('cardHttpCodeBadge');
    const cardLatencyClassification = document.getElementById('cardLatencyClassification');
    const cardHttpStatusText = document.getElementById('cardHttpStatusText');
    const miniBarLatencyBlocks = document.getElementById('miniBarLatencyBlocks');
    const miniBarLatencyScore = document.getElementById('miniBarLatencyScore');

    // Technical Card 2: Security Headers
    const cardHeadersCount = document.getElementById('cardHeadersCount');
    const cardHeadersBadge = document.getElementById('cardHeadersBadge');
    const cardHstsStatus = document.getElementById('cardHstsStatus');
    const cardCspStatus = document.getElementById('cardCspStatus');
    const openHeadersModalBtn = document.getElementById('openHeadersModalBtn');
    const miniBarHeadersBlocks = document.getElementById('miniBarHeadersBlocks');
    const miniBarHeadersScore = document.getElementById('miniBarHeadersScore');

    // Technical Card 3: SSL
    const cardSslStatus = document.getElementById('cardSslStatus');
    const cardSslDaysBadge = document.getElementById('cardSslDaysBadge');
    const cardSslMatchBadge = document.getElementById('cardSslMatchBadge');
    const cardSslIssuer = document.getElementById('cardSslIssuer');
    const cardSslValidUntil = document.getElementById('cardSslValidUntil');
    const openSslModalBtn = document.getElementById('openSslModalBtn');
    const miniBarSslBlocks = document.getElementById('miniBarSslBlocks');
    const miniBarSslScore = document.getElementById('miniBarSslScore');

    // Technical Card 4: Links
    const cardBrokenCount = document.getElementById('cardBrokenCount');
    const cardTotalLinksCount = document.getElementById('cardTotalLinksCount');
    const cardLinksBadge = document.getElementById('cardLinksBadge');
    const cardLinksRate = document.getElementById('cardLinksRate');
    const openLinksModalBtn = document.getElementById('openLinksModalBtn');
    const miniBarLinksBlocks = document.getElementById('miniBarLinksBlocks');
    const miniBarLinksScore = document.getElementById('miniBarLinksScore');

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

    const demoAuditBtn = document.getElementById('demoAuditBtn');
    const cyberToast = document.getElementById('cyberToast');

    // State
    const API_BASE = window.API_BASE_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'https://website-scanner-drbu.onrender.com');
    let currentScanData = null;
    let progressTimer = null;

    // Sample Diagnostic Benchmark Data for instant local demonstration
    const SAMPLE_AUDIT_DATA = {
        url: 'https://example.com',
        finalUrl: 'https://example.com',
        scanDate: new Date().toISOString(),
        responseTime: {
            responseTimeMs: 240,
            httpStatusCode: 200,
            httpStatusText: '200 OK',
            classification: 'Fast',
            finalUrl: 'https://example.com'
        },
        securityHeaders: {
            foundCount: 6,
            totalCount: 8,
            headers: [
                { headerName: 'Strict-Transport-Security', present: true, headerValue: 'max-age=31536000; includeSubDomains', description: 'Enforces encrypted HTTPS connections.' },
                { headerName: 'Content-Security-Policy', present: true, headerValue: "default-src 'self'", description: 'Restricts script and resource load vectors.' },
                { headerName: 'X-Frame-Options', present: true, headerValue: 'DENY', description: 'Prevents framing and clickjacking attacks.' },
                { headerName: 'X-Content-Type-Options', present: true, headerValue: 'nosniff', description: 'Blocks MIME-type sniffing.' },
                { headerName: 'Referrer-Policy', present: true, headerValue: 'strict-origin-when-cross-origin', description: 'Protects sensitive URL query strings.' },
                { headerName: 'Permissions-Policy', present: true, headerValue: 'camera=(), microphone=()', description: 'Restricts hardware API access.' },
                { headerName: 'Cross-Origin-Opener-Policy', present: false, headerValue: null, description: 'Isolates browsing context to protect window references.' },
                { headerName: 'Cross-Origin-Resource-Policy', present: false, headerValue: null, description: 'Restricts resource exposure to same-origin contexts.' }
            ]
        },
        sslCertificate: {
            httpsUsed: true,
            valid: true,
            status: 'Valid',
            hostnameMatch: true,
            issuer: "DigiCert Global Root G2",
            subject: "CN=example.com",
            validFrom: "2026-01-01",
            validUntil: "2026-12-31",
            daysRemaining: 180,
            signatureAlgorithm: "SHA256withRSA",
            targetHostname: "example.com"
        },
        brokenLinks: {
            totalLinks: 17,
            workingLinks: 16,
            brokenLinks: 1,
            notice: 'Discovered links from anchor tags on example.com.',
            links: [
                { url: 'https://example.com/docs', status: 'Working', statusCode: 200 },
                { url: 'https://example.com/api', status: 'Working', statusCode: 200 },
                { url: 'https://example.com/status', status: 'Working', statusCode: 200 },
                { url: 'https://example.com/legacy-endpoint', status: 'Broken', statusCode: 404 }
            ]
        }
    };

    // Initialize scan history on load
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
            if (url) {
                targetUrlInput.value = url;
                executeScan(url);
            }
        });
    });

    // Demo Sample Audit Button
    if (demoAuditBtn) {
        demoAuditBtn.addEventListener('click', () => {
            targetUrlInput.value = SAMPLE_AUDIT_DATA.url;
            hideAlert();
            startLoading(SAMPLE_AUDIT_DATA.url);
            setTimeout(() => {
                stopLoading();
                currentScanData = SAMPLE_AUDIT_DATA;
                renderDashboard(SAMPLE_AUDIT_DATA);
            }, 600);
        });
    }

    // Scorecard Action Listeners
    if (copyAsciiBtn) {
        copyAsciiBtn.addEventListener('click', copyAsciiToClipboard);
    }

    if (copyRawTerminalBtn) {
        copyRawTerminalBtn.addEventListener('click', copyAsciiToClipboard);
    }

    if (toggleTerminalBtn) {
        toggleTerminalBtn.addEventListener('click', () => {
            if (!rawTerminalCard) return;
            const isHidden = rawTerminalCard.classList.contains('hidden');
            if (isHidden) {
                rawTerminalCard.classList.remove('hidden');
                toggleTerminalBtn.classList.add('active');
            } else {
                rawTerminalCard.classList.add('hidden');
                toggleTerminalBtn.classList.remove('active');
            }
        });
    }

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

        // Send POST request to backend API
        fetch(`${API_BASE}/api/scan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: normalizedUrl })
        })
            .then(async (response) => {
                if (response.status === 404) {
                    throw new Error('Backend API (/api/scan) not found. Check that the Spring Boot server is active on localhost.');
                }
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

        // Meta Header
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
        if (rt.responseTimeMs !== undefined && rt.responseTimeMs !== null && rt.responseTimeMs >= 0) {
            cardLatencyVal.textContent = rt.responseTimeMs;
            cardLatencyVal.classList.remove('text-rose');
            cardLatencyClassification.textContent = rt.classification || '--';
            cardHttpStatusText.textContent = rt.httpStatusText || `${rt.httpStatusCode || 200} OK`;

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
                cardSslDaysBadge.textContent = `${ssl.daysRemaining !== null && ssl.daysRemaining !== undefined ? ssl.daysRemaining : '--'} days remaining`;
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

        // Render Benchmark Scorecard & Block Bars Feature
        const scores = computeBenchmarkScores(data);
        renderScorecard(scores);

        // Render Issues, Warnings & Recommendations
        renderIssues(data, scores);

        // Smooth scroll into results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Scorecard & Benchmark Matrix Functions
    function getBarData(score) {
        const clamped = Math.max(0, Math.min(100, Math.round(score)));
        const filled = Math.min(10, Math.max(0, Math.floor(clamped / 10)));
        const empty = 10 - filled;
        const filledStr = '█'.repeat(filled);
        const emptyStr = '░'.repeat(empty);
        return {
            score: clamped,
            filled,
            empty,
            filledStr,
            emptyStr,
            fullBar: filledStr + emptyStr
        };
    }

    function generateAsciiSummary(scores) {
        const perfStr = scores.performance.score === 100 ? '100' : (scores.performance.score < 10 ? '  ' + scores.performance.score : ' ' + scores.performance.score);
        const secStr = scores.security.score === 100 ? '100' : (scores.security.score < 10 ? '  ' + scores.security.score : ' ' + scores.security.score);
        const sslStr = scores.ssl.score === 100 ? '100' : (scores.ssl.score < 10 ? '  ' + scores.ssl.score : ' ' + scores.ssl.score);
        const linksStr = scores.links.score === 100 ? '100' : (scores.links.score < 10 ? '  ' + scores.links.score : ' ' + scores.links.score);

        return [
            `Performance     ${scores.performance.fullBar} ${perfStr}`,
            `Security        ${scores.security.fullBar} ${secStr}`,
            `SSL             ${scores.ssl.fullBar} ${sslStr}`,
            `Links           ${scores.links.fullBar} ${linksStr}`
        ].join('\n');
    }

    function computeBenchmarkScores(data) {
        // 1. Performance
        let perfScore = 0;
        let perfStatus = 'Unavailable';
        const rt = data.responseTime || {};
        if (rt.responseTimeMs !== undefined && rt.responseTimeMs !== null && rt.responseTimeMs >= 0) {
            // Smooth curve: 240ms -> ~82, 500ms -> ~66, 1200ms -> ~37, 2120ms -> ~17
            perfScore = Math.round(Math.max(5, Math.min(100, 100 * Math.exp(-rt.responseTimeMs / 1200))));
            perfStatus = `${rt.responseTimeMs} ms • ${rt.classification || 'Active'}`;
        } else {
            perfScore = 0;
            perfStatus = 'Connection Error';
        }

        // 2. Security Headers
        let secScore = 0;
        let secStatus = '0 / 8 Headers';
        const sh = data.securityHeaders || {};
        const found = sh.foundCount !== undefined ? sh.foundCount : 0;
        const total = sh.totalCount || 8;
        secScore = total > 0 ? Math.round((found / total) * 100) : 0;
        secStatus = `${found} / ${total} Headers`;

        // 3. SSL Certificate
        let sslScore = 0;
        let sslStatus = 'No HTTPS';
        const ssl = data.sslCertificate || {};
        if (!ssl.httpsUsed) {
            sslScore = 0;
            sslStatus = 'HTTP Only';
        } else if (!ssl.valid) {
            sslScore = 25;
            sslStatus = ssl.status || 'Invalid Cert';
        } else if (!ssl.hostnameMatch) {
            sslScore = 40;
            sslStatus = 'Host Mismatch';
        } else {
            const days = ssl.daysRemaining;
            if (days !== null && days !== undefined && days < 15) {
                sslScore = 70;
                sslStatus = `${days}d Remaining`;
            } else if (days !== null && days !== undefined && days < 30) {
                sslScore = 85;
                sslStatus = `${days}d Remaining`;
            } else {
                sslScore = 100;
                sslStatus = 'Valid • TLS';
            }
        }

        // 4. Links
        let linksScore = 100;
        let linksStatus = '100% Healthy';
        const bl = data.brokenLinks || {};
        const totalLinks = bl.totalLinks || 0;
        const workingLinks = bl.workingLinks || 0;
        const brokenLinks = bl.brokenLinks || 0;
        if (totalLinks > 0) {
            linksScore = Math.round((workingLinks / totalLinks) * 100);
            linksStatus = `${linksScore}% Healthy (${brokenLinks} broken)`;
        } else {
            linksScore = 100;
            linksStatus = 'No Broken Links (0 found)';
        }

        return {
            performance: { score: perfScore, status: perfStatus, ...getBarData(perfScore) },
            security: { score: secScore, status: secStatus, ...getBarData(secScore) },
            ssl: { score: sslScore, status: sslStatus, ...getBarData(sslScore) },
            links: { score: linksScore, status: linksStatus, ...getBarData(linksScore) }
        };
    }

    function renderScorecard(scores) {
        // Overall Score & Ring
        const overall = Math.round((scores.performance.score + scores.security.score + scores.ssl.score + scores.links.score) / 4);
        if (overallScoreVal) overallScoreVal.textContent = overall;
        const offset = Math.round(314 * (1 - overall / 100));
        if (overallRingFill) overallRingFill.style.strokeDashoffset = offset;

        let badgeText = 'GRADE A // EXCELLENT';
        let ringColor = 'var(--cyber-cyan)';
        let summaryText = 'Optimal TLS encryption, strong link health, and fast response latency.';

        if (overall >= 90) {
            badgeText = 'GRADE A+ // OUTSTANDING';
            ringColor = 'var(--cyber-emerald)';
            summaryText = 'Superior diagnostic performance, enterprise-grade TLS security, and pristine link health.';
        } else if (overall >= 80) {
            badgeText = 'GRADE A // EXCELLENT';
            ringColor = 'var(--cyber-cyan)';
            summaryText = 'Optimal TLS encryption, strong link health, and fast response latency.';
        } else if (overall >= 70) {
            badgeText = 'GRADE B // GOOD';
            ringColor = 'var(--cyber-blue)';
            summaryText = 'Solid health baseline with minor security hardening or latency optimizations recommended.';
        } else if (overall >= 50) {
            badgeText = 'GRADE C // MODERATE';
            ringColor = 'var(--cyber-amber)';
            summaryText = 'Attention advised: Missing security headers, elevated latency, or broken links detected.';
        } else {
            badgeText = 'GRADE D // CRITICAL';
            ringColor = 'var(--cyber-rose)';
            summaryText = 'Critical diagnostic failure: Significant security gaps or unreachable endpoints.';
        }

        if (overallRatingBadge) {
            overallRatingBadge.textContent = badgeText;
            if (overall >= 80) {
                overallRatingBadge.style.color = 'var(--cyber-emerald)';
                overallRatingBadge.style.borderColor = 'rgba(16, 185, 129, 0.35)';
                overallRatingBadge.style.background = 'rgba(16, 185, 129, 0.15)';
            } else if (overall >= 60) {
                overallRatingBadge.style.color = 'var(--cyber-amber)';
                overallRatingBadge.style.borderColor = 'rgba(245, 158, 11, 0.35)';
                overallRatingBadge.style.background = 'rgba(245, 158, 11, 0.15)';
            } else {
                overallRatingBadge.style.color = 'var(--cyber-rose)';
                overallRatingBadge.style.borderColor = 'rgba(244, 63, 94, 0.35)';
                overallRatingBadge.style.background = 'rgba(244, 63, 94, 0.15)';
            }
        }

        if (overallSummaryText) overallSummaryText.textContent = summaryText;
        if (overallRingFill) overallRingFill.style.stroke = ringColor;

        // Diagnostic Matrix Bars
        if (asciiBarPerformance) asciiBarPerformance.innerHTML = `<span class="blocks-filled">${scores.performance.filledStr}</span><span class="blocks-empty">${scores.performance.emptyStr}</span>`;
        if (meterFillPerformance) meterFillPerformance.style.width = `${scores.performance.score}%`;
        if (scoreValPerformance) scoreValPerformance.textContent = scores.performance.score;
        if (barStatusPerformance) barStatusPerformance.textContent = scores.performance.status;

        if (asciiBarSecurity) asciiBarSecurity.innerHTML = `<span class="blocks-filled">${scores.security.filledStr}</span><span class="blocks-empty">${scores.security.emptyStr}</span>`;
        if (meterFillSecurity) meterFillSecurity.style.width = `${scores.security.score}%`;
        if (scoreValSecurity) scoreValSecurity.textContent = scores.security.score;
        if (barStatusSecurity) barStatusSecurity.textContent = scores.security.status;

        if (asciiBarSsl) asciiBarSsl.innerHTML = `<span class="blocks-filled">${scores.ssl.filledStr}</span><span class="blocks-empty">${scores.ssl.emptyStr}</span>`;
        if (meterFillSsl) meterFillSsl.style.width = `${scores.ssl.score}%`;
        if (scoreValSsl) scoreValSsl.textContent = scores.ssl.score;
        if (barStatusSsl) barStatusSsl.textContent = scores.ssl.status;

        if (asciiBarLinks) asciiBarLinks.innerHTML = `<span class="blocks-filled">${scores.links.filledStr}</span><span class="blocks-empty">${scores.links.emptyStr}</span>`;
        if (meterFillLinks) meterFillLinks.style.width = `${scores.links.score}%`;
        if (scoreValLinks) scoreValLinks.textContent = scores.links.score;
        if (barStatusLinks) barStatusLinks.textContent = scores.links.status;

        // Mini Bars on Individual Cards
        if (miniBarLatencyBlocks) miniBarLatencyBlocks.innerHTML = `<span class="blocks-filled">${scores.performance.filledStr}</span><span class="blocks-empty">${scores.performance.emptyStr}</span>`;
        if (miniBarLatencyScore) miniBarLatencyScore.textContent = scores.performance.score;

        if (miniBarHeadersBlocks) miniBarHeadersBlocks.innerHTML = `<span class="blocks-filled">${scores.security.filledStr}</span><span class="blocks-empty">${scores.security.emptyStr}</span>`;
        if (miniBarHeadersScore) miniBarHeadersScore.textContent = scores.security.score;

        if (miniBarSslBlocks) miniBarSslBlocks.innerHTML = `<span class="blocks-filled">${scores.ssl.filledStr}</span><span class="blocks-empty">${scores.ssl.emptyStr}</span>`;
        if (miniBarSslScore) miniBarSslScore.textContent = scores.ssl.score;

        if (miniBarLinksBlocks) miniBarLinksBlocks.innerHTML = `<span class="blocks-filled">${scores.links.filledStr}</span><span class="blocks-empty">${scores.links.emptyStr}</span>`;
        if (miniBarLinksScore) miniBarLinksScore.textContent = scores.links.score;

        // Raw Terminal Code Box
        if (rawTerminalOutput) rawTerminalOutput.textContent = generateAsciiSummary(scores);
    }

    // Issues, Warnings & Remediation Recommendations Generator
    function renderIssues(data, scores) {
        if (!issuesList || !issuesSummaryBadge) return;

        const issues = [];
        const sh = data.securityHeaders || {};
        const ssl = data.sslCertificate || {};
        const rt = data.responseTime || {};
        const bl = data.brokenLinks || {};

        // 1. Missing Security Headers
        if (sh.headers) {
            const missing = sh.headers.filter(h => !h.present);
            if (missing.length > 0) {
                const missingNames = missing.map(h => h.headerName).join(', ');
                const hasHstsMissing = missing.some(h => h.headerName === 'Strict-Transport-Security');
                const hasCspMissing = missing.some(h => h.headerName === 'Content-Security-Policy');

                issues.push({
                    severity: hasHstsMissing || hasCspMissing ? 'high' : 'medium',
                    icon: '🛡️',
                    pill: hasHstsMissing || hasCspMissing ? 'pill-high' : 'pill-medium',
                    label: hasHstsMissing || hasCspMissing ? 'High Priority' : 'Medium Priority',
                    title: `Missing ${missing.length} Recommended Security Header${missing.length > 1 ? 's' : ''}`,
                    desc: `The server does not transmit: ${missingNames}. This leaves visitors susceptible to clickjacking, protocol downgrade, or cross-site scripting attacks.`,
                    remediation: `Configure your reverse proxy (Nginx, Apache, Caddy, Cloudflare) to transmit Strict-Transport-Security, Content-Security-Policy, and X-Content-Type-Options: nosniff.`
                });
            }
        }

        // 2. SSL Issues
        if (!ssl.httpsUsed) {
            issues.push({
                severity: 'high',
                icon: '🔒',
                pill: 'pill-high',
                label: 'Critical',
                title: 'Plain HTTP Connection Detected',
                desc: 'Website is served without transport encryption (TLS/SSL). Sensitive credentials and traffic can be intercepted in transit.',
                remediation: 'Provision a free TLS certificate via Let\'s Encrypt and enforce automatic 301 redirects from HTTP to HTTPS.'
            });
        } else if (!ssl.valid) {
            issues.push({
                severity: 'high',
                icon: '⚠️',
                pill: 'pill-high',
                label: 'Critical',
                title: `SSL Certificate Invalid (${ssl.status || 'Verification Failed'})`,
                desc: ssl.errorMessage || 'The TLS certificate failed trust validation or is expired. Modern browsers will block users with security warnings.',
                remediation: 'Renew your certificate immediately and ensure the intermediate CA chain is installed correctly.'
            });
        } else if (ssl.daysRemaining !== null && ssl.daysRemaining !== undefined && ssl.daysRemaining <= 30) {
            issues.push({
                severity: 'medium',
                icon: '⏳',
                pill: 'pill-medium',
                label: 'Expiring Soon',
                title: `TLS Certificate Expires in ${ssl.daysRemaining} Days`,
                desc: `Current certificate from ${ssl.issuer || 'CA'} is valid until ${ssl.validUntil || 'soon'}.`,
                remediation: 'Trigger automated renewal via Certbot or your hosting provider before expiration to avoid browser warnings.'
            });
        }

        // 3. Performance / Latency
        if (rt.responseTimeMs !== undefined && rt.responseTimeMs !== null) {
            if (rt.responseTimeMs < 0) {
                issues.push({
                    severity: 'high',
                    icon: '⚡',
                    pill: 'pill-high',
                    label: 'Unreachable',
                    title: 'Server Failed to Respond',
                    desc: rt.httpStatusText || 'Connection attempt timed out or target host refused connection.',
                    remediation: 'Check server availability, DNS resolution, and firewall port 80/443 configurations.'
                });
            } else if (rt.responseTimeMs > 1000) {
                issues.push({
                    severity: 'medium',
                    icon: '⏱️',
                    pill: 'pill-medium',
                    label: 'Latency Warning',
                    title: `Slow Response Latency (${rt.responseTimeMs} ms)`,
                    desc: `Initial server round-trip time is ${rt.responseTimeMs} ms (${rt.classification || 'Slow'}). Slow page response hurts SEO rankings and user engagement.`,
                    remediation: 'Implement edge caching (Cloudflare, Fastly), optimize database queries, and enable HTTP/2 or HTTP/3 server push.'
                });
            }
        }

        // 4. Broken Links
        if (bl.brokenLinks && bl.brokenLinks > 0) {
            issues.push({
                severity: 'medium',
                icon: '🔗',
                pill: 'pill-medium',
                label: 'Link Health',
                title: `Found ${bl.brokenLinks} Broken Anchor Link${bl.brokenLinks > 1 ? 's' : ''}`,
                desc: `${bl.brokenLinks} hyperlink(s) discovered on the scanned page returned 404 or connection errors.`,
                remediation: 'Open the "View Link Table" modal above to identify the dead links and update or remove invalid href targets.'
            });
        }

        // 5. Clean state if zero issues
        if (issues.length === 0) {
            issues.push({
                severity: 'good',
                icon: '✅',
                pill: 'pill-good',
                label: 'Compliant',
                title: 'No Critical Security or Performance Issues Detected',
                desc: 'All monitored HTTP headers are enforced, TLS encryption is pristine, server latency is responsive, and all links are healthy.',
                remediation: 'Maintain current security configurations and monitor certificate renewal cycles regularly.'
            });
            issuesSummaryBadge.textContent = 'All Checks Passed';
            issuesSummaryBadge.style.color = 'var(--cyber-emerald)';
            issuesSummaryBadge.style.borderColor = 'rgba(16, 185, 129, 0.35)';
            issuesSummaryBadge.style.background = 'rgba(16, 185, 129, 0.15)';
        } else {
            issuesSummaryBadge.textContent = `${issues.length} Diagnostic Finding${issues.length > 1 ? 's' : ''}`;
            issuesSummaryBadge.style.color = 'var(--cyber-amber)';
            issuesSummaryBadge.style.borderColor = 'rgba(245, 158, 11, 0.35)';
            issuesSummaryBadge.style.background = 'rgba(245, 158, 11, 0.15)';
        }

        // Render HTML
        issuesList.innerHTML = '';
        issues.forEach(item => {
            const div = document.createElement('div');
            div.className = `issue-item severity-${item.severity}`;
            div.innerHTML = `
                <div class="issue-icon-box">${item.icon}</div>
                <div class="issue-body">
                    <div class="issue-title-row">
                        <span class="issue-title-text">${escapeHtml(item.title)}</span>
                        <span class="issue-pill ${item.pill}">${item.label}</span>
                    </div>
                    <p class="issue-desc">${escapeHtml(item.desc)}</p>
                    <div class="issue-remediation">💡 Recommendation: ${escapeHtml(item.remediation)}</div>
                </div>
            `;
            issuesList.appendChild(div);
        });
    }

    function copyAsciiToClipboard() {
        if (!currentScanData) return;
        const scores = computeBenchmarkScores(currentScanData);
        const text = generateAsciiSummary(scores);

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('Copied ASCII benchmark summary to clipboard!');
                if (copyAsciiBtnText) {
                    copyAsciiBtnText.textContent = 'Copied!';
                    setTimeout(() => { copyAsciiBtnText.textContent = 'Copy ASCII Bars'; }, 2000);
                }
            }).catch(() => {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            showToast('Copied ASCII benchmark summary to clipboard!');
        } catch (e) {
            alert('Could not copy to clipboard.');
        }
        document.body.removeChild(ta);
    }

    function showToast(msg) {
        if (!cyberToast) return;
        cyberToast.textContent = msg;
        cyberToast.classList.remove('hidden');
        clearTimeout(window.__toastTimeout);
        window.__toastTimeout = setTimeout(() => {
            cyberToast.classList.add('hidden');
        }, 2500);
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
        sslDetailDaysRemaining.textContent = ssl.daysRemaining !== null && ssl.daysRemaining !== undefined ? `${ssl.daysRemaining} days` : 'N/A';
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
        fetch(`${API_BASE}/api/scans`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
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
        fetch(`${API_BASE}/api/scans/${id}`)
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

        fetch(`${API_BASE}/api/scans/${id}`, { method: 'DELETE' })
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
        if (modalEl) modalEl.classList.remove('hidden');
    }

    function closeAllModals() {
        if (headersModal) headersModal.classList.add('hidden');
        if (sslModal) sslModal.classList.add('hidden');
        if (linksModal) linksModal.classList.add('hidden');
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
