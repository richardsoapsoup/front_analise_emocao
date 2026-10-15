import { useEffect, useState } from 'react';
import {
  PlusIcon,
  TrashIcon,
  UserIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { api } from '../services/api';

export const Usuarios = ({ onNotify = () => {} }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarioToDelete, setUsuarioToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    departamento: '',
    observacao: '',
  });

  const loadUsuarios = async () => {
    try {
      setUsuarios(await api.getUsuarios());
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      onNotify('Erro ao carregar lista de usuários.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.nome.trim()) return;
    setSubmitting(true);
    try {
      await api.createUsuario(form);
      setForm({ nome: '', email: '', departamento: '', observacao: '' });
      onNotify('Usuário cadastrado com sucesso!', 'success');
      await loadUsuarios();
    } catch (error) {
      console.error(error);
      onNotify('Erro ao cadastrar usuário.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmRemover = async () => {
    if (!usuarioToDelete) return;
    try {
      await api.deleteUsuario(usuarioToDelete._id);
      onNotify(`Usuário "${usuarioToDelete.nome}" desativado.`, 'info');
      setUsuarioToDelete(null);
      await loadUsuarios();
    } catch (error) {
      console.error(error);
      onNotify('Erro ao remover usuário.', 'error');
    }
  };

  const filteredUsuarios = usuarios.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      (u.nome || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.departamento || '').toLowerCase().includes(term)
    );
  });

  const getInitials = (nome = '') => {
    const parts = nome.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getAvatarGradient = (nome = '') => {
    const charCode = nome.charCodeAt(0) || 0;
    const gradients = [
      'from-indigo-500 to-purple-600',
      'from-emerald-500 to-teal-600',
      'from-blue-500 to-cyan-600',
      'from-rose-500 to-pink-600',
      'from-amber-500 to-orange-600',
    ];
    return gradients[charCode % gradients.length];
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-700/60">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Gestão de Usuários
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
            {usuarios.length} cadastrados
          </span>
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Cadastre membros e equipes para gerar relatórios detalhados e cruzamento comportamental.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Formulário de Cadastro (Coluna 1) */}
        <form
          onSubmit={submit}
          className="lg:col-span-5 bg-gray-800/90 border border-gray-700/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm"
        >
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-700/60">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <UserIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">Novo Usuário</h2>
          </div>

          <label className="block mb-4">
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Nome Completo *
            </span>
            <div className="relative mt-1.5">
              <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                className="w-full rounded-xl bg-gray-900 border border-gray-700 pl-10 pr-3 py-2.5 text-white text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex.: Maria Silva"
                required
              />
            </div>
          </label>

          <label className="block mb-4">
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              E-mail
            </span>
            <div className="relative mt-1.5">
              <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                className="w-full rounded-xl bg-gray-900 border border-gray-700 pl-10 pr-3 py-2.5 text-white text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="exemplo@empresa.com"
              />
            </div>
          </label>

          <label className="block mb-4">
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Departamento / Equipe
            </span>
            <div className="relative mt-1.5">
              <BuildingOfficeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                className="w-full rounded-xl bg-gray-900 border border-gray-700 pl-10 pr-3 py-2.5 text-white text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                value={form.departamento}
                onChange={(e) => setForm({ ...form, departamento: e.target.value })}
                placeholder="Ex.: Engenharia, Atendimento..."
              />
            </div>
          </label>

          <label className="block mb-6">
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Observações
            </span>
            <div className="relative mt-1.5">
              <textarea
                className="w-full rounded-xl bg-gray-900 border border-gray-700 p-3 text-white text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                value={form.observacao}
                onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                rows={3}
                placeholder="Anotações internas sobre o usuário..."
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold text-sm hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
          >
            <PlusIcon className="w-5 h-5" />
            {submitting ? 'Cadastrando...' : 'Cadastrar Usuário'}
          </button>
        </form>

        {/* Tabela de Usuários (Coluna 2) */}
        <section className="lg:col-span-7 bg-gray-800/90 border border-gray-700/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-indigo-400" />
              Membros Registrados
            </h2>

            {/* Barra de Busca */}
            <div className="relative w-full sm:w-64">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-gray-900 border border-gray-700 text-xs text-white outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">Carregando usuários...</div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm border border-dashed border-gray-700 rounded-xl p-8">
              {searchTerm ? 'Nenhum usuário coincide com a busca.' : 'Nenhum usuário cadastrado no momento.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase text-gray-400 border-b border-gray-700">
                    <th className="py-3 px-3">Usuário</th>
                    <th className="py-3 px-3">Departamento</th>
                    <th className="py-3 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {filteredUsuarios.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-750/50 transition">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${getAvatarGradient(
                              u.nome
                            )} flex items-center justify-center text-white font-bold text-xs shadow`}
                          >
                            {getInitials(u.nome)}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm leading-tight">{u.nome}</p>
                            <p className="text-xs text-gray-400 leading-tight mt-0.5">{u.email || 'Sem e-mail'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-xs px-2.5 py-1 rounded-md bg-gray-700/60 text-gray-300 font-medium">
                          {u.departamento || 'Geral'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => setUsuarioToDelete(u)}
                          className="p-2 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/25 transition"
                          title="Remover / Desativar"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {usuarioToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <ExclamationCircleIcon className="w-7 h-7" />
              <h3 className="text-lg font-bold text-white">Confirmar Desativação</h3>
            </div>
            <p className="text-sm text-gray-300 mb-6">
              Deseja realmente desativar o usuário <strong className="text-white">"{usuarioToDelete.nome}"</strong>? Ele não aparecerá mais nos relatórios ativos.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setUsuarioToDelete(null)}
                className="px-4 py-2 rounded-xl bg-gray-700 text-gray-300 hover:bg-gray-600 text-sm font-medium transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRemover}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500 text-sm font-medium transition"
              >
                Desativar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
