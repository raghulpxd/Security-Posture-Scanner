import ssl
import socket
from datetime import datetime


def scan_ssl(domain):

    result = {
        "issuer": "Unknown",
        "expiry": "",
        "days_remaining": 0,
        "valid": False,
        "issues": []
    }

    try:

        context = ssl.create_default_context()

        with socket.create_connection((domain, 443), timeout=5) as sock:

            with context.wrap_socket(sock, server_hostname=domain) as ssock:

                cert = ssock.getpeercert()

        issuer = dict(x[0] for x in cert["issuer"])

        expiry = cert["notAfter"]

        expiry_date = datetime.strptime(
            expiry,
            "%b %d %H:%M:%S %Y %Z"
        )

        days = (expiry_date - datetime.utcnow()).days

        result["issuer"] = issuer.get("organizationName", "Unknown")
        result["expiry"] = expiry
        result["days_remaining"] = days
        result["valid"] = days > 0

        if days < 30:
            result["issues"].append("Certificate expiring soon")

    except Exception as e:

        result["issues"].append(str(e))

    return result