import { useEffect, useState } from 'react';
import {
  Users,
  Download,
  Activity,
  AlertTriangle,
  Camera,
  BarChart3,
  RotateCw,
  Search,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { api } from '../services/api';

const EMOTION_COLORS = {
  happy: '#10b981',
  neutral: '#6366f1',
  sad: '#3b82f6',
  fear: '#8b5cf6',
  angry: '#ef4444',
  surprise: '#f59e0b',
  disgust: '#ec4899',
};

const DEFAULT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 border border-gray-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-white font-semibold text-xs mb-1">{label || payload[0].name}</p>
        <p className="text-indigo-400 font-bold text-sm">
          {payload[0].value} {payload[0].value === 1 ? 'ocorrência' : 'ocorrências'}
        </p>
      </div>
    );
  }
  return null;
};

const Relatorio = ({ onNotify = () => {} }) => {
  const [resumo, setResumo] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchUser, setSearchUser] = useState('');

  const carregar = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const [resumoData, usuariosData] = await Promise.all([
        api.getResumoRelatorios(),
        api.getRelatorioUsuarios(),
      ]);
      setResumo(resumoData);
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      if (!silent) onNotify('Erro ao sincronizar dados de relatórios.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregar();
    const interval = setInterval(() => carregar(true), 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
        <RotateCw className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm font-medium">Carregando métricas consolidadas...</p>
      </div>
    );
  }

  if (!resumo) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/30 text-rose-200 p-6 rounded-2xl">
        Não foi possível conectar às agregações do banco de dados MongoDB.
      </div>
    );
  }

  const cards = [
    {
      label: 'Eventos Analisados',
      value: (resumo.total_eventos || 0).toLocaleString(),
      icon: Activity,
      color: 'text-indigo-400',
      border: 'border-indigo-500/20 hover:border-indigo-500/40',
      glow: 'from-indigo-500/15 to-transparent',
    },
    {
      label: 'Alertas Potenciais',
      value: resumo.total_alertas || 0,
      icon: AlertTriangle,
      color: (resumo.total_alertas || 0) > 0 ? 'text-rose-400' : 'text-gray-400',
      border: (resumo.total_alertas || 0) > 0 ? 'border-rose-500/30 hover:border-rose-500/50' : 'border-gray-700/60',
      glow: (resumo.total_alertas || 0) > 0 ? 'from-rose-500/15 to-transparent' : 'from-gray-800/20 to-transparent',
    },
    {
      label: 'Câmeras Cadastradas',
      value: resumo.total_cameras || 0,
      icon: Camera,
      color: 'text-emerald-400',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      glow: 'from-emerald-500/15 to-transparent',
    },
    {
      label: 'Usuários Ativos',
      value: resumo.total_usuarios || 0,
      icon: Users,
      color: 'text-purple-400',
      border: 'border-purple-500/20 hover:border-purple-500/40',
      glow: 'from-purple-500/15 to-transparent',
    },
  ];

  const filteredUsuarios = usuarios.filter((u) => {
    const term = searchUser.toLowerCase();
    return (
      (u.nome || '').toLowerCase().includes(term) ||
      (u.departamento || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-full">
      {/* Header com Ações */}
      <header className="mb-6 pb-4 border-b border-gray-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Relatórios Dinâmicos</h1>
          </div>
          <p className="text-sm text-gray-400">
            Painel de inteligência gerado a partir de agregações em tempo real do MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => carregar(false)}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-750 text-sm font-medium flex items-center gap-2 transition disabled:opacity-50"
            title="Atualizar dados agora"
          >
            <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Atualizar</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-semibold hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-indigo-600/30 flex items-center gap-2 transition"
          >
            <Download size={16} />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </header>

      {/* Cartões Estatísticos */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`p-5 rounded-2xl bg-gradient-to-br bg-gray-800/90 border shadow-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 ${card.glow} ${card.border}`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
                <Icon className={card.color} size={20} />
              </div>
              <h2 className={`text-3xl font-extrabold tracking-tight ${card.color}`}>{card.value}</h2>
            </div>
          );
        })}
      </section>

      {/* Gráficos Consolidados */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Distribuição por Emoção */}
        <div className="bg-gray-800/90 border border-gray-700/80 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white tracking-wide">Distribuição Geral por Emoção</h2>
            <span className="text-xs text-gray-400">Total de expressões</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resumo.por_emocao}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={3}
                >
                  {resumo.por_emocao.map((entry, index) => {
                    const color = EMOTION_COLORS[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val) => <span className="text-xs text-gray-300 capitalize">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Eventos por Câmera */}
        <div className="bg-gray-800/90 border border-gray-700/80 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white tracking-wide">Detecções por Câmera / Ponto</h2>
            <span className="text-xs text-gray-400">Origem dos eventos</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resumo.por_camera}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Relatório por Usuário */}
      <section className="bg-gray-800/90 border border-gray-700/80 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Métricas por Membro Cadastrado</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Acompanhamento de pontuação de humor e alertas consolidados por indivíduo.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filtrar membro..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-gray-900 border border-gray-700 text-xs text-white outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {usuarios.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-gray-700 rounded-xl text-gray-400 text-sm">
            Nenhum usuário cadastrado para compilar métricas analíticas.
          </div>
        ) : filteredUsuarios.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">
            Nenhum membro corresponde ao filtro digitado.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredUsuarios.map((u) => {
              const isWarning = u.status === 'warning';
              return (
                <div
                  key={u._id}
                  className={`p-5 rounded-2xl border transition-all duration-200 bg-gray-900/80 hover:bg-gray-900 ${
                    isWarning
                      ? 'border-rose-500/40 shadow-lg shadow-rose-950/20'
                      : 'border-gray-700/70 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-bold text-base">{u.nome}</h3>
                        {isWarning ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Atenção
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Estável
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{u.email || 'Sem e-mail'}</p>
                      <p className="text-[11px] text-indigo-400 font-medium">{u.departamento || 'Departamento Geral'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center bg-gray-800/60 p-3 rounded-xl border border-gray-750">
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium">Eventos</p>
                      <p className="text-white font-extrabold text-base mt-0.5">{u.total_eventos}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium">Alertas</p>
                      <p className={`font-extrabold text-base mt-0.5 ${u.alertas > 0 ? 'text-rose-400' : 'text-gray-300'}`}>
                        {u.alertas}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium">Positivos</p>
                      <p className="text-emerald-400 font-extrabold text-base mt-0.5">{u.positivos}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium">Média</p>
                      <p className="text-indigo-400 font-extrabold text-base mt-0.5">{u.pontuacao_media}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 mt-3 font-mono">
                    Último registro: {u.ultimo_evento ? new Date(u.ultimo_evento).toLocaleTimeString() : 'Nenhum evento associado'}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Relatorio;
