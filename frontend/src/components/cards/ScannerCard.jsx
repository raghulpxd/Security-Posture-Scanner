function ScannerCard({ title, status, findings, details = {}, issues = [] }) {
    const statusColor =
        status === "Passed"
            ? "text-green-400"
            : status === "Warning"
            ? "text-yellow-400"
            : "text-red-400";

    return (
        <div className="bg-[#111827] border border-slate-700 rounded-xl p-6 min-h-[220px]">
            <h3 className="text-3xl font-bold mb-4">{title}</h3>

            <p className={`font-semibold text-xl ${statusColor}`}>{status}</p>
            <p className="text-slate-400 mt-2 mb-4">Findings : {findings}</p>

            <div className="space-y-1 mb-4">
                {Object.entries(details).map(([key, value]) => (
                    <p key={key} className="text-lg">
                        <span className="font-semibold">{key}:</span> {String(value)}
                    </p>
                ))}
            </div>

            <div className="mt-4">
                <h4 className="font-semibold text-lg mb-2">Issues:</h4>

                {issues.length === 0 ? (
                    <p className="text-green-400">None</p>
                ) : (
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {issues.map((issue, index) => (
                            <li key={index}>{issue}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default ScannerCard;