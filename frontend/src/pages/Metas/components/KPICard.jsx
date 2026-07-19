export default function KPICard({ label, value, percentual, trend, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    green: "bg-green-50 border-green-200 text-green-900",
    purple: "bg-purple-50 border-purple-200 text-purple-900",
  };

  const progressClasses = {
    blue: "bg-blue-400",
    green: "bg-green-400",
    purple: "bg-purple-400",
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="text-sm font-medium opacity-80">{label}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>

      {/* Progress Bar */}
      <div className="w-full bg-white rounded-full h-2 mt-3 overflow-hidden">
        <div
          className={`h-full ${progressClasses[color]} transition-all duration-300`}
          style={{ width: `${Math.min(percentual, 100)}%` }}
        />
      </div>

      <div className="text-xs opacity-75 mt-2">
        {percentual.toFixed(1)}% {trend && <span className="ml-1">{trend}</span>}
      </div>
    </div>
  );
}
