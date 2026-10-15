import { useEffect, useState, useRef } from 'react';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  VideoCameraIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { api } from '../services/api';
import { CameraFormModal } from './CameraFormModal';

export const CamerasMonitor = ({ onNotify = () => {} }) => {
  const [cameras, setCameras] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [expandedCamera, setExpandedCamera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cameraToDelete, setCameraToDelete] = useState(null);
  
  // Rastreia quais câmeras estão com stream ativo no navegador
  const [activeFeeds, setActiveFeeds] = useState({});

  const loadCameras = async () => {
    try {
      const data = await api.getCameras();
      setCameras(data);
      // Por padrão, ativa o feed de câmeras ativas
      setActiveFeeds((prev) => {
        const next = { ...prev };
        data.forEach((c) => {
          if (next[c._id] === undefined) next[c._id] = true;
        });
        return next;
      });
    } catch (error) {
      console.error('Erro ao buscar câmeras:', error);
      onNotify('Erro ao carregar câmeras.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCameras();

    // Limpeza ao sair da aba de câmeras: desliga hardware
    return () => {
      cameras.forEach((c) => {
        try {
          api.releaseCamera(c._id);
        } catch {
          // ignora
        }
      });
    };
  }, []);

  // Suporte a tecla Escape para fechar modal de expansão
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (expandedCamera) setExpandedCamera(null);
        if (cameraToDelete) setCameraToDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expandedCamera, cameraToDelete]);

  const saveCamera = async (payload) => {
    try {
      if (editingCamera) {
        await api.updateCamera(editingCamera._id, payload);
        onNotify('Câmera atualizada com sucesso!', 'success');
      } else {
        await api.createCamera(payload);
        onNotify('Câmera adicionada com sucesso!', 'success');
      }
      setModalOpen(false);
      setEditingCamera(null);
      await loadCameras();
    } catch (error) {
      console.error(error);
      onNotify('Erro ao salvar câmera.', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!cameraToDelete) return;
    const cam = cameraToDelete;
    // 1. Fecha o modal imediatamente
    setCameraToDelete(null);
    if (expandedCamera?._id === cam._id) {
      setExpandedCamera(null);
    }
    // 2. Desmonta o stream e remove localmente da tela de imediato
    setActiveFeeds((prev) => {
      const next = { ...prev };
      delete next[cam._id];
      return next;
    });
    setCameras((prev) => prev.filter((c) => c._id !== cam._id));

    try {
      // 3. Libera o hardware da webcam e deleta a câmera
      try {
        await api.releaseCamera(cam._id);
      } catch {
        // ignora se já tiver sido encerrada
      }
      await api.deleteCamera(cam._id);
      onNotify(`Câmera "${cam.nome}" removida com sucesso.`, 'info');
    } catch (error) {
      console.error(error);
      onNotify('Erro ao remover câmera no servidor.', 'error');
    } finally {
      await loadCameras();
    }
  };

  const toggleStream = async (cameraId) => {
    const isStreaming = activeFeeds[cameraId];
    if (isStreaming) {
      setActiveFeeds((prev) => ({ ...prev, [cameraId]: false }));
      try {
        await api.stopCamera(cameraId);
        await api.releaseCamera(cameraId);
      } catch (e) {
        console.error(e);
      }
    } else {
      setActiveFeeds((prev) => ({ ...prev, [cameraId]: true }));
      try {
        await api.startCamera(cameraId);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const toggleMode = async (camera) => {
    const novoModo = camera.modo_monitoramento === 'individual' ? 'sala' : 'individual';
    try {
      await api.updateCameraMode(camera._id, novoModo);
      const updated = { ...camera, modo_monitoramento: novoModo };
      if (expandedCamera?._id === camera._id) setExpandedCamera(updated);
      setCameras((prev) => prev.map((c) => (c._id === camera._id ? updated : c)));
      onNotify(
        `Modo alterado para: ${novoModo === 'individual' ? 'Indivíduos & Faces' : 'Geral da Sala'}`,
        'info'
      );
    } catch (error) {
      console.error(error);
      onNotify('Erro ao alterar modo da câmera.', 'error');
    }
  };

  const CameraTile = ({ camera }) => {
    const isStreaming = activeFeeds[camera._id] !== false;

    return (
      <div className="bg-gray-800/90 border border-gray-700/80 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-gray-600 transition-all duration-200 flex flex-col group">
        {/* Cabeçalho do Card da Câmera */}
        <div className="px-4 py-3 bg-gray-850 border-b border-gray-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isStreaming ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400' : 'bg-gray-500'
              }`}
            />
            <h3 className="text-white font-semibold text-sm truncate">{camera.nome}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2 py-0.5 rounded-md font-mono bg-gray-700/70 text-gray-300">
              {camera.origem === '0' || camera.origem === 0 ? 'Webcam' : 'IP / Stream'}
            </span>
          </div>
        </div>

        {/* Viewport de Vídeo */}
        <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
          {isStreaming ? (
            <img
              src={api.videoFeedUrl(camera._id)}
              alt={camera.nome}
              className="w-full h-full object-cover select-none"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500 gap-2 p-6 text-center">
              <VideoCameraIcon className="w-10 h-10 opacity-40" />
              <p className="text-xs font-medium">Transmissão pausada (webcam liberada)</p>
              <button
                onClick={() => toggleStream(camera._id)}
                className="mt-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 flex items-center gap-1.5 shadow"
              >
                <PlayIcon className="w-4 h-4" />
                Iniciar Stream
              </button>
            </div>
          )}

          {/* Overlay de Ações Rápidas no Hover */}
          {isStreaming && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-3">
              <button
                onClick={() => setExpandedCamera(camera)}
                className="p-3 rounded-full bg-indigo-600/90 text-white hover:bg-indigo-500 hover:scale-110 transition shadow-lg"
                title="Expandir Tela Cheia"
              >
                <ArrowsPointingOutIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => toggleStream(camera._id)}
                className="p-3 rounded-full bg-amber-600/90 text-white hover:bg-amber-500 hover:scale-110 transition shadow-lg"
                title="Pausar Transmissão"
              >
                <PauseIcon className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Badge de Modo Sobreposto */}
          <div className="absolute bottom-2.5 left-2.5">
            <button
              onClick={() => toggleMode(camera)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-gray-200 border border-white/10 hover:bg-indigo-600 hover:text-white transition"
              title="Clique para alternar o modo de análise"
            >
              {camera.modo_monitoramento === 'individual' ? '👤 Indivíduos' : '🏛️ Geral da Sala'}
            </button>
          </div>
        </div>

        {/* Rodapé e Ações */}
        <div className="p-3.5 bg-gray-800/80 flex items-center justify-between gap-3 mt-auto">
          <div className="min-w-0">
            <p className="text-xs text-gray-400 truncate max-w-[190px]">Origem: {camera.origem}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setEditingCamera(camera);
                setModalOpen(true);
              }}
              className="p-2 rounded-lg bg-gray-700/70 text-gray-300 hover:bg-gray-600 hover:text-white transition"
              title="Editar Câmera"
            >
              <PencilSquareIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCameraToDelete(camera)}
              className="p-2 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/25 transition"
              title="Remover Câmera"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm font-medium">Carregando câmeras de monitoramento...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Header com Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-700/60">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Central de Monitoramento
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
              {cameras.length} {cameras.length === 1 ? 'câmera' : 'câmeras'}
            </span>
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Acompanhe feeds em tempo real e alterne modos de análise individual ou ambiente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingCamera(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-semibold hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-indigo-600/30 transition-all duration-150"
          >
            <PlusIcon className="w-5 h-5" />
            Adicionar Câmera
          </button>
        </div>
      </div>

      {/* Grade de Câmeras */}
      {cameras.length === 0 ? (
        <div className="border border-dashed border-gray-700/80 rounded-2xl p-12 text-center bg-gray-800/40 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <VideoCameraIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Nenhuma câmera configurada</h3>
          <p className="text-sm text-gray-400 max-w-md mb-6">
            Adicione uma webcam local (código 0) ou endereço de stream RTSP/HTTP para começar o monitoramento.
          </p>
          <button
            onClick={() => {
              setEditingCamera(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 shadow-md transition"
          >
            <PlusIcon className="w-4 h-4" />
            Cadastrar Primeira Câmera
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
          {cameras.map((camera) => (
            <CameraTile key={camera._id} camera={camera} />
          ))}
        </div>
      )}

      {/* Modal Expandido Fullscreen */}
      {expandedCamera && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 md:p-6 flex flex-col animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4 bg-gray-900/80 border border-gray-800 p-4 rounded-2xl">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                {expandedCamera.nome}
              </h2>
              <p className="text-xs text-gray-400 font-mono mt-0.5">Origem: {expandedCamera.origem}</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Chave de Modo */}
              <div className="flex items-center gap-3 bg-gray-800 px-3.5 py-1.5 rounded-xl border border-gray-700">
                <span className={`text-xs ${expandedCamera.modo_monitoramento === 'sala' ? 'text-indigo-300 font-semibold' : 'text-gray-400'}`}>
                  Geral da sala
                </span>
                <button
                  onClick={() => toggleMode(expandedCamera)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                    expandedCamera.modo_monitoramento === 'individual' ? 'bg-indigo-600' : 'bg-gray-600'
                  }`}
                  title="Alternar entre modo individual e modo sala"
                >
                  <span
                    className={`block w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      expandedCamera.modo_monitoramento === 'individual' ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={`text-xs ${expandedCamera.modo_monitoramento === 'individual' ? 'text-indigo-300 font-semibold' : 'text-gray-400'}`}>
                  Indivíduos & faces
                </span>
              </div>

              {/* Botão de Fechar */}
              <button
                onClick={() => setExpandedCamera(null)}
                className="p-2.5 rounded-xl bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition"
                title="Fechar (Esc)"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 bg-black rounded-2xl overflow-hidden border border-gray-800 flex items-center justify-center relative shadow-2xl">
            <img
              src={api.videoFeedUrl(expandedCamera._id)}
              alt={expandedCamera.nome}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Remoção */}
      {cameraToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <ExclamationCircleIcon className="w-7 h-7" />
              <h3 className="text-lg font-bold text-white">Confirmar exclusão</h3>
            </div>
            <p className="text-sm text-gray-300 mb-6">
              Deseja remover a câmera <strong className="text-white">"{cameraToDelete.nome}"</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCameraToDelete(null)}
                className="px-4 py-2 rounded-xl bg-gray-700 text-gray-300 hover:bg-gray-600 text-sm font-medium transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500 text-sm font-medium transition"
              >
                Remover Câmera
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição / Criação */}
      <CameraFormModal
        open={modalOpen}
        initialData={editingCamera}
        onClose={() => {
          setModalOpen(false);
          setEditingCamera(null);
        }}
        onSave={saveCamera}
      />
    </div>
  );
};
