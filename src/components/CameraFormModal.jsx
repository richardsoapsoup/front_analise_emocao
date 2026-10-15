import { useEffect, useState } from 'react';
import { XMarkIcon, VideoCameraIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

export const CameraFormModal = ({ open, onClose, onSave, initialData }) => {
  const [form, setForm] = useState({
    nome: '',
    origem: '0',
    ativa: true,
    modo_monitoramento: 'individual',
  });

  useEffect(() => {
    setForm(
      initialData
        ? {
            nome: initialData.nome || '',
            origem: initialData.origem || '0',
            ativa: initialData.ativa ?? true,
            modo_monitoramento: initialData.modo_monitoramento || 'individual',
          }
        : { nome: '', origem: '0', ativa: true, modo_monitoramento: 'individual' }
    );
  }, [initialData, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
        }}
        className="w-full max-w-lg bg-gray-850 border border-gray-700/80 rounded-2xl p-6 shadow-2xl bg-gray-800"
      >
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <VideoCameraIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">
              {initialData ? 'Editar Câmera' : 'Adicionar Nova Câmera'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Nome */}
        <label className="block mb-4">
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Nome de Identificação *
          </span>
          <input
            className="mt-1.5 w-full rounded-xl bg-gray-900 border border-gray-700 px-3.5 py-2.5 text-white text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Ex.: Entrada Principal, Sala de Reunião..."
            required
          />
        </label>

        {/* Origem */}
        <div className="mb-4">
          <label className="block">
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Origem da Câmera *
            </span>
            <input
              className="mt-1.5 w-full rounded-xl bg-gray-900 border border-gray-700 px-3.5 py-2.5 text-white text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition"
              value={form.origem}
              onChange={(e) => setForm({ ...form, origem: e.target.value })}
              placeholder="0, 1, rtsp://..., http://..."
              required
            />
          </label>

          {/* Atalhos rápidos de origem */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] text-gray-400">Atalhos:</span>
            <button
              type="button"
              onClick={() => setForm({ ...form, origem: '0' })}
              className={`text-[11px] px-2 py-0.5 rounded-md border transition ${
                form.origem === '0'
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-gray-700/60 text-gray-300 border-gray-600 hover:bg-gray-700'
              }`}
            >
              Webcam 0 (Principal)
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, origem: '1' })}
              className={`text-[11px] px-2 py-0.5 rounded-md border transition ${
                form.origem === '1'
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-gray-700/60 text-gray-300 border-gray-600 hover:bg-gray-700'
              }`}
            >
              Webcam 1 (Secundária)
            </button>
          </div>
        </div>

        {/* Modo padrão */}
        <label className="block mb-6">
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Modo Inicial de Monitoramento
          </span>
          <select
            className="mt-1.5 w-full rounded-xl bg-gray-900 border border-gray-700 px-3.5 py-2.5 text-white text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            value={form.modo_monitoramento}
            onChange={(e) => setForm({ ...form, modo_monitoramento: e.target.value })}
          >
            <option value="individual">👤 Modo Individual (Identificação e Faces)</option>
            <option value="sala">🏛️ Modo Sala (Humor Geral do Ambiente)</option>
          </select>
        </label>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-700/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-gray-700 text-gray-300 hover:bg-gray-600 text-sm font-medium transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-semibold hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-indigo-600/30 transition"
          >
            Salvar Câmera
          </button>
        </div>
      </form>
    </div>
  );
};
