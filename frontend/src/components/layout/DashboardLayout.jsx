import { useMemo, useState } from "react";
import axios from "axios";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

import SecurityScoreCard from "../cards/SecurityScoreCard";
import ShieldCard from "../cards/ShieldCard";
import ScanSummaryCard from "../cards/ScanSummaryCard";
import OverviewCard from "../cards/OverviewCard";
import ScannerCard from "../cards/ScannerCard";

function DashboardLayout({ scanResult, setScanResult }) {
    const [showFixPanel, setShowFixPanel] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [chatMessages, setChatMessages] = useState([]);
    const [isFixBotLoading, setIsFixBotLoading] = useState(false);

    const handleDownloadReport = () => {
        if (!scanResult) {
            alert("No scan result available. Please run a scan first.");
            return;
        }

        const reportText = `
==============================
SPScanner Security Report
==============================

Generated On: ${new Date().toLocaleString()}

--------------------------------
SCAN SUMMARY
--------------------------------
Website: ${scanResult.summary?.website || "N/A"}
IP Address: ${scanResult.summary?.ip || "N/A"}
DNS Provider: ${scanResult.summary?.dns_provider || "N/A"}
SSL Issuer: ${scanResult.summary?.ssl_issuer || "N/A"}
Certificate: ${scanResult.summary?.certificate || "N/A"}
Scan Duration: ${scanResult.summary?.scan_duration || "N/A"}

--------------------------------
OVERVIEW
--------------------------------
Critical Issues: ${scanResult.summary?.critical?.count ?? 0}
High Risk Issues: ${scanResult.summary?.high?.count ?? 0}
Medium Risk Issues: ${scanResult.summary?.medium?.count ?? 0}
Low Risk Issues: ${scanResult.summary?.low?.count ?? 0}
Passed Checks: ${scanResult.summary?.passed?.count ?? 0}

--------------------------------
SSL SCANNER
--------------------------------
Status: ${scanResult.ssl?.issues?.length === 0 ? "Passed" : "Warning"}
Findings: ${scanResult.ssl?.issues?.length ?? 0}
Issuer: ${scanResult.ssl?.issuer || "N/A"}
Expires: ${scanResult.ssl?.expiry || "N/A"}
Days Left: ${scanResult.ssl?.days_remaining ?? "N/A"}
Issues:
${scanResult.ssl?.issues?.length ? scanResult.ssl.issues.map((issue) => `- ${issue}`).join("\n") : "None"}

--------------------------------
DNS SCANNER
--------------------------------
Status: ${scanResult.dns?.issues?.length === 0 ? "Passed" : "Warning"}
Findings: ${scanResult.dns?.issues?.length ?? 0}
Provider: ${scanResult.dns?.provider || "N/A"}
NS Records: ${scanResult.dns?.records?.NS?.length ?? 0}
A Records: ${scanResult.dns?.records?.A?.length ?? 0}
Issues:
${scanResult.dns?.issues?.length ? scanResult.dns.issues.map((issue) => `- ${issue}`).join("\n") : "None"}

--------------------------------
HEADER SCANNER
--------------------------------
Status: ${scanResult.headers?.issues?.length === 0 ? "Passed" : "Warning"}
Findings: ${scanResult.headers?.issues?.length ?? 0}
Headers Found: ${scanResult.headers?.headers ? Object.keys(scanResult.headers.headers).length : 0}
Missing: ${scanResult.headers?.issues?.length ?? 0}
Issues:
${scanResult.headers?.issues?.length ? scanResult.headers.issues.map((issue) => `- ${issue}`).join("\n") : "None"}

--------------------------------
PORT SCANNER
--------------------------------
Status: ${scanResult.ports?.issues?.length > 0 ? "Warning" : "Passed"}
Findings: ${scanResult.ports?.issues?.length ?? 0}
IP: ${scanResult.ports?.ip || "N/A"}
Open Ports: ${scanResult.ports?.open_ports?.length
            ? scanResult.ports.open_ports.map((port) => port.port).join(", ")
            : "None"}
Issues:
${scanResult.ports?.issues?.length ? scanResult.ports.issues.map((issue) => `- ${issue}`).join("\n") : "None"}

--------------------------------
TECHNOLOGY SCANNER
--------------------------------
Status: ${scanResult.tech?.status || "Passed"}
Findings: ${scanResult.tech?.findings ?? 0}
Technologies: ${scanResult.tech?.technologies?.length ? scanResult.tech.technologies.join(", ") : "None detected"}
Issues:
${scanResult.tech?.issues?.length ? scanResult.tech.issues.map((issue) => `- ${issue}`).join("\n") : "None"}

--------------------------------
SECURITY FILES SCANNER
--------------------------------
Status: ${scanResult.files?.status || "Passed"}
Findings: ${scanResult.files?.findings ?? 0}
robots.txt: ${scanResult.files?.files?.["robots.txt"] || "Unknown"}
security.txt: ${scanResult.files?.files?.["security.txt"] || "Unknown"}
sitemap.xml: ${scanResult.files?.files?.["sitemap.xml"] || "Unknown"}
Issues:
${scanResult.files?.issues?.length ? scanResult.files.issues.map((issue) => `- ${issue}`).join("\n") : "None"}

==============================
END OF REPORT
==============================
        `;

        const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
        const fileURL = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = fileURL;
        link.download = "sp_scanner_report.txt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(fileURL);
    };

    // -----------------------------
    // Build issue list for Fix Panel
    // -----------------------------
    const scannerIssues = useMemo(() => {
        if (!scanResult) return [];

        const sections = [
            { name: "SSL Scanner", issues: scanResult.ssl?.issues || [] },
            { name: "DNS Scanner", issues: scanResult.dns?.issues || [] },
            { name: "Header Scanner", issues: scanResult.headers?.issues || [] },
            { name: "Port Scanner", issues: scanResult.ports?.issues || [] },
            { name: "Technology Scanner", issues: scanResult.tech?.issues || [] },
            { name: "Security Files Scanner", issues: scanResult.files?.issues || [] },
        ];

        return sections.filter((section) => section.issues.length > 0);
    }, [scanResult]);

    const totalIssues = useMemo(() => {
        return scannerIssues.reduce((sum, section) => sum + section.issues.length, 0);
    }, [scannerIssues]);

    // -----------------------------
    // Suggested fix mapping
    // -----------------------------
    const getFixSuggestion = (issue) => {
        const text = issue.toLowerCase();

        if (text.includes("mx record")) {
            return "If the website uses email, configure a valid MX record in DNS so mail routing works correctly. If email is not required, this can be treated as informational rather than critical.";
        }

        if (text.includes("txt record")) {
            return "Add the required TXT records if needed for SPF, DKIM, DMARC, domain verification, or other security/email configurations.";
        }

        if (text.includes("ns record")) {
            return "Verify that authoritative name server (NS) records are configured correctly at the DNS provider and match the intended domain setup.";
        }

        if (text.includes("cname record")) {
            return "Review whether a CNAME record is required for subdomain routing or third-party service integration. Add it only if the application architecture needs it.";
        }

        if (text.includes("content-security-policy") || text.includes("csp")) {
            return "Add a Content-Security-Policy header to restrict trusted sources for scripts, styles, frames, and other resources. This helps reduce XSS and injection risks.";
        }

        if (text.includes("strict-transport-security") || text.includes("hsts")) {
            return "Add the Strict-Transport-Security header so browsers always use HTTPS for the site and resist downgrade attacks.";
        }

        if (text.includes("x-frame-options")) {
            return "Add the X-Frame-Options header (or use CSP frame-ancestors) to reduce clickjacking risk by controlling whether the site can be embedded in frames.";
        }

        if (text.includes("x-content-type-options")) {
            return "Add X-Content-Type-Options: nosniff so browsers do not MIME-sniff files into unintended content types.";
        }

        if (text.includes("referrer-policy")) {
            return "Add a Referrer-Policy header to control how much referrer information is leaked to external sites.";
        }

        if (text.includes("security.txt")) {
            return "Add a /.well-known/security.txt file so security researchers have a clear, standardized way to report vulnerabilities.";
        }

        if (text.includes("robots.txt")) {
            return "Add a robots.txt file if you want to guide search engine crawlers on which paths should or should not be indexed.";
        }

        if (text.includes("sitemap.xml")) {
            return "Add a sitemap.xml file to improve crawler discovery and indexing of public pages.";
        }

        if (text.includes("open port")) {
            return "Review whether the exposed port is necessary. Close unnecessary ports and restrict access through firewall rules, reverse proxies, or service configuration.";
        }

        if (text.includes("outdated") || text.includes("deprecated")) {
            return "Upgrade or replace outdated technologies/components to supported versions and review them for known vulnerabilities.";
        }

        return "Review this issue manually and validate whether it is actually required for the target website. If it is relevant, apply the appropriate DNS, header, file, or service configuration fix.";
    };

    // -----------------------------
    // Open Fix Panel + seed first bot message
    // -----------------------------
    const handleOpenFixPanel = () => {
        setShowFixPanel(true);

        if (chatMessages.length === 0) {
            const website = scanResult?.summary?.website || scanResult?.url || "this website";

            setChatMessages([
                {
                    role: "bot",
                    text: `I found ${totalIssues} issue${totalIssues !== 1 ? "s" : ""} for ${website}. Ask me how to fix a specific issue, which issue to prioritize, or what a finding means.`,
                },
            ]);
        }
    };

    // -----------------------------
    // Send chat message to Fix Bot backend
    // -----------------------------
    const handleSendFixChat = async () => {
        const trimmed = chatInput.trim();
        if (!trimmed || !scanResult || isFixBotLoading) return;

        const userMessage = { role: "user", text: trimmed };
        setChatMessages((prev) => [...prev, userMessage]);
        setChatInput("");
        setIsFixBotLoading(true);

        try {
            const payload = {
                website: scanResult.summary?.website || scanResult.url || "Unknown website",
                message: trimmed,
                issues: scannerIssues.map((section) => ({
                    scanner: section.name,
                    issues: section.issues,
                })),
            };

            const response = await axios.post("http://127.0.0.1:8000/fix-chat", payload);

            const botReply =
                response?.data?.reply ||
                "I couldn't generate a response for that issue right now.";

            setChatMessages((prev) => [
                ...prev,
                {
                    role: "bot",
                    text: botReply,
                },
            ]);
        } catch (error) {
            console.error("Fix bot request failed:", error);

            setChatMessages((prev) => [
                ...prev,
                {
                    role: "bot",
                    text: "Fix Assistant couldn't reach the backend AI right now. Make sure FastAPI and Ollama are both running locally.",
                },
            ]);
        } finally {
            setIsFixBotLoading(false);
        }
    };

    const handleFixChatKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendFixChat();
        }
    };

    return (
        <div className="flex h-screen bg-[#050B18] text-white">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <Topbar
                    setScanResult={setScanResult}
                    handleDownloadReport={handleDownloadReport}
                />

                <div className="flex-1 flex min-h-0">
                    {/* LEFT: Dashboard */}
                    <main
                        className={`overflow-auto p-6 transition-all duration-300 custom-scrollbar ${
                            showFixPanel ? "w-[68%]" : "w-full"
                        }`}
                    >
                        {/* First Row */}
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-4">
                                <SecurityScoreCard scanResult={scanResult} />
                            </div>

                            <div className="col-span-3">
                                <ShieldCard />
                            </div>

                            <div className="col-span-5">
                                <ScanSummaryCard scanResult={scanResult} />
                            </div>
                        </div>

                        {/* Second Row */}
                        <div className="grid grid-cols-5 gap-6 mt-6">
                            <OverviewCard
                                title="Critical Issues"
                                value={scanResult ? scanResult.summary.critical.count : 0}
                                color="red"
                            />

                            <OverviewCard
                                title="High Risk Issues"
                                value={scanResult ? scanResult.summary.high.count : 0}
                                color="orange"
                            />

                            <OverviewCard
                                title="Medium Risk Issues"
                                value={scanResult ? scanResult.summary.medium.count : 0}
                                color="yellow"
                            />

                            <OverviewCard
                                title="Low Risk Issues"
                                value={scanResult ? scanResult.summary.low.count : 0}
                                color="green"
                            />

                            <OverviewCard
                                title="Passed Checks"
                                value={scanResult ? scanResult.summary.passed.count : 0}
                                color="cyan"
                            />
                        </div>

                        {/* Third Row */}
                        <div className="grid grid-cols-2 gap-6 mt-6">
                            <ScannerCard
                                title="SSL Scanner"
                                status={
                                    scanResult
                                        ? scanResult.ssl.issues.length === 0
                                            ? "Passed"
                                            : "Warning"
                                        : "Passed"
                                }
                                findings={scanResult ? scanResult.ssl.issues.length : 0}
                                details={
                                    scanResult
                                        ? {
                                              Issuer: scanResult.ssl.issuer,
                                              Expires: scanResult.ssl.expiry,
                                              "Days Left": scanResult.ssl.days_remaining,
                                          }
                                        : {}
                                }
                                issues={scanResult ? scanResult.ssl.issues : []}
                            />

                            <ScannerCard
                                title="DNS Scanner"
                                status={
                                    scanResult
                                        ? scanResult.dns.issues.length === 0
                                            ? "Passed"
                                            : "Warning"
                                        : "Passed"
                                }
                                findings={scanResult ? scanResult.dns.issues.length : 0}
                                details={
                                    scanResult
                                        ? {
                                              Provider: scanResult.dns.provider,
                                              "NS Records": scanResult.dns.records.NS.length,
                                              "A Records": scanResult.dns.records.A.length,
                                          }
                                        : {}
                                }
                                issues={scanResult ? scanResult.dns.issues : []}
                            />

                            <ScannerCard
                                title="Header Scanner"
                                status={
                                    scanResult
                                        ? scanResult.headers.issues.length === 0
                                            ? "Passed"
                                            : "Warning"
                                        : "Passed"
                                }
                                findings={scanResult ? scanResult.headers.issues.length : 0}
                                details={
                                    scanResult
                                        ? {
                                              "Headers Found": Object.keys(scanResult.headers.headers).length,
                                              Missing: scanResult.headers.issues.length,
                                          }
                                        : {}
                                }
                                issues={scanResult ? scanResult.headers.issues : []}
                            />

                            <ScannerCard
                                title="Port Scanner"
                                status={
                                    scanResult
                                        ? scanResult.ports.issues && scanResult.ports.issues.length > 0
                                            ? "Warning"
                                            : "Passed"
                                        : "Passed"
                                }
                                findings={
                                    scanResult
                                        ? scanResult.ports.issues
                                            ? scanResult.ports.issues.length
                                            : 0
                                        : 0
                                }
                                details={
                                    scanResult
                                        ? {
                                              IP: scanResult.ports.ip,
                                              "Open Ports": scanResult.ports.open_ports
                                                  .map((port) => port.port)
                                                  .join(", "),
                                          }
                                        : {}
                                }
                                issues={
                                    scanResult && scanResult.ports.issues
                                        ? scanResult.ports.issues
                                        : []
                                }
                            />

                            <ScannerCard
                                title="Technology Scanner"
                                status={scanResult ? scanResult.tech?.status || "Passed" : "Passed"}
                                findings={scanResult ? scanResult.tech?.findings || 0 : 0}
                                details={
                                    scanResult
                                        ? {
                                              Technologies:
                                                  scanResult.tech?.technologies?.length > 0
                                                      ? scanResult.tech.technologies.join(", ")
                                                      : "None detected",
                                          }
                                        : {}
                                }
                                issues={scanResult && scanResult.tech?.issues ? scanResult.tech.issues : []}
                            />

                            <ScannerCard
                                title="Security Files Scanner"
                                status={scanResult ? scanResult.files?.status || "Passed" : "Passed"}
                                findings={scanResult ? scanResult.files?.findings || 0 : 0}
                                details={
                                    scanResult
                                        ? {
                                              "robots.txt": scanResult.files?.files?.["robots.txt"] || "Unknown",
                                              "security.txt": scanResult.files?.files?.["security.txt"] || "Unknown",
                                              "sitemap.xml": scanResult.files?.files?.["sitemap.xml"] || "Unknown",
                                          }
                                        : {}
                                }
                                issues={scanResult && scanResult.files?.issues ? scanResult.files.issues : []}
                            />
                        </div>
                    </main>

                    {/* RIGHT: Fix Assistant Panel */}
                    {showFixPanel && (
                        <aside className="w-[32%] min-w-[380px] border-l border-slate-800 bg-[#0b1220] flex flex-col">
                            {/* Header */}
                            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">Fix Assistant</h2>
                                    <p className="text-sm text-slate-400 mt-1">
                                        Review detected issues and ask the remediation bot
                                    </p>
                                </div>

                                <button
                                    onClick={() => setShowFixPanel(false)}
                                    className="text-slate-400 hover:text-white text-xl"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Scrollable content */}
                            <div className="flex-1 overflow-auto p-5 space-y-6 custom-scrollbar">
                                {/* Detected Issues */}
                                <div className="bg-[#111827] border border-slate-700 rounded-xl p-4">
                                    <h3 className="text-xl font-bold mb-3">Detected Issues</h3>

                                    {scannerIssues.length === 0 ? (
                                        <p className="text-green-400">No issues detected.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {scannerIssues.map((section) => (
                                                <div key={section.name}>
                                                    <h4 className="font-semibold text-cyan-400 mb-2">
                                                        {section.name}
                                                    </h4>

                                                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                                                        {section.issues.map((issue, idx) => (
                                                            <li key={idx}>{issue}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Suggested Fixes */}
                                <div className="bg-[#111827] border border-slate-700 rounded-xl p-4">
                                    <h3 className="text-xl font-bold mb-3">Suggested Fixes</h3>

                                    {scannerIssues.length === 0 ? (
                                        <p className="text-slate-400">No remediation suggestions needed.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {scannerIssues.map((section) => (
                                                <div key={`${section.name}-fixes`}>
                                                    <h4 className="font-semibold text-cyan-400 mb-2">
                                                        {section.name}
                                                    </h4>

                                                    <div className="space-y-3">
                                                        {section.issues.map((issue, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="bg-[#0f172a] border border-slate-700 rounded-lg p-3"
                                                            >
                                                                <p className="font-medium text-white mb-2">
                                                                    {issue}
                                                                </p>
                                                                <p className="text-sm text-slate-300 leading-6">
                                                                    {getFixSuggestion(issue)}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Real Fix Bot Chat */}
                                <div className="bg-[#111827] border border-slate-700 rounded-xl p-4">
                                    <h3 className="text-xl font-bold mb-3">Ask the Fix Bot</h3>
                                    <p className="text-sm text-slate-400 mb-4">
                                        Ask follow-up questions about the current scan findings, remediation steps, or which issue to fix first.
                                    </p>

                                    <div className="bg-[#0f172a] border border-slate-700 rounded-lg p-3 min-h-[220px] max-h-[420px] overflow-auto custom-scrollbar space-y-3">
                                        {chatMessages.length === 0 ? (
                                            <div className="text-sm text-slate-300">
                                                <p className="text-cyan-400 font-medium mb-2">Fix Bot</p>
                                                <p>
                                                    Open the assistant and ask things like:
                                                </p>
                                                <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
                                                    <li>How do I fix the header issues?</li>
                                                    <li>Which issue should I prioritize first?</li>
                                                    <li>Is the missing MX record actually critical?</li>
                                                </ul>
                                            </div>
                                        ) : (
                                            chatMessages.map((msg, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`flex ${
                                                        msg.role === "user" ? "justify-end" : "justify-start"
                                                    }`}
                                                >
                                                    <div
                                                        className={`max-w-[90%] rounded-xl px-4 py-3 text-sm leading-6 whitespace-pre-wrap ${
                                                            msg.role === "user"
                                                                ? "bg-cyan-500 text-black font-medium"
                                                                : "bg-[#111827] border border-slate-700 text-slate-100"
                                                        }`}
                                                    >
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            ))
                                        )}

                                        {isFixBotLoading && (
                                            <div className="flex justify-start">
                                                <div className="max-w-[90%] rounded-xl px-4 py-3 text-sm leading-6 bg-[#111827] border border-slate-700 text-slate-300">
                                                    Fix Bot is thinking...
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex gap-3">
                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyDown={handleFixChatKeyDown}
                                            placeholder="Ask how to fix a specific issue..."
                                            className="flex-1 bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-cyan-500"
                                        />

                                        <button
                                            onClick={handleSendFixChat}
                                            disabled={isFixBotLoading || !chatInput.trim()}
                                            className={`font-semibold px-5 rounded-lg transition ${
                                                isFixBotLoading || !chatInput.trim()
                                                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                                    : "bg-cyan-500 hover:bg-cyan-400 text-black"
                                            }`}
                                        >
                                            Send
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    )}
                </div>

                {/* Floating Fix Button */}
                {scanResult && totalIssues > 0 && !showFixPanel && (
                    <button
                        onClick={handleOpenFixPanel}
                        className="fixed bottom-6 right-6 z-50 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3 rounded-full shadow-lg transition"
                    >
                        Fix Issues ({totalIssues})
                    </button>
                )}
            </div>
        </div>
    );
}

export default DashboardLayout;