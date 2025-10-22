import { Bar } from "react-chartjs-2";

export const EmotionBarChart = ({ data }) => {
    const chartData = {
        labels: data.map((d) => d.name),
        datasets: [
            {
                label: "Quantidade",
                data: data.map((d) => d.value),
                backgroundColor: [
                    "#F97316",
                    "#3B82F6",
                    "#EF4444",
                    "#22C55E",
                    "#FACC15",
                ],
            },
        ],
    };

    const options = {
        indexAxis: "y", 
        responsive: true,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: "Emoções Detectadas (Contagem Total)",
                color: "white",
                font: { size: 16 },
            },
        },
        scales: {
            x: {
                ticks: { color: "white" },
                grid: { color: "#444" },
            },
            y: {
                ticks: { color: "white" },
                grid: { color: "#444" },
            },
        },
    };

    return (
        <div className="p-4 bg-gray-800 rounded-lg shadow w-full">
            <Bar data={chartData} options={options} />
        </div>
    );
};