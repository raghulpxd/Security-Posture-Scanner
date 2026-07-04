function SecurityScoreCard({ scanResult }) {

    const score = scanResult
        ? scanResult.summary.score
        : 0;

    let status = "Poor";

    if (score >= 90)
        status = "Excellent";
    else if (score >= 75)
        status = "Good";
    else if (score >= 50)
        status = "Fair";

    return (

        <div className="bg-[#111827] border border-slate-700 rounded-xl p-6">

            <h2 className="text-lg mb-3">
                Security Score
            </h2>

            <div className="text-6xl font-bold text-cyan-400">

                {score}

            </div>

            <div className="text-2xl mb-5">

                /100

            </div>

            <span className="bg-green-900 text-green-400 px-3 py-1 rounded">

                {status}

            </span>

        </div>

    );

}

export default SecurityScoreCard;