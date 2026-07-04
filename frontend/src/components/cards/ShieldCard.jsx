import { FiShield } from "react-icons/fi";

function ShieldCard() {
    return (
        <div className="bg-[#111827] rounded-xl border border-slate-700 h-full flex items-center justify-center">

            <div className="text-center">

                <div className="w-36 h-36 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto">

                    <FiShield
                        size={80}
                        className="text-cyan-400"
                    />

                </div>

                <h2 className="mt-6 text-xl font-semibold">
                    Protected
                </h2>

                <p className="text-slate-400 mt-2">
                    Security Status
                </p>

            </div>

        </div>
    );
}

export default ShieldCard;