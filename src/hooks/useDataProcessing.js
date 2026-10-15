export const useDataProcessing = (apiData = []) => {
    const emotionCounts = {};
    const behaviorCounts = {};

    apiData.forEach((evento) => {
        const emocao = evento.expressao_dominante || "indefinido";
        const comportamento = evento.comportamento || "indefinido";

        emotionCounts[emocao] = (emotionCounts[emocao] || 0) + 1;
        behaviorCounts[comportamento] = (behaviorCounts[comportamento] || 0) + 1;
    });

    const emotionData = Object.entries(emotionCounts).map(([name, value]) => ({
        name,
        label: name,
        value,
    }));

    const behaviorData = Object.entries(behaviorCounts).map(([name, value]) => ({
        name,
        label: name,
        value,
    }));

    return {
        emotionData,
        behaviorData,
    };
};