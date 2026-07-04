function OverviewCard({ title, value, color }) {

    const colors = {
        red: "text-red-400",
        orange: "text-orange-400",
        yellow: "text-yellow-400",
        green: "text-green-400",
        cyan: "text-cyan-400",
    };

    return (
        <div className="bg-[#111827] rounded-xl border border-slate-700 p-5">

            <p className="text-slate-400">
                {title}
            </p>

            <h2 className={`text-4xl font-bold mt-3 ${colors[color]}`}>
                {value}
            </h2>

        </div>
    );
}

export default OverviewCard;