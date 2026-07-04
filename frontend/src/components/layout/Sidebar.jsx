import {
  FiHome,
  FiSearch,
  FiFileText,
  FiActivity,
  FiSettings,
  FiKey,
  FiShield
} from "react-icons/fi";

function Sidebar() {
    const menuItems = [
        { icon: <FiHome />, label: "Dashboard" },
        { icon: <FiSearch />, label: "Scan Now" },
        { icon: <FiFileText />, label: "Scan History" },
        { icon: <FiActivity />, label: "Monitoring" },
        { icon: <FiSettings />, label: "Settings" },
        { icon: <FiKey />, label: "API Access" }
    ];

    return (
        <aside className="w-80 bg-[#08111F] border-r border-slate-800 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <FiShield className="text-cyan-400 text-3xl" />

                    <div>
                        <h1 className="font-bold text-xl">SPScanner</h1>

                        <p className="text-sm text-slate-400">
                            Security Posture Scanner
                        </p>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <div className="flex-1 p-5">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        className={`w-full flex items-center gap-3 p-3 mb-2 rounded-lg transition ${
                            index === 0
                                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                : "text-slate-300 hover:bg-slate-800 hover:text-cyan-400"
                        }`}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </div>
        </aside>
    );
}

export default Sidebar;