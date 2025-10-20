import React from 'react';
import { LogOutIcon } from './icons/LogOutIcon';
import { TokenIcon } from './icons/TokenIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { KeyIcon } from './icons/KeyIcon';

interface UserProfileInfo {
  fullName: string | null;
  email: string | null;
}

interface HeaderProps {
    onStart: () => void;
    isAppView: boolean;
    isAuthenticated: boolean;
    onLogout: () => void;
    onGoToHome: () => void;
    tokenBalance: number | null;
    userProfileInfo: UserProfileInfo;
    userRole: 'admin' | 'user' | null;
    isSupabaseConfigured: boolean;
    onEnterDemoMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ onStart, isAppView, isAuthenticated, onLogout, onGoToHome, tokenBalance, userProfileInfo, userRole, isSupabaseConfigured, onEnterDemoMode }) => {
  const isDemoMode = !isSupabaseConfigured;
  
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
                        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5">
                            <TokenIcon className="w-5 h-5 text-yellow-500"/>
                            <span className="text-sm font-bold text-slate-700">{tokenBalance ?? 0}</span>
                            <span className="hidden sm:inline text-sm text-slate-600">Tokens</span>
                        </div>

                        <div className="hidden sm:flex items-center gap-3">
                            <UserCircleIcon className="w-8 h-8 text-slate-500" />
                            <div>
                                <p className="text-sm font-bold text-slate-800 leading-tight">
                                    {userProfileInfo.fullName || 'Usuário'}
                                    {userRole === 'admin' && <span className="ml-1.5 text-xs font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Admin</span>}
                                </p>
                                <p className="text-xs text-slate-500 leading-tight truncate max-w-[150px]">{userProfileInfo.email}</p>
                            </div>
                        </div>

                        <button 
                            onClick={onLogout}
                            className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg shadow-sm hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm"
                        >
                            <LogOutIcon className="w-4 h-4 mr-2"/>
                            Sair
                        </button>
                    </div>
                ) : isAppView ? (
                     isDemoMode ? (
                         <button
                            onClick={onEnterDemoMode}
                            className="flex items-center gap-2 bg-amber-100 border border-amber-200 rounded-lg px-3 py-1.5 hover:bg-amber-200 transition-colors"
                        >
                            <KeyIcon className="w-5 h-5 text-amber-500"/>
                            <span className="text-sm font-bold text-amber-800">Modo de Demonstração</span>
                        </button>
                    ) : (
                        <button 
                            onClick={onStart}
                            className="px-5 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg shadow-sm hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm"
                        >
                            Entrar / Cadastrar
                        </button>
                    )
                ) : (
                    <button 
                        onClick={onStart}
                        className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 text-sm"
                    >
                        Acessar Ferramenta
                    </button>
                )}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;