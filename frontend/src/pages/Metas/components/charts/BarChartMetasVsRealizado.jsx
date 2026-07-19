import { useMemo } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChartMetasVsRealizado({ produtos = [] }) {
  const chartData = useMemo(() => {
    if (!produtos.length) return null;

    return {
      labels: produtos.map((p) => p.nome),
      datasets: [
        {
          label: "Meta",
          data: produtos.map((p) => p.meta),
          backgroundColor: "#3b82f6",
          borderColor: "#1e40af",
          borderWidth: 1,
        },
        {
          label: "Realizado",
          data: produtos.map((p) => p.realizado),
          backgroundColor: "#10b981",
          borderColor: "#059669",
          borderWidth: 1,
        },
      ],
    };
  }, [produtos]);

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
        text: "Meta vs Realizado",
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
      <Bar data={chartData} options={options} height={300} />
    </div>
  );
}
