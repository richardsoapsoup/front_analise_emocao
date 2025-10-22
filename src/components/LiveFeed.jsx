// LiveFeed.jsx
import { CameraIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

const VIDEO_FEED_URL = "http://127.0.0.1:8000/video_feed";
const START_DETECTOR_URL = "http://127.0.0.1:8000/start_detector";
const STOP_DETECTOR_URL = "http://127.0.0.1:8000/stop_detector";

export const LiveFeed = () => {
    useEffect(() => {
        
        const start = async () => {
            try {
                await fetch(START_DETECTOR_URL, { method: 'POST' });
                console.log("[LIVE FEED] Pedido de start enviado.");
            } catch (err) {
                console.error("[LIVE FEED] Erro ao iniciar detector:", err);
            }
        };
        start();

        
        return () => {
            const stopDetector = async () => {
                try {
                    await fetch(STOP_DETECTOR_URL, { method: 'POST' });
                    console.log("[LIVE FEED] Sinal de parada enviado ao detector da API.");
                } catch (error) {
                    console.error("[LIVE FEED] Erro ao enviar sinal de parada:", error);
                }
            };
            stopDetector();
        };
    }, []);

    return (
        <div className="p-6 bg-gray-800 rounded-lg shadow h-full flex flex-col">
            <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <CameraIcon className="w-6 h-6" />
                Monitoramento em Tempo Real
            </h1>

            <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center">
                <img
                    src={`${VIDEO_FEED_URL}?${Date.now()}`}
                    alt="Transmissão de Câmera em Tempo Real (MJPEG Stream)"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        parent.innerHTML = `
                            <div class="text-red-400 text-lg p-10 text-center">
                                ❌ Erro ao carregar o stream (${VIDEO_FEED_URL}). <br/><br/>
                                Certifique-se de que a API (FastAPI) e a webcam estão ativas.
                            </div>
                        `;
                    }}
                />
            </div>

            <p className="mt-4 text-sm text-gray-400">
                Status: Live feed ativo. O processo de análise de emoções é iniciado e encerrado automaticamente ao acessar esta tela.
            </p>
        </div>
    );
};
