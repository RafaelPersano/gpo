import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { MailIcon } from './icons/MailIcon';
import { LockIcon } from './icons/LockIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { KeyIcon } from './icons/KeyIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { TerminalIcon } from './icons/TerminalIcon';
import CopyButton from './CopyButton';


interface LoginProps {
  onGoToHome: () => void;
  isBackendConfigured: boolean;
  onEnterDemoMode: () => void;
}

const setupSqlScript = `
-- PASSO 1: Adicionar a coluna de saldo de tokens na tabela de perfis.
-- O valor padrão de 10 será aplicado a todos os NOVOS usuários.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS token_balance INTEGER NOT NULL DEFAULT 10;

-- PASSO 2: Função para criar um perfil para um novo usuário.
-- Esta função será chamada por um gatilho sempre que um novo usuário se cadastrar.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, token_balance)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'user', 10);
  RETURN new;
END;
$$;

-- PASSO 3: Criar o gatilho que chama a função acima.
-- Este gatilho garante que todo usuário que se cadastra tenha um perfil criado automaticamente.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- PASSO 4: Funções de segurança para o App (RPC - Remote Procedure Calls)
-- Estas funções são chamadas pelo código do aplicativo e são executadas com segurança no servidor.

-- Função para buscar a ROLE do usuário logado (usada pelas políticas de segurança)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$;

-- Adicionado DROP para permitir a recriação da função com nova assinatura, corrigindo o erro de "cannot change return type".
DROP FUNCTION IF EXISTS public.get_my_profile_data();

-- Função para buscar os DADOS do perfil do usuário logado (usada pelo app)
CREATE OR REPLACE FUNCTION public.get_my_profile_data()
RETURNS TABLE(id uuid, full_name text, role text, token_balance integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.full_name, p.role, p.token_balance
  FROM profiles p
  WHERE p.id = auth.uid();
END;
$$;

-- Função para um ADMINISTRADOR alterar a role de outro usuário
CREATE OR REPLACE FUNCTION public.admin_update_user_role(user_id_to_update uuid, new_role text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF get_my_role() != 'admin' THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar as permissões de usuários.';
  END IF;

  UPDATE public.profiles
  SET role = new_role
  WHERE id = user_id_to_update;
END;
$$;

-- Função para DECREMENTAR o token do usuário logado ao gerar um projeto
CREATE OR REPLACE FUNCTION public.decrement_token()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_balance int;
BEGIN
  IF (SELECT token_balance FROM public.profiles WHERE id = auth.uid()) <= 0 THEN
    RAISE EXCEPTION 'Saldo de tokens insuficiente.';
  END IF;

  UPDATE public.profiles
  SET token_balance = token_balance - 1
  WHERE id = auth.uid()
  RETURNING token_balance INTO new_balance;
  
  RETURN new_balance;
END;
$$;

-- Função para ADICIONAR tokens ao usuário logado (simula a compra de um plano)
CREATE OR REPLACE FUNCTION public.add_tokens(tokens_to_add integer)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_balance int;
BEGIN
  UPDATE public.profiles
  SET token_balance = token_balance + tokens_to_add
  WHERE id = auth.uid()
  RETURNING token_balance INTO new_balance;
  
  RETURN new_balance;
END;
$$;

-- PASSO 5: Limpar políticas antigas para evitar conflitos.
DROP POLICY IF EXISTS "Enable read for admins and own user" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users to own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON public.profiles;

-- PASSO 6: Novas Políticas de Segurança (RLS - Row Level Security)
-- Permite que administradores leiam todos os perfis e usuários comuns leiam apenas o seu próprio.
CREATE POLICY "Enable read for admins and own user"
ON public.profiles FOR SELECT
USING ((public.get_my_role() = 'admin'::text) OR (auth.uid() = id));

-- Permite que usuários atualizem apenas seu próprio perfil.
CREATE POLICY "Enable update for users to own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Impede inserções diretas na tabela de perfis. A criação de perfil
-- deve ser feita exclusivamente pelo gatilho 'on_auth_user_created'.
CREATE POLICY "Enable insert for authenticated users"
ON public.profiles FOR INSERT
WITH CHECK (false);`.trim();

