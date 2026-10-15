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
import { AlertasManager } from './components/AlertasManager';
import { api } from './services/api';
import './config/chartConfig';
import {
  Bars3Icon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const VIEWS = {
  DASHBOARD: 'dashboard',
  CAMERAS: 'cameras',
  ALERTAS: 'alertas',
  USUARIOS: 'usuarios',
  RELATORIOS: 'relatorios',
  CONFIGURACOES: 'configuracoes',
};

const VIEW_TITLES = {
  [VIEWS.DASHBOARD]: { title: 'Dashboard Geral', subtitle: 'Métricas e tendências emocionais em tempo real' },
  [VIEWS.CAMERAS]: { title: 'Central de Câmeras', subtitle: 'Transmissão e monitoramento dos feeds de vídeo' },
  [VIEWS.ALERTAS]: { title: 'Alertas de Raiva Extrema', subtitle: 'Evidências visuais em tempo real e notificações automáticas por e-mail' },
  [VIEWS.USUARIOS]: { title: 'Gestão de Usuários', subtitle: 'Controle organizacional de membros e departamentos' },
  [VIEWS.RELATORIOS]: { title: 'Relatórios Analíticos', subtitle: 'Indicadores agregados e comportamento consolidado' },
  [VIEWS.CONFIGURACOES]: { title: 'Configurações', subtitle: 'Parâmetros do sistema e integrações' },
};

const App = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState(VIEWS.DASHBOARD);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [toast, setToast] = useState(null);
  const [alertCount, setAlertCount] = useState(0);

  const { emotionData, behaviorData } = useDataProcessing(apiData);

  // Som sutil de alerta via Web Audio API (dispensa arquivos externos)
  const playAlertSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn('Áudio de alerta indisponível ou bloqueado pelo navegador:', e);
    }
  };

  // Relógio do Header
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Notificações Toast
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Monitoramento contínuo de novos alertas de raiva extrema (em background)
  useEffect(() => {
    let seenAlertIds = new Set();
    let isInitialLoad = true;

    const checkAlerts = async () => {
      try {
        const data = await api.getAlertas(20);
        const novos = data.filter((a) => a.status === 'novo');
        setAlertCount(novos.length);

        if (!isInitialLoad) {
          const freshAlerts = data.filter((a) => a.status === 'novo' && !seenAlertIds.has(a.id));
          if (freshAlerts.length > 0) {
            const first = freshAlerts[0];
            playAlertSound();
            showToast(
              `🚨 Alerta de Raiva Extrema (${(first.score_raiva * 100).toFixed(0)}%) detectado na ${first.camera_nome || 'Câmera'}!`,
              'error'
            );
          }
        }

        seenAlertIds = new Set(data.map((a) => a.id));
        isInitialLoad = false;
      } catch {
        // Silencioso em caso de erro transitório de rede
      }
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 6000);
    return () => clearInterval(interval);
  }, []);

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

  // Garantia adicional de liberação ao fechar ou descarregar a página
  useEffect(() => {
    const handleUnload = () => {
      // Dispara liberação de câmeras ao descarregar a página
      try {
        navigator.sendBeacon?.(`${api.baseUrl}/cameras`);
      } catch {
        // ignora
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  const renderContent = () => {
    if (loading && currentView === VIEWS.DASHBOARD) {
      return (
        <div className="flex flex-col items-center justify-center h-96 gap-3 text-gray-400">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-sm font-medium">Carregando painel de eventos...</p>
        </div>
      );
    }

    switch (currentView) {
      case VIEWS.DASHBOARD:
        return (
          <>
            <StatsCards data={apiData} onNavigate={setCurrentView} VIEWS={VIEWS} />
            {apiData.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="lg:col-span-2 w-full bg-gray-800/90 border border-gray-700/80 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
                  <h3 className="text-base font-bold text-white mb-4">Volume de Emoções Detectadas</h3>
                  <EmotionBarChart data={emotionData} />
                </div>
                <div className="w-full bg-gray-800/90 border border-gray-700/80 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
                  <h3 className="text-base font-bold text-white mb-4">Proporção Emocional</h3>
                  <EmotionPieChart data={emotionData} />
                </div>
                <div className="w-full bg-gray-800/90 border border-gray-700/80 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
                  <h3 className="text-base font-bold text-white mb-4">Classificação de Comportamento</h3>
                  <BehaviorChart data={behaviorData} />
                </div>
              </div>
            ) : (
              <div className="mt-8 p-10 bg-gray-800/60 border border-dashed border-gray-700 text-gray-400 rounded-2xl text-center">
                <p className="text-base font-semibold text-white mb-1">Nenhum evento registrado ainda</p>
                <p className="text-sm">Inicie a transmissão de uma câmera para começar a capturar expressões faciais.</p>
              </div>
            )}
          </>
        );
      case VIEWS.CAMERAS:
        return <CamerasMonitor onNotify={showToast} />;
      case VIEWS.ALERTAS:
        return (
          <AlertasManager
            onNotify={showToast}
            onNewAlertCountChange={setAlertCount}
          />
        );
      case VIEWS.USUARIOS:
        return <Usuarios onNotify={showToast} />;
      case VIEWS.RELATORIOS:
        return <Relatorio onNotify={showToast} />;
      case VIEWS.CONFIGURACOES:
        return (
          <div className="p-8 bg-gray-800/90 border border-gray-700/80 rounded-2xl shadow-xl text-center flex flex-col items-center justify-center min-h-[360px] max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-2">Configurações do Sistema</h2>
            <p className="text-sm text-gray-400 mb-6">
              Em breve: ajustes de sensibilidade do detector MTCNN, intervalo de polling e credenciais MongoDB.
            </p>
            <div className="text-xs font-mono p-3 bg-gray-900 rounded-xl border border-gray-700 text-gray-400 w-full text-left space-y-1">
              <p>API Host: {api.baseUrl}</p>
              <p>Polling Status: 5s ativo</p>
              <p>Versão: 2.1.0-enhanced</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const currentMeta = VIEW_TITLES[currentView] || { title: 'Painel', subtitle: '' };

  return (
    <div className={darkMode ? 'flex h-screen bg-gray-950 text-white font-sans overflow-hidden' : 'flex h-screen bg-gray-100 text-black font-sans overflow-hidden'}>
      {/* Sidebar Responsivo */}
      <Sidebar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentView={currentView}
        setCurrentView={setCurrentView}
        VIEWS={VIEWS}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        alertCount={alertCount}
      />

      {/* Conteúdo Principal com Topbar Header */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar Header */}
        <header className="h-16 px-4 md:px-6 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between gap-4 backdrop-blur-md z-30 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Botão Hamburger para Mobile */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
              aria-label="Abrir menu"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            <div className="truncate">
              <h1 className="text-base md:text-lg font-bold text-white tracking-tight truncate leading-tight">
                {currentMeta.title}
              </h1>
              <p className="hidden sm:block text-xs text-gray-400 truncate leading-tight">
                {currentMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Badges e Relógio à Direita */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Relógio */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800/80 border border-gray-700/60 text-xs text-gray-300 font-mono">
              <ClockIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>{currentTime}</span>
            </div>

            {/* Status Conexão */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden xs:inline">Conectado</span>
            </div>
          </div>
        </header>

        {/* Notificação Toast Flutuante */}
        {toast && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 shadow-2xl text-sm animate-in slide-in-from-top-2 duration-200">
            {toast.type === 'success' && <CheckCircleIcon className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <ExclamationCircleIcon className="w-5 h-5 text-rose-400" />}
            {toast.type === 'info' && <InformationCircleIcon className="w-5 h-5 text-indigo-400" />}
            <span className="text-white font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-gray-400 hover:text-white"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Viewport de Conteúdo com Scroll */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-gray-900/60">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
