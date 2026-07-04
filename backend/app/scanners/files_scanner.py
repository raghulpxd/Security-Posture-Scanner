import requests


def run_files_scan(url: str):
    try:
        base = url.rstrip("/")

        files_to_check = {
            "robots.txt": f"{base}/robots.txt",
            "security.txt": f"{base}/.well-known/security.txt",
            "sitemap.xml": f"{base}/sitemap.xml",
        }

        results = {}
        issues = []

        for name, file_url in files_to_check.items():
            try:
                r = requests.get(file_url, timeout=8)
                if r.status_code == 200:
                    results[name] = "Present"
                else:
                    results[name] = f"Missing ({r.status_code})"
                    issues.append(f"{name} not found")
            except Exception:
                results[name] = "Error"
                issues.append(f"Could not check {name}")

        return {
            "status": "Passed" if len(issues) == 0 else "Warning",
            "findings": len(issues),
            "files": results,
            "issues": issues,
        }

    except Exception as e:
        return {
            "status": "Failed",
            "findings": 1,
            "files": {},
            "issues": [str(e)],
        }