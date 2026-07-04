def calculate_score(dns, ssl, headers, ports, tech, files):
    summary = {
        "score": 100,

        "critical": {
            "count": 0,
            "issues": []
        },

        "high": {
            "count": 0,
            "issues": []
        },

        "medium": {
            "count": 0,
            "issues": []
        },

        "low": {
            "count": 0,
            "issues": []
        },

        "passed": {
            "count": 0,
            "checks": []
        }
    }

    # -------------------------
    # SSL SCANNER
    # -------------------------
    if ssl.get("valid"):
        summary["passed"]["count"] += 1
        summary["passed"]["checks"].append("SSL Certificate is valid")
    else:
        summary["high"]["count"] += 1
        summary["high"]["issues"].append("SSL Certificate is invalid or expired")

    # -------------------------
    # DNS SCANNER
    # Softer rules:
    # - Missing A -> High
    # - Missing NS -> Medium
    # - Missing MX -> Low
    # - Missing TXT -> Low
    # - Missing CNAME -> no penalty
    # -------------------------
    dns_records = dns.get("records", {})
    dns_issues = dns.get("issues", [])

    for issue in dns_issues:
        issue_upper = issue.upper()

        if "A RECORD" in issue_upper:
            summary["high"]["count"] += 1
            summary["high"]["issues"].append(issue)

        elif "NS RECORD" in issue_upper:
            summary["medium"]["count"] += 1
            summary["medium"]["issues"].append(issue)

        elif "MX RECORD" in issue_upper:
            summary["low"]["count"] += 1
            summary["low"]["issues"].append(issue)

        elif "TXT RECORD" in issue_upper:
            summary["low"]["count"] += 1
            summary["low"]["issues"].append(issue)

    if dns_records.get("NS"):
        summary["passed"]["count"] += 1
        summary["passed"]["checks"].append("NS Record Found")

    if dns_records.get("A"):
        summary["passed"]["count"] += 1
        summary["passed"]["checks"].append("A Record Found")

    if dns_records.get("MX"):
        summary["passed"]["count"] += 1
        summary["passed"]["checks"].append("MX Record Found")

    if dns_records.get("TXT"):
        summary["passed"]["count"] += 1
        summary["passed"]["checks"].append("TXT Record Found")

    if dns_records.get("CNAME"):
        summary["passed"]["count"] += 1
        summary["passed"]["checks"].append("CNAME Record Found")

    # -------------------------
    # HEADER SCANNER
    # Softer rules:
    # - Missing CSP / HSTS -> High
    # - Everything else missing -> Medium
    # -------------------------
    header_issues = headers.get("issues", [])
    header_values = headers.get("headers", {})

    for issue in header_issues:
        issue_lower = issue.lower()

        if "content-security-policy" in issue_lower:
            summary["high"]["count"] += 1
            summary["high"]["issues"].append(issue)

        elif "strict-transport-security" in issue_lower:
            summary["high"]["count"] += 1
            summary["high"]["issues"].append(issue)

        else:
            summary["medium"]["count"] += 1
            summary["medium"]["issues"].append(issue)

    for header, value in header_values.items():
        if value:
            summary["passed"]["count"] += 1
            summary["passed"]["checks"].append(f"{header} Present")

    # -------------------------
    # PORT SCANNER
    # Softer rules:
    # - Dangerous ports -> High
    # - Common web ports (80,443) -> Passed
    # - Other open ports -> Low
    # -------------------------
    open_ports = ports.get("open_ports", [])

    for port_data in open_ports:
        p = port_data.get("port")

        if p in [21, 23, 3389]:
            summary["high"]["count"] += 1
            summary["high"]["issues"].append(f"Port {p} is open")

        elif p in [80, 443]:
            summary["passed"]["count"] += 1
            summary["passed"]["checks"].append(f"Port {p} is open")

        else:
            summary["low"]["count"] += 1
            summary["low"]["issues"].append(f"Port {p} is open")

    # -------------------------
    # TECHNOLOGY SCANNER
    # Softer rule:
    # - If tech found -> passed
    # - If not found -> no penalty
    # -------------------------
    technologies = tech.get("technologies", [])

    if technologies:
        summary["passed"]["count"] += 1
        summary["passed"]["checks"].append("Technology stack identified")

    # -------------------------
    # SECURITY FILES SCANNER
    # Softer rules:
    # - security.txt missing -> Low
    # - robots.txt missing -> no penalty
    # - sitemap.xml missing -> no penalty
    # -------------------------
    files_map = files.get("files", {})

    robots_status = files_map.get("robots.txt", "")
    security_status = files_map.get("security.txt", "")
    sitemap_status = files_map.get("sitemap.xml", "")

    if robots_status == "Present":
        summary["passed"]["count"] += 1
        summary["passed"]["checks"].append("robots.txt Present")

    if security_status == "Present":
        summary["passed"]["count"] += 1
        summary["passed"]["checks"].append("security.txt Present")
    else:
        summary["low"]["count"] += 1
        summary["low"]["issues"].append("security.txt not found")

    if sitemap_status == "Present":
        summary["passed"]["count"] += 1
        summary["passed"]["checks"].append("sitemap.xml Present")

    # -------------------------
    # FINAL SCORE CALCULATION
    # Softer penalties
    # -------------------------
    summary["score"] -= summary["critical"]["count"] * 12
    summary["score"] -= summary["high"]["count"] * 6
    summary["score"] -= summary["medium"]["count"] * 3
    summary["score"] -= summary["low"]["count"] * 1

    if summary["score"] < 0:
        summary["score"] = 0

    return summary