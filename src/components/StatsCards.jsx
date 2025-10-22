import {
    UserCircleIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
} from "@heroicons/react/24/outline";

export const StatsCards = ({ data }) => {
    
    const facesDetectadas = data.length > 0 ? data[0].pessoas_unicas_ate_agora : 0;
    const emocoesIdentificadas = data.length;
    
    
    const alertas = data.filter(
        (e) => e.comportamento === "potencialmente agressivo" || e.comportamento === "agressivo"
    ).length;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div className="p-6 bg-gray-800 rounded-lg shadow flex flex-col items-center">
                <UserCircleIcon className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-gray-300 text-sm">Pessoas Únicas Detectadas</span>
                <span className="text-3xl font-bold text-white">{facesDetectadas}</span>
            </div>
            
            <div className="p-6 bg-gray-800 rounded-lg shadow flex flex-col items-center">
                <ChartBarIcon className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-gray-300 text-sm">Eventos de Emoção Registrados</span>
                <span className="text-3xl font-bold text-white">{emocoesIdentificadas}</span>
            </div>
            
            <div className="p-6 bg-gray-800 rounded-lg shadow flex flex-col items-center">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-400 mb-2" />
                <span className="text-gray-300 text-sm">Alertas Potenciais (Agressivo)</span>
                <span className="text-3xl font-bold text-red-400">{alertas}</span>
            </div>
        </div>
    );
};