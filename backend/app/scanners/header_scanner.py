import requests


def scan_headers(url):

    result = {
        "headers": {},
        "issues": []
    }

    security_headers = [
        "Content-Security-Policy",
        "Strict-Transport-Security",
        "X-Frame-Options",
        "X-Content-Type-Options",
        "Referrer-Policy"
    ]

    try:

        response = requests.get(url, timeout=10)

        for header in security_headers:

            value = response.headers.get(header)

            result["headers"][header] = value

            if value is None:
                result["issues"].append(f"Missing {header}")

    except Exception as e:

        result["issues"].append(str(e))

    return result