import DashboardLayout from "./components/layout/DashboardLayout";
import useScan from "./hooks/useScan";

function App() {

    const { scanResult, setScanResult } = useScan();

    return (

        <DashboardLayout
            scanResult={scanResult}
            setScanResult={setScanResult}
        />

    );

}

export default App;