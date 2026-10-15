import {
  UserCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export const StatsCards = ({ data = [], onNavigate = () => {}, VIEWS = {} }) => {
  const ultimoEvento = data.length > 0 ? data[data.length - 1] : null;
  const facesDetectadas = ultimoEvento ? (ultimoEvento.pessoas_unicas_ate_agora || 0) : 0;
  const emocoesIdentificadas = data.length;
  
  const alertas = data.filter(
    (e) => e.comportamento === 'potencialmente agressivo' || e.comportamento === 'agressivo'
  ).length;

  const positivos = data.filter(
    (e) => e.comportamento === 'positivo' || e.expressao_dominante === 'happy'
  ).length;

  const taxaPositiva = emocoesIdentificadas > 0
    ? Math.round((positivos / emocoesIdentificadas) * 100)
    : 0;

  const cards = [
    {
      title: 'Pessoas Únicas',
      value: facesDetectadas,
      subtitle: 'Detectadas nas câmeras ativas',
      icon: UserCircleIcon,
      color: 'text-emerald-400',
      bgGlow: 'from-emerald-500/15 to-teal-500/5',
      borderColor: 'border-emerald-500/20 hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      targetView: VIEWS.CAMERAS,
      actionHint: 'Acessar Câmeras →',
    },
    {
      title: 'Eventos Registrados',
      value: emocoesIdentificadas.toLocaleString(),
      subtitle: 'Frames com análise emocional',
      icon: ChartBarIcon,
      color: 'text-indigo-400',
      bgGlow: 'from-indigo-500/15 to-blue-500/5',
      borderColor: 'border-indigo-500/20 hover:border-indigo-500/50',
      iconBg: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
      targetView: VIEWS.RELATORIOS,
      actionHint: 'Ver Relatórios →',
    },
    {
      title: 'Alertas Potenciais',
      value: alertas,
      subtitle: alertas > 0 ? 'Atenção necessária' : 'Nenhuma anomalia crítica',
      icon: ExclamationTriangleIcon,
      color: alertas > 0 ? 'text-rose-400' : 'text-gray-400',
      bgGlow: alertas > 0 ? 'from-rose-500/20 to-orange-500/5' : 'from-gray-700/10 to-gray-800/10',
      borderColor: alertas > 0 ? 'border-rose-500/40 hover:border-rose-500/70 hover:shadow-rose-500/20' : 'border-gray-700 hover:border-gray-600',
      iconBg: alertas > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-gray-700/40 text-gray-400',
      pulse: alertas > 0,
      targetView: VIEWS.ALERTAS,
      actionHint: 'Abrir Central de Alertas →',
    },
    {
      title: 'Clima Positivo',
      value: `${taxaPositiva}%`,
      subtitle: `${positivos} detecções positivas`,
      icon: SparklesIcon,
      color: 'text-purple-400',
      bgGlow: 'from-purple-500/15 to-pink-500/5',
      borderColor: 'border-purple-500/20 hover:border-purple-500/50',
      iconBg: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      targetView: VIEWS.RELATORIOS,
      actionHint: 'Ver Métricas →',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 mb-6">
      {cards.map((c) => {
        const Icon = c.icon;
        const isClickable = Boolean(c.targetView);
        return (
          <div
            key={c.title}
            onClick={() => {
              if (isClickable) onNavigate(c.targetView);
            }}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onKeyDown={(e) => {
              if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                onNavigate(c.targetView);
              }
            }}
            className={`group relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br bg-gray-800/90 border shadow-lg backdrop-blur-sm transition-all duration-200 ${
              isClickable ? 'cursor-pointer hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98]' : ''
            } ${c.bgGlow} ${c.borderColor}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  {c.title}
                </p>
                <h3 className={`text-3xl font-extrabold tracking-tight ${c.color}`}>
                  {c.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${c.iconBg} ${c.pulse ? 'animate-pulse' : ''}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
              <p className="flex items-center gap-1.5 truncate">
                {c.pulse && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping inline-block" />}
                <span className="truncate">{c.subtitle}</span>
              </p>
              {isClickable && (
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-gray-300 font-semibold underline decoration-dotted ml-2 flex-shrink-0">
                  {c.actionHint}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
