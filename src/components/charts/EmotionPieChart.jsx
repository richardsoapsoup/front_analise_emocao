import { Pie } from "react-chartjs-2";

export const EmotionPieChart = ({ data }) => {
    const chartData = {
        labels: data.map((d) => d.name),
        datasets: [
            {
                data: data.map((d) => d.value),
                backgroundColor: ["#FACC15", "#22C55E", "#EF4444", "#3B82F6", "#F97316", "#C0C0C0", "#800080"],
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "right",
                labels: {
                    color: "white",
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.label || "";
                        if (label) {
                            label += ": ";
                        }
                        const total = context.dataset.data.reduce((acc, value) => acc + value, 0);
                        const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                        
                        if (context.parsed !== null) {
                            label += `${context.parsed} (${percentage}%)`;
                        }
                        return label;
                    },
                },
            },
        },
    };

    return (
        <div className="p-4 bg-gray-800 rounded-lg shadow w-full h-96">
            
            <h2 className="text-lg font-semibold text-white mb-2"> 
                Distribuição de Emoções
            </h2>
            
           
            <div className="h-[calc(100%-2.5rem)] flex items-center justify-center"> 
                <Pie data={chartData} options={options} />
            </div>
        </div>
    );
};