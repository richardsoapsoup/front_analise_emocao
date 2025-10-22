import { useMemo } from 'react';

/**
 *
 * @param {Array} apiData 
 * @returns {Object} 
 */
export const useDataProcessing = (apiData) => {
    return useMemo(() => {
        if (!apiData || apiData.length === 0) {
            return { emotionData: [], behaviorData: [] };
        }

        const emotionCounts = {};
        const behaviorCounts = {};

        apiData.forEach((event) => {
            
            const emotion = event.expressao_dominante;
            if(emotion) emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;

            
            let behavior;
            if (event.comportamento === "potencialmente agressivo" || event.comportamento === "agressivo") {
                behavior = "Agressivo";
            } else if (event.comportamento === "depressivo" || event.comportamento === "sad") {
                behavior = "Negativo/Triste";
            } else {
                behavior = "Neutro/Positivo";
            }
            if(event.comportamento) behaviorCounts[behavior] = (behaviorCounts[behavior] || 0) + 1;
        });

        
        const formattedEmotionData = Object.keys(emotionCounts).map((key) => ({
            name: key.charAt(0).toUpperCase() + key.slice(1), 
            value: emotionCounts[key],
        }));

        const formattedBehaviorData = Object.keys(behaviorCounts).map((key) => ({
            name: key,
            value: behaviorCounts[key],
        }));

        return {
            emotionData: formattedEmotionData,
            behaviorData: formattedBehaviorData,
        };
    }, [apiData]);
};