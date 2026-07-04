import { useState } from "react";
import { FiSearch, FiDownload, FiCheck } from "react-icons/fi";
import { ImSpinner2 } from "react-icons/im";

function Topbar({ setScanResult, handleDownloadReport }) {
    const [url, setUrl] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [scanStatus, setScanStatus] = useState("idle"); // idle | scanning | done

    const handleScan = async () => {
        if (!url.trim()) {
            alert("Please enter a website URL.");
            return;
        }

        setIsScanning(true);
        setScanStatus("scanning");

        try {
            const response = await fetch("http://127.0.0.1:8000/scan", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    url: url,
                }),
            });

            const data = await response.json();

            setScanResult(data);
            console.log(data);

            setScanStatus("done");

            // Hide green tick after 2.5 sec
            setTimeout(() => {
                setScanStatus("idle");
            }, 2500);
        } catch (error) {
            console.error(error);
            alert("Backend connection failed.");
            setScanStatus("idle");
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <header className="h-20 bg-[#08111F] border-b border-slate-800 flex items-center justify-between px-8">
            <div className="flex items-center gap-4 w-2/3">
                <div className="relative w-full">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                    <input
                        type="text"
                        placeholder="Enter website URL..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full bg-[#111827] border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-white outline-none focus:border-cyan-500"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleScan}
                        disabled={isScanning}
                        className={`font-semibold px-6 py-3 rounded-lg transition ${
                            isScanning
                                ? "bg-cyan-400 text-black cursor-not-allowed opacity-80"
                                : "bg-cyan-500 hover:bg-cyan-400 text-black"
                        }`}
                    >
                        {isScanning ? "Scanning..." : "Scan"}
                    </button>

                    {/* Scan status icon */}
                    <div className="w-6 h-6 flex items-center justify-center">
                        {scanStatus === "scanning" && (
                            <ImSpinner2 className="text-cyan-400 text-xl animate-spin" />
                        )}

                        {scanStatus === "done" && (
                            <FiCheck className="text-green-400 text-2xl" />
                        )}
                    </div>
                </div>
            </div>

            <button
                onClick={handleDownloadReport}
                className="flex items-center gap-2 border border-slate-700 px-5 py-3 rounded-lg hover:border-cyan-500 transition"
            >
                <FiDownload />
                Download Report
            </button>
        </header>
    );
}

export default Topbar;