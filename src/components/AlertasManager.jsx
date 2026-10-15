import { useEffect, useState } from 'react';
import {
  BellAlertIcon,
  EnvelopeIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  TrashIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  VideoCameraIcon,
  ArrowPathIcon,
  SpeakerWaveIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { api } from '../services/api';

export const AlertasManager = ({ onNotify = () => {}, onNewAlertCountChange = () => {} }) => {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'config'
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({
    email_destino: '',
    ativo: true,
    limiar_raiva: 0.85,
    cooldown_segundos: 60,
    enviar_email: false,
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_user: '',
    smtp_pass: '',
    smtp_remetente: '',
    notificacao_sonora: true,
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [testingAlert, setTestingAlert] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filterStatus, setFilterStatus] = useState('todos'); // 'todos' | 'novo' | 'resolvido'
  const [showSmtpAdvanced, setShowSmtpAdvanced] = useState(false);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [alertasData, configData] = await Promise.all([
        api.getAlertas(100),
        api.getAlertasConfig(),
      ]);
      setAlertas(alertasData);
      if (configData) setConfig((prev) => ({ ...prev, ...configData }));
      
      const novos = alertasData.filter((a) => a.status === 'novo').length;
      onNewAlertCountChange(novos);
    } catch (error) {
      console.error(error);
      onNotify('Erro ao carregar dados de alertas.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
    // Atualiza o feed de alertas periodicamente a cada 5 segundos
    const timer = setInterval(async () => {
      try {
        const data = await api.getAlertas(100);
        setAlertas(data);
        const novos = data.filter((a) => a.status === 'novo').length;
        onNewAlertCountChange(novos);
      } catch {
        // silencioso
      }
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSalvarConfig = async (e) => {
    if (e) e.preventDefault();
    try {
      setSavingConfig(true);
      const res = await api.updateAlertasConfig(config);
      setConfig(res);
      onNotify('Configurações de alerta salvas com sucesso!', 'success');
    } catch (error) {
      console.error(error);
      onNotify('Erro ao salvar configurações.', 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleTestarAlerta = async () => {
    try {
      setTestingAlert(true);
      const res = await api.testarAlerta();
      if (res.status === 'ok') {
        onNotify('Disparo de alerta de teste efetuado com sucesso!', 'success');
        if (res.email_resultado) {
          const statusEmail = res.email_resultado.status;
          const msg = res.email_resultado.mensagem;
          if (statusEmail === 'sucesso') {
            onNotify(`E-mail enviado: ${msg}`, 'success');
          } else if (statusEmail === 'simulado') {
            onNotify(`Simulação: ${msg}`, 'info');
          } else {
            onNotify(`Retorno do e-mail: ${msg}`, 'warning');
          }
        }
        await carregarDados();
      }
    } catch (error) {
      console.error(error);
      onNotify('Erro ao disparar teste de alerta.', 'error');
    } finally {
      setTestingAlert(false);
    }
  };

  const handleMarcarStatus = async (id, novoStatus) => {
    try {
      await api.updateAlertaStatus(id, novoStatus);
      setAlertas((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: novoStatus } : a))
      );
      onNotify(`Alerta marcado como ${novoStatus === 'resolvido' ? 'resolvido' : novoStatus}.`, 'info');
      const novos = alertas.filter((a) => a._id !== id && a.status === 'novo').length;
      onNewAlertCountChange(novos);
    } catch (error) {
      console.error(error);
      onNotify('Erro ao atualizar status do alerta.', 'error');
    }
  };

  const handleRemoverAlerta = async (id) => {
    try {
      await api.deleteAlerta(id);
      setAlertas((prev) => prev.filter((a) => a._id !== id));
      onNotify('Registro de alerta removido.', 'info');
      const novos = alertas.filter((a) => a._id !== id && a.status === 'novo').length;
      onNewAlertCountChange(novos);
    } catch (error) {
      console.error(error);
      onNotify('Erro ao remover alerta.', 'error');
    }
  };

  const alertasFiltrados = alertas.filter((a) => {
    if (filterStatus === 'todos') return true;
    return a.status === filterStatus;
  });

  const totalNovos = alertas.filter((a) => a.status === 'novo').length;
  const totalResolvidos = alertas.filter((a) => a.status === 'resolvido').length;

  return (
    <div className="space-y-6">
      {/* Header com Resumo e Ações Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-850 p-6 rounded-2xl border border-gray-700/80 shadow-lg">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldExclamationIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                Sistema de Alertas: Raiva Extrema
                {totalNovos > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse">
                    {totalNovos} pendente{totalNovos > 1 ? 's' : ''}
                  </span>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                Monitoramento contínuo com captura automática de evidências e disparos de e-mail.
              </p>
            </div>
          </div>
        </div>

        {/* Botão de Teste Imediato */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleTestarAlerta}
            disabled={testingAlert}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:from-rose-500 hover:to-rose-600 text-sm font-semibold shadow-md shadow-rose-900/30 transition disabled:opacity-50"
          >
            {testingAlert ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <PaperAirplaneIcon className="w-4 h-4" />
            )}
            Testar Alerta e E-mail
          </button>
        </div>
      </div>

      {/* Cards de Métricas Rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/80 border border-gray-700/80 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <BellAlertIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Total de Ocorrências</p>
            <p className="text-xl font-bold text-white">{alertas.length}</p>
          </div>
        </div>

        <div className="bg-gray-800/80 border border-gray-700/80 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <ClockIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Pendentes</p>
            <p className="text-xl font-bold text-amber-400">{totalNovos}</p>
          </div>
        </div>

        <div className="bg-gray-800/80 border border-gray-700/80 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircleIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Resolvidos</p>
            <p className="text-xl font-bold text-emerald-400">{totalResolvidos}</p>
          </div>
        </div>

        <div className="bg-gray-800/80 border border-gray-700/80 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <EnvelopeIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Disparo de E-mail</p>
            <p className="text-sm font-bold text-indigo-300">
              {config.enviar_email ? 'Habilitado' : 'Apenas Painel'}
            </p>
          </div>
        </div>
      </div>

      {/* Abas de Navegação Interna */}
      <div className="flex border-b border-gray-700/80 gap-3">
        <button
          onClick={() => setActiveTab('feed')}
          className={`pb-3 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'feed'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <BellAlertIcon className="w-4 h-4" />
          Ocorrências e Evidências ({alertas.length})
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`pb-3 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'config'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <AdjustmentsHorizontalIcon className="w-4 h-4" />
          Configurações de Notificação e E-mail
        </button>
      </div>

      {/* TAB 1: FEED DE OCORRÊNCIAS */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Filtrar por:</span>
              <button
                onClick={() => setFilterStatus('todos')}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                  filterStatus === 'todos'
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-750'
                }`}
              >
                Todos ({alertas.length})
              </button>
              <button
                onClick={() => setFilterStatus('novo')}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                  filterStatus === 'novo'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-750'
                }`}
              >
                Pendentes ({totalNovos})
              </button>
              <button
                onClick={() => setFilterStatus('resolvido')}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                  filterStatus === 'resolvido'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-750'
                }`}
              >
                Resolvidos ({totalResolvidos})
              </button>
            </div>
          </div>

          {/* Lista de Cards de Alertas */}
          {loading ? (
            <div className="flex items-center justify-center p-12 text-gray-400 gap-3">
              <ArrowPathIcon className="w-6 h-6 animate-spin text-rose-500" />
              <span className="text-sm font-medium">Carregando evidências de alertas...</span>
            </div>
          ) : alertasFiltrados.length === 0 ? (
            <div className="border border-dashed border-gray-700/80 rounded-2xl p-12 text-center bg-gray-850/50">
              <ShieldExclamationIcon className="w-12 h-12 mx-auto text-gray-600 mb-3" />
              <h3 className="text-base font-semibold text-gray-300">Nenhum alerta de raiva extrema no filtro selecionado</h3>
              <p className="text-xs text-gray-500 mt-1">
                Quando a expressão de raiva ultrapassar o limiar configurado ({int(config.limiar_raiva * 100)}%), os registros aparecerão aqui instantaneamente.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {alertasFiltrados.map((alerta) => {
                const raiva = alerta.pontuacao_percentual || Math.round(alerta.score * 100);
                const isNovo = alerta.status === 'novo';
                const dataFormatada = alerta.timestamp
                  ? new Date(alerta.timestamp).toLocaleString('pt-BR')
                  : 'Horário não registrado';

                return (
                  <div
                    key={alerta._id}
                    className={`bg-gray-800/90 rounded-2xl border overflow-hidden shadow-lg flex flex-col transition-all ${
                      isNovo
                        ? 'border-rose-500/50 shadow-rose-950/20'
                        : 'border-gray-700/60 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {/* Imagem do Incidente */}
                    <div className="aspect-video bg-black relative group flex items-center justify-center overflow-hidden">
                      {alerta.imagem_url ? (
                        <img
                          src={api.alertaImageUrl(alerta.imagem_url)}
                          alt="Evidência do Incidente"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300 cursor-pointer"
                          onClick={() => setSelectedImage(api.alertaImageUrl(alerta.imagem_url))}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500 gap-1">
                          <VideoCameraIcon className="w-8 h-8 opacity-40" />
                          <span className="text-xs">Evidência visual indisponível</span>
                        </div>
                      )}

                      {/* Badge de Raiva sobre a imagem */}
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-600/90 backdrop-blur-md text-white shadow-md flex items-center gap-1">
                          🔥 {raiva}% Raiva
                        </span>
                      </div>

                      {/* Botão de Expandir Imagem */}
                      {alerta.imagem_url && (
                        <button
                          onClick={() => setSelectedImage(api.alertaImageUrl(alerta.imagem_url))}
                          className="absolute bottom-2.5 right-2.5 p-2 rounded-lg bg-black/70 backdrop-blur-md text-white hover:bg-black transition opacity-0 group-hover:opacity-100"
                          title="Expandir Foto"
                        >
                          <ArrowsPointingOutIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Informações do Alerta */}
                    <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-gray-200 truncate flex items-center gap-1.5">
                            <VideoCameraIcon className="w-4 h-4 text-rose-400" />
                            {alerta.camera_nome || 'Câmera'}
                          </span>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              isNovo
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {isNovo ? 'Pendente' : 'Resolvido'}
                          </span>
                        </div>

                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <ClockIcon className="w-3.5 h-3.5 text-gray-500" />
                          {dataFormatada}
                        </p>

                        {/* Status do envio de e-mail */}
                        <div className="mt-2 text-[11px] flex items-center gap-1 text-gray-400">
                          <EnvelopeIcon className="w-3.5 h-3.5 text-indigo-400" />
                          <span>
                            {alerta.email_enviado
                              ? `E-mail notificado: ${alerta.email_destinatario || config.email_destino || 'OK'}`
                              : 'Notificação apenas na tela'}
                          </span>
                        </div>
                      </div>

                      {/* Botões de Ação */}
                      <div className="pt-2 border-t border-gray-700/60 flex items-center justify-between gap-2">
                        {isNovo ? (
                          <button
                            onClick={() => handleMarcarStatus(alerta._id, 'resolvido')}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 font-medium transition"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            Marcar Resolvido
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarcarStatus(alerta._id, 'novo')}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 font-medium transition"
                          >
                            Reabrir
                          </button>
                        )}

                        <button
                          onClick={() => handleRemoverAlerta(alerta._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Excluir Registro"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CONFIGURAÇÕES DE ALERTA E E-MAIL */}
      {activeTab === 'config' && (
        <form onSubmit={handleSalvarConfig} className="bg-gray-850 p-6 rounded-2xl border border-gray-700/80 shadow-xl space-y-6 max-w-3xl">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-indigo-400" />
              Regras de Detecção e Canais de Alerta
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Defina a sensibilidade da detecção de raiva e o e-mail que receberá os alertas com foto.
            </p>
          </div>

          {/* Status Geral do Módulo */}
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700">
            <div>
              <p className="text-sm font-semibold text-white">Módulo de Alertas Críticos</p>
              <p className="text-xs text-gray-400">Ativa ou desativa a gravação de snapshots de raiva extrema</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.ativo}
                onChange={(e) => setConfig({ ...config, ativo: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {/* Limiar de Sensibilidade de Raiva */}
          <div className="p-4 bg-gray-800 rounded-xl border border-gray-700 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white">
                Sensibilidade de Raiva Extrema
              </label>
              <span className="text-sm font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-lg border border-rose-500/20">
                {Math.round(config.limiar_raiva * 100)}% de Confiança
              </span>
            </div>
            <input
              type="range"
              min="0.70"
              max="0.98"
              step="0.01"
              value={config.limiar_raiva}
              onChange={(e) => setConfig({ ...config, limiar_raiva: parseFloat(e.target.value) })}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-gray-500 font-mono">
              <span>70% (Mais sensível)</span>
              <span>85% (Recomendado)</span>
              <span>98% (Apenas extrema certeza)</span>
            </div>
          </div>

          {/* Cooldown entre Notificações */}
          <div className="p-4 bg-gray-800 rounded-xl border border-gray-700 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white">
                Intervalo Mínimo Entre Alertas (Cooldown)
              </label>
              <span className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20">
                {config.cooldown_segundos} segundos ({Math.round(config.cooldown_segundos / 60 * 10) / 10} min)
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="300"
              step="15"
              value={config.cooldown_segundos}
              onChange={(e) => setConfig({ ...config, cooldown_segundos: parseInt(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <p className="text-xs text-gray-400">
              Evita múltiplos e-mails repetidos se a mesma pessoa continuar com expressão de raiva na câmera.
            </p>
          </div>

          {/* Notificação Sonora no Painel */}
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <SpeakerWaveIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Aviso Sonoro no Navegador</p>
                <p className="text-xs text-gray-400">Toca um alerta audível suave quando um pico de raiva é registrado</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.notificacao_sonora}
                onChange={(e) => setConfig({ ...config, notificacao_sonora: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* E-mail de Notificação */}
          <div className="p-4 bg-gray-800 rounded-xl border border-gray-700 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4 text-indigo-400" />
                  Notificação Automática por E-mail
                </p>
                <p className="text-xs text-gray-400">Envia a evidência fotográfica anexada para o responsável</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enviar_email}
                  onChange={(e) => setConfig({ ...config, enviar_email: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                E-mail Destinatário *
              </label>
              <input
                type="email"
                value={config.email_destino}
                onChange={(e) => setConfig({ ...config, email_destino: e.target.value })}
                placeholder="exemplo: seguranca@empresa.com, coordenador@escola.com"
                className="w-full rounded-xl bg-gray-900 border border-gray-700 px-3.5 py-2.5 text-white text-sm outline-none focus:border-indigo-500 font-mono transition"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Você pode testar mesmo sem configurar servidor SMTP (o sistema simula o envio no terminal e gera o alerta).
              </p>
            </div>

            {/* Acordeão de Servidor SMTP Real */}
            <div className="border-t border-gray-700/60 pt-3">
              <button
                type="button"
                onClick={() => setShowSmtpAdvanced(!showSmtpAdvanced)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 font-medium transition"
              >
                <KeyIcon className="w-4 h-4" />
                {showSmtpAdvanced ? 'Ocultar credenciais SMTP' : 'Configurar servidor SMTP real (Gmail, Outlook, etc.)'}
              </button>

              {showSmtpAdvanced && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-900/60 rounded-xl border border-gray-700/60">
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-400 mb-2">
                      Para enviar e-mails reais usando o Gmail, crie uma <strong>Senha de Aplicativo</strong> nas configurações de segurança do Google.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-300 mb-1">Host SMTP</label>
                    <input
                      type="text"
                      value={config.smtp_host}
                      onChange={(e) => setConfig({ ...config, smtp_host: e.target.value })}
                      placeholder="smtp.gmail.com"
                      className="w-full rounded-lg bg-gray-900 border border-gray-700 p-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-300 mb-1">Porta (TLS: 587)</label>
                    <input
                      type="number"
                      value={config.smtp_port}
                      onChange={(e) => setConfig({ ...config, smtp_port: e.target.value })}
                      placeholder="587"
                      className="w-full rounded-lg bg-gray-900 border border-gray-700 p-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-300 mb-1">Usuário / E-mail Remetente</label>
                    <input
                      type="text"
                      value={config.smtp_user}
                      onChange={(e) => setConfig({ ...config, smtp_user: e.target.value })}
                      placeholder="seu-email@gmail.com"
                      className="w-full rounded-lg bg-gray-900 border border-gray-700 p-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-300 mb-1">Senha de Aplicativo</label>
                    <input
                      type="password"
                      value={config.smtp_pass}
                      onChange={(e) => setConfig({ ...config, smtp_pass: e.target.value })}
                      placeholder="xxxx xxxx xxxx xxxx"
                      className="w-full rounded-lg bg-gray-900 border border-gray-700 p-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botão de Salvar */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/60">
            <button
              type="submit"
              disabled={savingConfig}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-semibold hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {savingConfig ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      )}

      {/* MODAL DE LIGHTBOX / ZOOM DA FOTO */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 flex flex-col items-center justify-center animate-in fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-gray-850 flex items-center justify-between border-b border-gray-700">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldExclamationIcon className="w-5 h-5 text-rose-500" />
                Evidência Visual Capturada
              </span>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 bg-black flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Registro Ampliado"
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
