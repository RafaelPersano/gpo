
import React, { useState } from 'react';
import { MailIcon } from './icons/MailIcon.tsx';
import { LockIcon } from './icons/LockIcon.tsx';

interface LoginProps {
  onLoginSuccess: () => void;
  onGoToHome: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onGoToHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Mock authentication with a delay
    setTimeout(() => {
      if (email.toLowerCase() === 'usuario@gpo.com' && password === 'senha123') {
        onLoginSuccess();
      } else {
        setError('E-mail ou senha inválidos. Tente "usuario@gpo.com" e "senha123".');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full bg-white p-8 md:p-10 border border-slate-200 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Acessar Plataforma</h2>
        <p className="text-center text-slate-500 mb-8">Bem-vindo(a) de volta!</p>
        
        {error && 
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-6 text-sm" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        }
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">E-mail</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MailIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full rounded-md border-slate-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-12"
                placeholder="voce@exemplo.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password"className="block text-sm font-medium text-slate-700">Senha</label>
            <div className="mt-1 relative rounded-md shadow-sm">
               <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <LockIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full rounded-md border-slate-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-12"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div>
            <button 
              type="submit" 
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onGoToHome(); }} 
            className="text-sm text-blue-600 hover:underline"
          >
            &larr; Voltar para a página inicial
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
