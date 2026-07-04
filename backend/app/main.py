from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time
import requests

from app.scanners.dns_scanner import scan_dns
from app.scanners.ssl_scanner import scan_ssl
from app.scanners.header_scanner import scan_headers
from app.scanners.port_scanner import scan_ports
from app.scanners.tech_scanner import run_tech_scan
from app.scanners.files_scanner import run_files_scan

from app.scoring.security_score import calculate_score

app = FastAPI(
    title="SPScanner API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# EXISTING SCAN REQUEST MODEL
# -----------------------------
class ScanRequest(BaseModel):
    url: str


# -----------------------------
# FIX CHAT REQUEST MODELS
# -----------------------------
class IssueGroup(BaseModel):
    scanner: str
    issues: list[str]


class FixChatRequest(BaseModel):
    website: str
    message: str
    issues: list[IssueGroup]


@app.get("/")
def home():
    return {"message": "SPScanner Backend Running"}


# -----------------------------
# EXISTING SCAN ENDPOINT
# -----------------------------
@app.post("/scan")
def scan(request: ScanRequest):
    start_time = time.time()

    domain = (
        request.url
        .replace("https://", "")
        .replace("http://", "")
        .split("/")[0]
    )

    dns_result = scan_dns(domain)
    ssl_result = scan_ssl(domain)
    header_result = scan_headers(request.url)
    port_result = scan_ports(domain)
    tech_result = run_tech_scan(request.url)
    files_result = run_files_scan(request.url)

    summary = calculate_score(
        dns_result,
        ssl_result,
        header_result,
        port_result,
        tech_result,
        files_result
    )

    end_time = time.time()
    scan_duration = round(end_time - start_time, 2)

    summary["scan_duration"] = f"{scan_duration} s"

    return {
        "url": request.url,
        "summary": summary,
        "dns": dns_result,
        "ssl": ssl_result,
        "headers": header_result,
        "ports": port_result,
        "tech": tech_result,
        "files": files_result
    }


# -----------------------------
# HELPER: FORMAT ISSUES FOR PROMPT
# -----------------------------
def format_issues_for_prompt(issue_groups: list[IssueGroup]) -> str:
    if not issue_groups:
        return "No issues were provided."

    lines = []
    for group in issue_groups:
        if group.issues:
            lines.append(f"{group.scanner}:")
            for issue in group.issues:
                lines.append(f"- {issue}")
            lines.append("")

    return "\n".join(lines).strip()


# -----------------------------
# HELPER: ASK OLLAMA MISTRAL
# -----------------------------
def ask_mistral_fix_bot(website: str, user_message: str, issue_groups: list[IssueGroup]) -> str:
    formatted_issues = format_issues_for_prompt(issue_groups)

    system_prompt = """
You are SPScanner Fix Assistant, a cybersecurity remediation assistant inside a website security dashboard.

You must answer ONLY about the issues detected in the current scan.
Your answers must be short, structured, and practical.

Strict response rules:
1. Keep the entire answer under 180 words unless the user explicitly asks for detailed explanation.
2. Do not give huge examples, full header values, full CSP policies, or documentation dumps unless the user explicitly asks for an example.
3. Focus only on:
   - what the issue means
   - why it matters
   - how to fix it
4. Prefer bullet points or short numbered steps.
5. If the issue is informational rather than critical, say that clearly in one line.
6. If the user asks something unrelated to the current scan findings, say you can only help with the current dashboard issues.
"""

    user_prompt = f"""
Website scanned:
{website}

Current scan findings:
{formatted_issues}

User question:
{user_message}

Required answer format:
Issue / Scanner:
Meaning:
Why it matters:
Fix:
1.
2.
3.

Keep it compact. Do not include long examples unless the user explicitly asks for one.
"""

    payload = {
        "model": "mistral",
        "stream": False,
        "messages": [
            {"role": "system", "content": system_prompt.strip()},
            {"role": "user", "content": user_prompt.strip()}
        ]
    }

    try:
        response = requests.post(
            "http://localhost:11434/api/chat",
            json=payload,
            timeout=120
        )
        response.raise_for_status()

        data = response.json()

        reply = data.get("message", {}).get("content", "").strip()

        if not reply:
            return "I couldn't generate a remediation response from the local AI model."

        return reply

    except requests.exceptions.ConnectionError:
        return "Could not connect to Ollama. Make sure Ollama is running locally and the Mistral model is available."
    except requests.exceptions.Timeout:
        return "The local AI model took too long to respond. Try asking a shorter question or retry in a moment."
    except Exception as e:
        return f"Fix Assistant backend error: {str(e)}"


# -----------------------------
# NEW FIX CHAT ENDPOINT
# -----------------------------
@app.post("/fix-chat")
def fix_chat(request: FixChatRequest):
    reply = ask_mistral_fix_bot(
        website=request.website,
        user_message=request.message,
        issue_groups=request.issues
    )

    return {
        "reply": reply
    }