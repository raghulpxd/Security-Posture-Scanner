function ScanSummaryCard({ scanResult }) {
  if (!scanResult) {
    return (
      <div className="bg-[#111827] rounded-xl border border-slate-700 p-6">
        <h2 className="text-2xl font-bold mb-6">Scan Summary</h2>

        <p className="text-slate-400">
          Scan a website to view results.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] rounded-xl border border-slate-700 p-6">
      <h2 className="text-2xl font-bold mb-6">Scan Summary</h2>

      <div className="space-y-4">
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Website</span>
          <span className="text-right break-all">{scanResult.url}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">IP Address</span>
          <span>{scanResult.ports?.ip || "N/A"}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">DNS Provider</span>
          <span>{scanResult.dns?.provider || "Unknown"}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">SSL Issuer</span>
          <span>{scanResult.ssl?.issuer || "N/A"}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">Certificate</span>
          <span>{scanResult.ssl?.valid ? "Valid" : "Invalid"}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">Scan Duration</span>
          <span>{scanResult.summary?.scan_duration || "N/A"}</span>
        </div>
      </div>
    </div>
  );
}

export default ScanSummaryCard;