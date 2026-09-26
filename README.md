# Web-Based Website Scanner 🛡️

A dynamic, enterprise-grade website security, performance, and health scanning platform built with **Java 17**, **Spring Boot 3.x**, **Spring Data JPA**, **MySQL**, **HTML5**, **CSS3**, and **Vanilla JavaScript**.

---

## 1. Overview & Architecture

The application implements a clean, layered enterprise architecture following SOLID principles:

```
[ Frontend Dashboard (HTML5 / Cyber CSS3 / Vanilla JS) ]
                     │  (Fetch API / JSON)
                     ▼
           [ REST Controller Layer ]
            (ScanController.java)
                     │
                     ▼
             [ Service Layer ]
          (WebsiteScanService.java)
                     │
       ┌─────────────┴─────────────┐
       ▼                           ▼
[ 4 Independent Scanner Modules ] [ Security & Validation ]
 ├── ResponseTimeScanner           └── UrlValidator (SSRF/IP guard)
 ├── SecurityHeaderScanner
 ├── SSLScanner
 └── BrokenLinkScanner
       │                           │
       ▼                           ▼
 [ HTTP/HTTPS Target Network ]    [ Repository Layer (Spring Data JPA) ]
                                   └── Scan, SecurityHeader, BrokenLink
                                           │
                                           ▼
                                [ Database (MySQL / H2) ]
```

### OOP Principles Applied
- **Abstraction & Polymorphism**: A common generic interface `public interface Scanner<T> { T scan(URI uri); }` is implemented by each dedicated scanner (`ResponseTimeScanner`, `SecurityHeaderScanner`, `SSLScanner`, `BrokenLinkScanner`).
- **Separation of Concerns**: Networking, SSRF/IP validation, parsing, domain entities, DTOs, and REST endpoints are isolated into respective packages.
- **Encapsulation**: Domain models and DTOs protect their internal state with getters/setters, custom factories, and validation rules.

---

## 2. Four Independent Scanner Modules

