import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { StatsCards } from './components/StatsCards';
import { useDataProcessing } from './hooks/useDataProcessing';
import { EmotionPieChart } from './components/charts/EmotionPieChart';
import { EmotionBarChart } from './components/charts/EmotionBarChart';
import { BehaviorChart } from './components/charts/BehaviorChart';
import Relatorio from './components/Relatorio';
import { CamerasMonitor } from './components/CamerasMonitor';
import { Usuarios } from './components/Usuarios';
import { api } from './services/api';
import './config/chartConfig';

const VIEWS = {
  DASHBOARD: 'dashboard',
  CAMERAS: 'cameras',
  USUARIOS: 'usuarios',
  RELATORIOS: 'relatorios',
  CONFIGURACOES: 'configuracoes',
};

const App = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState(VIEWS.DASHBOARD);
  const { emotionData, behaviorData } = useDataProcessing(apiData);

  const fetchData = async () => {
    try {
      const data = await api.getEventos(500);
      setApiData(Array.isArray(data) ? data.reverse() : []);
    } catch (error) {
      console.error('Falha no fetch da API:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    if (loading && currentView === VIEWS.DASHBOARD) {
      return <div className="flex justify-center items-center h-full text-xl">Carregando dados...</div>;
    }
    switch (currentView) {
      case VIEWS.DASHBOARD:
        return (
          <>
            <StatsCards data={apiData} />
            {apiData.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 place-items-center">
                <div className="lg:col-span-2 w-full">
                  <EmotionBarChart data={emotionData} />
                </div>
                <div className="w-full">
                  <EmotionPieChart data={emotionData} />
                </div>
                <div className="w-full">
                  <BehaviorChart data={behaviorData} />
                </div>
              </div>
            ) : (
              <div className="mt-8 p-6 bg-red-900 text-white rounded-lg text-center text-lg font-semibold">
                Nenhum evento de detecção encontrado na API.
              </div>
            )}
          </>
        );
      case VIEWS.CAMERAS:
        return <CamerasMonitor />;
      case VIEWS.USUARIOS:
        return <Usuarios />;
      case VIEWS.RELATORIOS:
        return <Relatorio />;
      case VIEWS.CONFIGURACOES:
        return (
          <div className="p-6 bg-gray-800 rounded-lg shadow h-[calc(100vh-48px)] text-center flex items-center justify-center text-2xl">
            Tela de Configurações em Desenvolvimento
          </div>
        );
      default:
        return null;
    }
  };

  if (loading && currentView === VIEWS.DASHBOARD) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white text-xl">
        Conectando à API e carregando dados...
      </div>
    );
  }

  return (
    <div className={darkMode ? 'flex h-screen bg-gray-900 text-white font-sans' : 'flex h-screen bg-gray-100 text-black font-sans'}>
      <Sidebar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentView={currentView}
        setCurrentView={setCurrentView}
        VIEWS={VIEWS}
      />
      <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>
    </div>
  );
};

export default App;