const Login: React.FC<LoginProps> = ({ onGoToHome, isBackendConfigured, onEnterDemoMode }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        setError(error.message);
      } else if (data.user && data.user.identities?.length === 0) {
        setError("Não foi possível criar a conta. As inscrições podem estar desativadas.");
      } else if (data.user) {
        setMessage('Cadastro realizado com sucesso! Por favor, verifique seu e-mail para confirmar sua conta.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError('E-mail ou senha inválidos.');
      }
      // onLoginSuccess is handled by the onAuthStateChange listener in App.tsx
    }
    setIsLoading(false);
  };

  if (!isBackendConfigured) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="max-w-3xl w-full bg-white p-8 md:p-10 border border-slate-200 rounded-2xl shadow-xl space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Guia de Configuração do Supabase</h2>
            <p className="text-center text-slate-500">
              Para ativar o login, o cadastro de usuários e o salvamento de projetos, siga os dois passos abaixo para conectar este aplicativo ao seu próprio projeto Supabase.
            </p>
          </div>

          <div className="space-y-6 p-6 border border-slate-200 rounded-lg bg-slate-50">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                <KeyIcon className="w-6 h-6 text-blue-600"/> Passo 1: Configurar Chaves de API
              </h3>
              <p className="text-sm text-slate-600">No seu projeto Supabase, vá em <strong>Project Settings &rarr; API</strong>.</p>
              <p className="text-sm text-slate-600">Copie a <strong>URL do Projeto</strong> e a chave pública <strong>anon key</strong>.</p>
              <p className="text-sm text-slate-600">Estas chaves devem ser configuradas como <strong>variáveis de ambiente</strong> no seu serviço de hospedagem (Vercel, Netlify, etc.) ou como <strong>"Repository Secrets"</strong> no GitHub se você estiver usando GitHub Actions para o deploy.</p>
              <p className="text-sm text-slate-700 font-semibold bg-red-100 border border-red-200 rounded p-2 mt-1">NUNCA salve estas chaves diretamente no código ou em arquivos públicos no GitHub.</p>
              <p className="text-xs text-slate-500 mt-2">Exemplo de locais para configurar:</p>
                <ul className="list-disc list-inside text-xs text-slate-500 pl-4">
                    <li><strong>Vercel:</strong> Project Settings &rarr; Environment Variables</li>
                    <li><strong>Netlify:</strong> Site settings &rarr; Build & deploy &rarr; Environment</li>
                    <li><strong>GitHub Actions:</strong> Repository Settings &rarr; Secrets and variables &rarr; Actions</li>
                </ul>
              <code className="block bg-slate-200 p-2 rounded-md text-xs text-slate-800 mt-2">
                SUPABASE_URL=SUA_URL_AQUI<br/>
                SUPABASE_ANON_KEY=SUA_CHAVE_ANON_AQUI
              </code>
            </div>

            <div className="space-y-2 pt-6 border-t border-slate-200">
              <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                <DatabaseIcon className="w-6 h-6 text-blue-600"/> Passo 2: Preparar o Banco de Dados
              </h3>
              <p className="text-sm text-slate-600">Vá para o <strong>SQL Editor</strong> no seu painel Supabase, crie uma nova query, cole o script abaixo e clique em <strong>"RUN"</strong> para criar as tabelas e funções necessárias.</p>
              <div className="relative mt-2">
                <pre className="bg-slate-800 text-white p-3 rounded-lg text-xs overflow-x-auto max-h-64">{setupSqlScript}</pre>
                <div className="absolute top-2 right-2">
                  <CopyButton text={setupSqlScript} />
                </div>
              </div>
            </div>
          </div>

          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800">Pronto!</h4>
            <p className="text-sm text-green-700 mt-1">Após completar os dois passos, <strong>recarregue a página</strong>. A tela de login e cadastro aparecerá, e você poderá usar todas as funcionalidades do GPO.</p>
          </div>
          
          <div className="space-y-4">
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-slate-300"></div>
              <span className="flex-shrink mx-4 text-slate-500 font-semibold">Ou, se preferir</span>
              <div className="flex-grow border-t border-slate-300"></div>
            </div>
            <button
              type="button"
              onClick={onEnterDemoMode}
              className="w-full inline-flex items-center justify-center px-5 py-3 bg-amber-100 text-amber-800 font-bold rounded-lg shadow-sm hover:bg-amber-200 border border-amber-200 transition-colors"
            >
              <KeyIcon className="w-5 h-5 mr-2"/>
              Testar em Modo de Demonstração (sem salvar)
            </button>
          </div>

          <div className="text-center mt-4">
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
  }

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full bg-white p-8 md:p-10 border border-slate-200 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">
          {isSignUp ? 'Criar Conta' : 'Acessar Plataforma'}
        </h2>
        <p className="text-center text-slate-500 mb-8">
          {isSignUp ? 'Junte-se ao GPO para otimizar suas obras.' : 'Bem-vindo(a) de volta!'}
        </p>
        
        {error && 
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-6 text-sm" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        }
        {message && 
          <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg relative mb-6 text-sm" role="alert">
            <span className="block sm:inline">{message}</span>
          </div>
        }
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">Nome Completo</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserCircleIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="block w-full rounded-md border-slate-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-12 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  placeholder="Seu Nome Completo"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
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
                className="block w-full rounded-md border-slate-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-12 disabled:bg-slate-100 disabled:cursor-not-allowed"
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
                minLength={6}
                className="block w-full rounded-md border-slate-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-12 disabled:bg-slate-100 disabled:cursor-not-allowed"
                placeholder="Pelo menos 6 caracteres"
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
              {isLoading ? (isSignUp ? 'Criando conta...' : 'Entrando...') : (isSignUp ? 'Criar Conta' : 'Entrar')}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-6 text-sm">
          {isSignUp ? (
            <p>
              Já tem uma conta?{' '}
              <button onClick={() => setIsSignUp(false)} className="font-medium text-blue-600 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed" disabled={isLoading}>
                Faça login
              </button>
            </p>
          ) : (
            <p>
              Não tem uma conta?{' '}
              <button onClick={() => setIsSignUp(true)} className="font-medium text-blue-600 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed" disabled={isLoading}>
                Cadastre-se
              </button>
            </p>
          )}
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onGoToHome(); }} 
            className="block mt-4 text-blue-600 hover:underline"
          >
            &larr; Voltar para a página inicial
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;