import {
    HomeIcon,
    CameraIcon,
    DocumentTextIcon,
    MoonIcon,
    Cog6ToothIcon,
    ChartPieIcon,
} from "@heroicons/react/24/outline";


export const Sidebar = ({ darkMode, setDarkMode, currentView, setCurrentView, VIEWS }) => {

    
    const NavLink = ({ view, label, icon: Icon }) => {
        
        const isActive = currentView === view;
        
        
        const classes = isActive
            ? "flex items-center gap-3 p-3 rounded-lg bg-indigo-600 text-white font-semibold shadow-md transition duration-150"
            : "flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 transition duration-150";

        return (
            
            <button 
                onClick={() => setCurrentView(view)} 
                className={classes}
            >
                <Icon className="w-5 h-5" />
                {label}
            </button>
        );
    };


    return (
        <aside className="w-64 h-screen p-4 bg-gray-800 flex flex-col shadow-lg sticky top-0">
            
            
            <div className="mb-8 text-center font-bold text-lg flex items-center justify-center gap-2 text-indigo-400">
                <ChartPieIcon className="w-6 h-6" />
                Emotion Dashboard
            </div>

            
            <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
                
                <NavLink view={VIEWS.DASHBOARD} label="Dashboard" icon={HomeIcon} />
                <NavLink view={VIEWS.LIVE_FEED} label="Live Feed" icon={CameraIcon} />
                <NavLink view={VIEWS.RELATORIOS} label="Relatórios" icon={DocumentTextIcon} />
                <NavLink view={VIEWS.CONFIGURACOES} label="Configurações" icon={Cog6ToothIcon} />
                
            </nav>
            
            
            <div className="mt-auto pt-4 border-t border-gray-700">
                <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className="flex items-center justify-between w-full p-3 rounded-lg text-gray-300 hover:bg-gray-700 transition duration-150"
                >
                    <span className="flex items-center gap-3">
                        <MoonIcon className="w-5 h-5" />
                        Modo Escuro
                    </span>
                    <span className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${darkMode ? 'bg-indigo-600 justify-end' : 'bg-gray-400'}`}>
                        <span className="w-4 h-4 bg-white rounded-full shadow-md transform transition-transform" />
                    </span>
                </button>
            </div>
        </aside>
    );
};