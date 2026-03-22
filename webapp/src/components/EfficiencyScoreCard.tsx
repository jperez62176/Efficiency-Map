
interface EfficiencyScoreCardProps {
  score: number | null;
}

export default function EfficiencyScoreCard({ score }: EfficiencyScoreCardProps) {
  if (score === null) return null;

    // Determine the color based on the score
    let colorClass = "text-green-400";
    let bgClass = "bg-green-400/10 border-green-400/30";
    let message = "Excellent driving!";

    if (score < 80 && score >= 60) {
        colorClass = "text-yellow-400";
        bgClass = "bg-yellow-400/10 border-yellow-400/30";
        message = "Good, but room for improvement.";
    } else if (score < 60) {
        colorClass = "text-red-400";
        bgClass = "bg-red-400/10 border-red-400/30";
        message = "Harsh driving detected.";
    }

    return (
        <div className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 ${bgClass} shadow-lg w-full max-w-sm mx-auto mb-6`}>
            <h2 className="text-gray-300 font-semibold text-lg mb-2">Trip Efficiency Score</h2>
            <div className={`text-6xl font-black ${colorClass}`}>
                {score.toFixed(0)}<span className="text-3xl text-gray-500">/100</span>
            </div>
            <p className={`mt-3 font-medium ${colorClass}`}>{message}</p>
        </div>
    );
}