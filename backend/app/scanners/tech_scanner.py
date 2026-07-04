import requests


def run_tech_scan(url: str):
    try:
        response = requests.get(url, timeout=10)
        headers = response.headers
        html = response.text.lower()

        technologies = []

        # Server / infra hints
        server = headers.get("Server")
        if server:
            technologies.append(f"Server: {server}")

        powered_by = headers.get("X-Powered-By")
        if powered_by:
            technologies.append(f"Powered By: {powered_by}")

        # Frontend / framework hints from HTML
        if "react" in html:
            technologies.append("React")
        if "next.js" in html or "_next" in html:
            technologies.append("Next.js")
        if "vue" in html:
            technologies.append("Vue.js")
        if "angular" in html:
            technologies.append("Angular")
        if "jquery" in html:
            technologies.append("jQuery")
        if "bootstrap" in html:
            technologies.append("Bootstrap")
        if "wordpress" in html:
            technologies.append("WordPress")
        if "cloudflare" in html or headers.get("CF-RAY"):
            technologies.append("Cloudflare")

        # Remove duplicates
        technologies = list(dict.fromkeys(technologies))

        issues = []
        if not technologies:
            issues.append("Could not identify major technologies from response")

        return {
            "status": "Passed" if technologies else "Warning",
            "findings": len(issues),
            "technologies": technologies,
            "issues": issues,
        }

    except Exception as e:
        return {
            "status": "Failed",
            "findings": 1,
            "technologies": [],
            "issues": [str(e)],
        }