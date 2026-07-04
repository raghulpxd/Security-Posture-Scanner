import { useState } from "react";

export default function useScan() {

    const [scanResult, setScanResult] = useState(null);

    return {
        scanResult,
        setScanResult
    };

}