
import React from 'react';
import { LogOutIcon } from './icons/LogOutIcon.tsx';

interface HeaderProps {
    onStart: () => void;
    isAppView: boolean;
    isAuthenticated: boolean;
    onLogout: () => void;
    onGoToHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ onStart, isAppView, isAuthenticated, onLogout, onGoToHome }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center py-4">
            <a href="#" className="text-2xl font-bold text-slate-800 flex items-center" onClick={(e) => { e.preventDefault(); onGoToHome(); }}>
                GPO<span className="text-blue-500">.</span>
            </a>
            
            {!isAppView && (
                 <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                    <a href="#features" className="hover:text-blue-600 transition-colors">Funcionalidades</a>
                    <a href="#benefits" className="hover:text-blue-600 transition-colors">Benefícios</a>
                    <a href="#cta" className="hover:text-blue-600 transition-colors">Comece Agora</a>
                 </nav>
            )}

            <div className="flex items-center">
                {isAuthenticated ? (
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:inline text-sm text-slate-600 font-medium">Bem-vindo!</span>
                        <button 
                            onClick={onLogout}
                            className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg shadow-sm hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm"
                        >
                            <LogOutIcon className="w-4 h-4 mr-2"/>
                            Sair
                        </button>
                    </div>
                ) : (
                    !isAppView && (
                        <button 
                            onClick={onStart}
                            className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 text-sm"
                        >
                            Acessar Ferramenta
                        </button>
                    )
                )}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
