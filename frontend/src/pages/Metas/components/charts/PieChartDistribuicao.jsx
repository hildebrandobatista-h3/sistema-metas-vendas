import { useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
];

export default function PieChartDistribuicao({ produtos = [] }) {
  const chartData = useMemo(() => {
    if (!produtos.length) return null;

    const realizadoComValor = produtos.filter((p) => p.realizado > 0);
    if (!realizadoComValor.length) return null;

    return {
      labels: realizadoComValor.map((p) => p.nome),
      datasets: [
        {
          data: realizadoComValor.map((p) => p.realizado),
          backgroundColor: COLORS.slice(0, realizadoComValor.length),
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    };
  }, [produtos]);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 12,
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: "Distribuição do Realizado",
        font: { size: 14, weight: "bold" },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `R$ ${context.parsed.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} (${percentage}%)`;
          },
        },
      },
    },
  };

  if (!chartData) return <div className="text-center text-gray-500">Sem dados para exibir</div>;

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <Pie data={chartData} options={options} height={300} />
    </div>
  );
}
