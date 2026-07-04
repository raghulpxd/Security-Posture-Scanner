import dns.resolver


PROVIDERS = {
    "domaincontrol.com": "GoDaddy",
    "cloudflare.com": "Cloudflare",
    "awsdns": "AWS Route53",
    "googledomains.com": "Google Domains",
    "azure-dns.com": "Azure DNS",
    "google.com": "Google Cloud DNS",
}


def detect_provider(ns_records):

    for record in ns_records:

        lower = record.lower()

        for keyword, provider in PROVIDERS.items():

            if keyword in lower:
                return provider

    return "Unknown"


def scan_dns(domain):

    result = {
        "provider": "Unknown",
        "records": {},
        "issues": []
    }

    record_types = [
        "NS",
        "A",
        "MX",
        "TXT",
        "CNAME"
    ]

    for record in record_types:

        try:

            answers = dns.resolver.resolve(domain, record)

            result["records"][record] = [
                str(answer)
                for answer in answers
            ]

        except Exception:

            result["records"][record] = []

            result["issues"].append(
                f"{record} record not found"
            )

    result["provider"] = detect_provider(
        result["records"]["NS"]
    )

    return result