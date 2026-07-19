import { useMemo } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function LineChartTendencia({ historico = [] }) {
  const chartData = useMemo(() => {
    if (!historico || historico.length === 0) return null;

    return {
      labels: historico.map((h) => {
        const [, , dia] = h.data.split("-");
        return `${dia}`;
      }),
      datasets: [
        {
          label: "Meta Esperada",
          data: historico.map((h) => h.meta),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 2,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: "#3b82f6",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          tension: 0.4,
        },
        {
          label: "Realizado",
          data: historico.map((h) => h.realizado),
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderWidth: 2,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: "#10b981",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          tension: 0.4,
        },
      ],
    };
  }, [historico]);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: "Tendência (Últimos 30 dias)",
        font: { size: 14, weight: "bold" },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "R$ " + value.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
          },
        },
      },
    },
  };

  if (!chartData) return <div className="text-center text-gray-500">Sem dados para exibir</div>;

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <Line data={chartData} options={options} height={300} />
    </div>
  );
}
