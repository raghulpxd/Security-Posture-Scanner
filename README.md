# SPScanner

SPScanner is a web-based Security Posture Scanner that analyzes a target website and provides a dashboard of security findings across multiple scanner modules. It also includes a local AI-powered Fix Assistant chatbot that helps explain detected issues and suggests remediation steps.

---

# Features

## Scanner Modules
SPScanner currently includes the following scanners:

- **SSL Scanner** – checks SSL certificate details and related issues
- **DNS Scanner** – checks DNS records and DNS-related findings
- **Header Scanner** – checks important HTTP security headers
- **Port Scanner** – checks exposed/open ports
- **Technology Scanner** – detects technologies/frameworks used by the website
- **Security Files Scanner** – checks for files such as `robots.txt`, `security.txt`, and `sitemap.xml`

## Dashboard Features
- Security score overview
- Risk breakdown (Critical / High / Medium / Low / Passed)
- Detailed scanner cards
- Downloadable scan report
- AI-powered Fix Assistant chatbot for remediation guidance

---

# Tech Stack

## Frontend
- React
- Vite
- Tailwind CSS

## Backend
- FastAPI
- Python

## AI Fix Assistant
- Ollama
- Mistral model

---

# Project Structure

```text
SPScanner/
│
├── backend/
│   ├── app/
│   │   ├── scanners/
│   │   ├── scoring/
│   │   └── main.py
│   └── ...
│
├── frontend/
│   └── web-app/
│       ├── src/
│       ├── package.json
│       └── ...
│
└── README.md