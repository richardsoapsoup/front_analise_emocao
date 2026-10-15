import {
  HomeIcon,
  CameraIcon,
  DocumentTextIcon,
  MoonIcon,
  Cog6ToothIcon,
  ChartPieIcon,
  UsersIcon,
  XMarkIcon,
  SignalIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";

export const Sidebar = ({
  darkMode,
  setDarkMode,
  currentView,
  setCurrentView,
  VIEWS,
  mobileOpen = false,
  setMobileOpen = () => {},
  alertCount = 0,
}) => {
  const NavLink = ({ view, label, icon: Icon, badge }) => {
    const isActive = currentView === view;

    const classes = isActive
      ? "flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium shadow-md shadow-indigo-600/30 transition-all duration-200"
      : "flex items-center justify-between p-3 rounded-xl text-gray-300 hover:text-white hover:bg-gray-700/60 transition-all duration-150";

    return (
      <button
        onClick={() => {
          setCurrentView(view);
          setMobileOpen(false);
        }}
        className={classes}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} />
          <span className="text-sm">{label}</span>
        </div>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Backdrop overlay para mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 lg:static lg:w-64 bg-gray-900/95 lg:bg-gray-800/95 backdrop-blur-md border-r border-gray-700/60 flex flex-col p-4 shadow-2xl lg:shadow-none transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header do Sidebar */}
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-600/40">
              <ChartPieIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white tracking-wide text-base leading-tight">
                EmotionLens
              </h1>
              <p className="text-xs text-indigo-400 font-medium">Monitoramento AI</p>
            </div>
          </div>

          {/* Botão de fechar visível apenas em mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700"
            aria-label="Fechar menu"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Links de navegação */}
        <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-1">
          <NavLink
            view={VIEWS.DASHBOARD}
            label="Dashboard"
            icon={HomeIcon}
          />

          <NavLink
            view={VIEWS.CAMERAS}
            label="Central de Câmeras"
            icon={CameraIcon}
          />

          <NavLink
            view={VIEWS.ALERTAS}
            label="Alertas de Raiva"
            icon={ShieldExclamationIcon}
            badge={alertCount > 0 ? `${alertCount}` : null}
          />

          <NavLink
            view={VIEWS.USUARIOS}
            label="Usuários"
            icon={UsersIcon}
          />

          <NavLink
            view={VIEWS.RELATORIOS}
            label="Relatórios Dinâmicos"
            icon={DocumentTextIcon}
          />

          <NavLink
            view={VIEWS.CONFIGURACOES}
            label="Configurações"
            icon={Cog6ToothIcon}
          />
        </nav>

        {/* Rodapé do Sidebar */}
        <div className="mt-auto pt-4 flex flex-col gap-3 border-t border-gray-700/60">
          {/* Card de Status do Sistema */}
          <div className="px-3 py-2 rounded-lg bg-gray-800/80 border border-gray-700/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Servidor Local</span>
            </div>
            <span className="text-emerald-400 font-medium">Ativo</span>
          </div>

          {/* Modo Escuro */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center justify-between w-full p-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-700/50 transition duration-150"
          >
            <span className="flex items-center gap-2.5 text-xs font-medium">
              <MoonIcon className="w-4 h-4 text-indigo-400" />
              Modo Escuro
            </span>

            <span
              className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                darkMode ? "bg-indigo-600 justify-end" : "bg-gray-600 justify-start"
              }`}
            >
              <span className="w-4 h-4 bg-white rounded-full shadow-md transform transition-transform" />
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};