| Module | Responsibility | Key Metrics / Checks |
|---|---|---|
| **Server Response Time** | Measures true round-trip HTTP latency via `System.nanoTime()` | Latency in ms, HTTP Status code (e.g. `200 OK`), Classification (`Fast` <200ms, `Moderate` 200-500ms, `Slow` 500-1000ms, `Very Slow` >1000ms), Final URL |
| **Security Headers** | Audits presence & values of 8 industry-standard security headers | `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy` with detailed purpose explanations |
| **SSL/TLS Certificate** | Verifies X.509 certificate validity and cryptographic handshake | Valid/Expired status, Issuer (e.g. Let's Encrypt), Subject, Valid From / Until, Days Remaining, Hostname match (`✓`/`✗`), HTTP fallback notice |
| **Broken Link Scanner** | Extracts discovered `<a href="...">` anchors and validates reachability | Discovered link count, Working links, Broken links, HTTP status code per link, multi-threaded probe with strict safety bounds |

---

## 3. Database Schema (MySQL)

Run the included `schema.sql` file in your MySQL database:

```sql
CREATE DATABASE IF NOT EXISTS websitescanner CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE websitescanner;

-- 1. Scans Table
CREATE TABLE IF NOT EXISTS scans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(2048) NOT NULL,
    final_url VARCHAR(2048),
    scan_date DATETIME NOT NULL,
    response_time BIGINT,
    http_status INT,
    response_classification VARCHAR(32),
    ssl_status VARCHAR(64),
    ssl_issuer VARCHAR(255),
    ssl_valid_from VARCHAR(64),
    ssl_valid_until VARCHAR(64),
    ssl_days_remaining BIGINT,
    ssl_hostname_match BOOLEAN,
    security_headers_found INT DEFAULT 0,
    security_headers_total INT DEFAULT 0,
    total_links INT DEFAULT 0,
    working_links INT DEFAULT 0,
    broken_links INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Security Headers Table
CREATE TABLE IF NOT EXISTS security_headers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    scan_id BIGINT NOT NULL,
    header_name VARCHAR(128) NOT NULL,
    present BOOLEAN NOT NULL,
    header_value TEXT,
    description VARCHAR(512),
    CONSTRAINT fk_security_headers_scan FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Broken Links Table
CREATE TABLE IF NOT EXISTS broken_links (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    scan_id BIGINT NOT NULL,
    url VARCHAR(2048) NOT NULL,
    status_code INT,
    status VARCHAR(64) NOT NULL,
    CONSTRAINT fk_broken_links_scan FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

---

## 4. Local Setup & Execution

### Prerequisites
- **Java 17+**
- **Apache Maven 3.8+** (or use system maven)
- **MySQL 8.0+** (Optional: embedded H2 is configured out-of-the-box for instant zero-dependency testing)

### Step 1: Clone or Navigate to Project
```bash
cd /path/to/website-scanner
```

### Step 2: Run with Maven
To run with default in-memory database (zero setup):
```bash
mvn spring-boot:run
```

To run with **MySQL**:
1. Make sure MySQL service is running on `localhost:3306`.
2. Configure credentials in environment variables or `src/main/resources/application.yml`:
   ```bash
   export DB_HOST=localhost
   export DB_PORT=3306
   export DB_NAME=websitescanner
   export DB_USER=root
   export DB_PASS=your_password
   ```
3. Run with the MySQL profile:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=mysql
   ```

### Step 3: Run as Packaged Executable JAR
```bash
mvn clean package -DskipTests
java -jar target/website-scanner.jar
```
With MySQL profile:
```bash
java -jar -Dspring.profiles.active=mysql target/website-scanner.jar
```

### Step 4: Access the Application
Open your browser and navigate to:
```
http://localhost:8080
```

---

## 5. Cloud Deployment (Render / Railway / Docker)

The repository includes automated cloud deployment manifests ([`Dockerfile`](file:///Dockerfile), [`render.yaml`](file:///render.yaml), and [`docker-compose.yml`](file:///docker-compose.yml)).

### Option A: 1-Click Deploy on Render (Free Tier)
1. Go to **[render.com](https://render.com)** and sign in with GitHub.
2. Click **New +** → **Blueprint** (or **Web Service**).
3. Connect your GitHub repository: `https://github.com/adisankar20247-lab/oops`.
4. Render automatically detects [`render.yaml`](file:///render.yaml) and the multi-stage [`Dockerfile`](file:///Dockerfile).
5. Click **Apply / Deploy**. Render will build the container and deploy your live scanner on a free `https://<app-name>.onrender.com` URL!

> **Database Note**: The default profile runs with zero-dependency embedded H2 (`SPRING_PROFILES_ACTIVE=h2`). If you provision a managed MySQL database on Render or Aiven, simply add environment variables `SPRING_PROFILES_ACTIVE=mysql`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`.

### Option B: 1-Click Deploy on Railway
1. Go to **[railway.app](https://railway.app)** and log in with GitHub.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select `adisankar20247-lab/oops`.
4. Railway will automatically detect the Dockerfile, build the image, bind the dynamic `$PORT`, and provide a public HTTPS URL.
5. (Optional) To add MySQL on Railway: Click **+ New** → **Database** → **Add MySQL**, then link MySQL variables to your scanner service.

### Option C: Containerized Run with Docker Compose
Run the app and MySQL 8.0 together locally or on a VPS with one command:
```bash
docker compose up --build -d
```
The dashboard will be live at `http://localhost:8080`.

---

## 6. REST API Documentation

### 1. Perform Scan
- **Method:** `POST`
- **Endpoint:** `/api/scan`
- **Headers:** `Content-Type: application/json`

**Example Request:**
```bash
curl -X POST http://localhost:8080/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**Example Response:**
```json
{
  "id": 1,
  "url": "https://example.com",
  "finalUrl": "https://example.com",
  "scanDate": "2026-09-25T20:40:00",
  "responseTime": {
    "responseTimeMs": 142,
    "httpStatusCode": 200,
    "httpStatusText": "200 OK",
    "classification": "Fast",
    "finalUrl": "https://example.com",
    "timestamp": "2026-09-25T20:40:00.123",
    "note": "Measured round-trip server response time."
  },
  "securityHeaders": {
    "foundCount": 6,
    "totalCount": 8,
    "headers": [
      {
        "headerName": "Strict-Transport-Security",
        "present": true,
        "headerValue": "max-age=31536000; includeSubDomains",
        "description": "Enforces HTTPS connections and prevents SSL-stripping man-in-the-middle attacks."
      },
      {
        "headerName": "Content-Security-Policy",
        "present": true,
        "headerValue": "default-src 'self'",
        "description": "Restricts approved sources of scripts and resources to mitigate XSS and injection attacks."
      }
    ],
    "summary": "6 / 8 Present"
  },
  "sslCertificate": {
    "httpsUsed": true,
    "status": "Valid",
    "valid": true,
    "issuer": "DigiCert Global Root G2",
    "subject": "example.com",
    "validFrom": "15/01/2026 00:00",
    "validUntil": "15/01/2027 23:59",
    "daysRemaining": 112,
    "targetHostname": "example.com",
    "hostnameMatch": true,
    "errorMessage": null,
    "signatureAlgorithm": "SHA256withRSA"
  },
  "brokenLinks": {
    "totalLinks": 1,
    "workingLinks": 1,
    "brokenLinks": 0,
    "links": [
      {
        "url": "https://www.iana.org/domains/example",
        "statusCode": 200,
        "status": "Working"
      }
    ],
    "notice": "Checked 1 links discovered on the supplied page (capped at safety limit of 50)."
  }
}
```

### 2. Get Scan History
- **Method:** `GET`
- **Endpoint:** `/api/scans`

### 3. Get Specific Scan Details
- **Method:** `GET`
- **Endpoint:** `/api/scans/{id}`

### 4. Delete Scan Record
- **Method:** `DELETE`
- **Endpoint:** `/api/scans/{id}`

---

## 7. Security & Anti-Abuse Controls

The application enforces strict enterprise-grade security filters (`UrlValidator.java` & `SafeHttpHelper.java`):

1. **Protocol Restrictions**: Only `http://` and `https://` schemes are permitted. Schemes such as `file://`, `ftp://`, `gopher://` are rejected.
2. **SSRF & Private IP Blacklisting**: Blocks loopback (`127.0.0.1`, `localhost`, `::1`), site-local networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local / cloud metadata endpoints (`169.254.169.254`), and CGNAT / multicast ranges.
3. **DNS Re-Validation on Redirects**: Inspects HTTP 3xx `Location` targets before following them. Prevents public servers from redirecting into internal services.
4. **Connection & Read Timeouts**: Hardened 8-second connection and socket read timeouts prevent slowloris and resource exhaustion.
5. **Response Size Limiting**: Caps inbound payload parsing at 2 MB to prevent memory exhaustion / ZIP bombs.
6. **Thread Pool Bounds**: Broken link probes execute with bounded worker thread pools and 30-second total deadline caps.
