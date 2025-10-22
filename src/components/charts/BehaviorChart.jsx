import { Bar } from "react-chartjs-2";

export const BehaviorChart = ({ data }) => {
    const chartData = {
        labels: data.map((d) => d.name),
        datasets: [
            {
                label: "Comportamentos",
                data: data.map((d) => d.value),
                backgroundColor: ["#22C55E", "#EF4444", "#FACC15"],
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: "Comportamentos Detectados",
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
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="p-4 bg-gray-800 rounded-lg shadow w-full">
            <Bar data={chartData} options={options} />
        </div>
    );
};