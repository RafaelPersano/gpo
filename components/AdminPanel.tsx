import React, { useState, useEffect } from 'react';
import * as db from '../services/supabaseService';
import type { UserProfile } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { TrashIcon } from './icons/TrashIcon';
import { SaveIcon } from './icons/SaveIcon';
import { supabase } from '../services/supabaseClient';
import { GitHubIcon } from './icons/GitHubIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { KeyIcon } from './icons/KeyIcon';
import { TerminalIcon } from './icons/TerminalIcon';
import { ShieldIcon } from './icons/ShieldIcon';
import CopyButton from './CopyButton';

const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'Ocorreu um erro inesperado.';
};

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
WITH CHECK (false);
`.trim();

const AdminPanel: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [pendingChanges, setPendingChanges] = useState<Record<string, 'user' | 'admin'>>({});
    const [isGuideVisible, setIsGuideVisible] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setCurrentUserId(user?.id || null);
                const fetchedUsers = await db.fetchAllUsers();
                setUsers(fetchedUsers);
            } catch (err) {
                const rawMessage = getErrorMessage(err);
                const lowerMessage = rawMessage.toLowerCase();
                if (lowerMessage.includes('edge function') || lowerMessage.includes('functions.invoke') || lowerMessage.includes('not found') || lowerMessage.includes('non-2xx')) {
                    setError(`Falha ao executar a função no servidor. O erro "non-2xx status code" indica um problema na sua Edge Function no Supabase.\n\nPARA DIAGNOSTICAR, SIGA ESTES PASSOS:\n\n1. VERIFIQUE OS LOGS DA FUNÇÃO:\n   - Vá para o seu projeto no Supabase -> Edge Functions -> clique em 'admin-get-all-users'.\n   - Na aba "Invocations", verifique as chamadas recentes. Se houver falhas (status 4xx ou 5xx), clique nelas para ver os logs de erro detalhados. ESTE É O PASSO MAIS IMPORTANTE.\n\n2. CONFIRME O SEGREDO (SECRET):\n   - Na mesma página da função, vá para a aba "Secrets".\n   - Verifique se existe um segredo chamado EXATAMENTE \`SUPABASE_SERVICE_ROLE_KEY\` (tudo maiúsculo).\n   - Confirme se o valor colado é a chave \`service_role\` completa do seu projeto, sem espaços extras.\n\n3. VERIFIQUE O STATUS DO DEPLOY:\n   - No seu repositório do GitHub, vá na aba "Actions". O último deploy para a função foi bem-sucedido (verde)?\n\n4. VERIFIQUE SUA PERMISSÃO DE ADMIN:\n   - No Supabase -> Database -> Tabela 'profiles', verifique se o seu usuário tem a role 'admin'.\n\nErro original retornado: ${rawMessage}`);
                } else {
                    setError(rawMessage);
                }
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const handleDeleteUser = async (userId: string, userEmail: string) => {
        if (window.confirm(`Tem certeza que deseja deletar o usuário ${userEmail}? Esta ação é irreversível.`)) {
            try {
                await db.deleteUserByAdmin(userId);
                setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            } catch (err) {
                const message = getErrorMessage(err);
                alert(`Falha ao deletar usuário: ${message}\n\nNota: A exclusão de usuários requer uma Supabase Edge Function com privilégios de administrador. Consulte a documentação no código para mais detalhes.`);
                setError(`Falha ao deletar usuário: ${message}`);
            }
        }
    };

    const handleRoleChange = (userId: string, newRole: 'user' | 'admin') => {
        setPendingChanges(prev => ({ ...prev, [userId]: newRole }));
    };

    const handleSaveChanges = async (userId: string) => {
        const newRole = pendingChanges[userId];
        if (!newRole) return;

        try {
            await db.updateUserRoleByAdmin(userId, newRole);
            setUsers(prevUsers => prevUsers.map(user => user.id === userId ? { ...user, role: newRole } : user));
            setPendingChanges(prev => {
                const newChanges = { ...prev };
                delete newChanges[userId];
                return newChanges;
            });
        } catch (err) {
            alert(`Falha ao atualizar função: ${getErrorMessage(err)}`);
        }
    };

    if (isLoading) {
        return <div className="text-center p-8"><LoadingSpinner /></div>;
    }

    if (error) {
        return <div className="p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg whitespace-pre-wrap">{error}</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Gerenciamento de Usuários</h2>
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">E-mail</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">Tokens</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">Função</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 text-base text-slate-900 font-medium">{user.full_name || 'Não informado'}</td>
                                <td className="px-4 py-3 text-base text-slate-600">{user.email}</td>
                                <td className="px-4 py-3 text-base text-slate-600 font-bold">{user.token_balance}</td>
                                <td className="px-4 py-3 text-base text-slate-600">
                                     <select
                                        value={pendingChanges[user.id] || user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'admin')}
                                        disabled={user.id === currentUserId}
                                        className={`rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm ${user.id === currentUserId ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="user">Usuário</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {pendingChanges[user.id] && (
                                            <button
                                                onClick={() => handleSaveChanges(user.id)}
                                                className="text-green-600 hover:text-green-800"
                                                title="Salvar alterações"
                                            >
                                                <SaveIcon className="w-5 h-5"/>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteUser(user.id, user.email)}
                                            className="text-red-600 hover:text-red-800 transition-colors disabled:text-slate-400"
                                            title="Deletar usuário"
                                            disabled={user.id === currentUserId}
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-12">
                <details className="bg-white rounded-lg border border-slate-200 shadow-sm transition-all" open={isGuideVisible} onToggle={(e) => setIsGuideVisible((e.target as HTMLDetailsElement).open)}>
                    <summary className="p-4 cursor-pointer text-lg font-bold text-slate-700 list-none flex justify-between items-center hover:bg-slate-50">
                        <span>Guia de Integração com Supabase</span>
                        <span className="text-sm font-medium text-blue-600">{isGuideVisible ? 'Ocultar Guia' : 'Mostrar Guia'}</span>
                    </summary>
                    <div className="p-6 border-t border-slate-200 text-slate-700 space-y-8">
                        <p>Este guia passo a passo foi criado para ajudar você a conectar este aplicativo a uma nova base de dados Supabase, habilitando todas as funcionalidades de backend, incluindo o painel de administrador.</p>

                        <div className="space-y-4 p-4 bg-slate-50 border-l-4 border-slate-300">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><KeyIcon className="w-6 h-6 text-blue-600"/>Passo 1: Configure as Chaves do Frontend</h3>
                            <p className="text-sm">Para que o aplicativo se conecte ao seu projeto Supabase, você precisa fornecer a URL do projeto e a chave pública (anônima).</p>
                             <ol className="list-decimal list-inside space-y-1 pl-4 text-sm">
                                <li>No seu projeto Supabase, vá em <strong>Project Settings &rarr; API</strong>.</li>
                                <li>Copie a <strong>Project URL</strong> e a chave <strong><code>anon</code> <code>public</code></strong>.</li>
                                <li>Configure-as como <strong>variáveis de ambiente</strong> no seu serviço de hospedagem (Vercel, Netlify) ou como <strong>Repository Secrets</strong> no GitHub (se usar Actions).</li>
                            </ol>
                            <p className="font-semibold text-red-600 my-2 text-sm">NUNCA salve estas chaves diretamente no código.</p>
                             <code className="block bg-slate-200 p-2 rounded-md text-xs text-slate-800">
                                SUPABASE_URL=SUA_URL_AQUI<br/>
                                SUPABASE_ANON_KEY=SUA_CHAVE_ANON_AQUI
                            </code>
                        </div>

                         <div className="space-y-4 p-4 bg-slate-50 border-l-4 border-slate-300">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><DatabaseIcon className="w-6 h-6 text-blue-600"/>Passo 2: Execute o Script de Configuração do Banco</h3>
                            <p className="text-sm">Este script SQL cria as tabelas, funções e políticas de segurança necessárias. Sem ele, você receberá erros de "infinite recursion" ou "function does not exist".</p>
                             <ol className="list-decimal list-inside space-y-1 pl-4 text-sm">
                                <li>No painel do Supabase, vá para o <strong>SQL Editor</strong>.</li>
                                <li>Crie uma <strong>nova query</strong>, cole o código abaixo e clique em <strong>"RUN"</strong>.</li>
                            </ol>
                            <div className="relative mt-2">
                                <pre className="bg-slate-800 text-white p-3 rounded-lg text-xs overflow-x-auto max-h-48">{setupSqlScript}</pre>
                                <div className="absolute top-2 right-2">
                                  <CopyButton text={setupSqlScript} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 p-4 bg-slate-50 border-l-4 border-slate-300">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><TerminalIcon className="w-6 h-6 text-blue-600"/>Passo 3: Implante as Funções de Servidor (Edge Functions)</h3>
                             <p className="text-sm">As funções de administrador (listar e deletar usuários) são seguras e precisam ser implantadas no Supabase. O código-fonte delas já está na pasta <code>/supabase/functions</code> deste projeto.</p>
                             <ol className="list-decimal list-inside space-y-1 pl-4 text-sm">
                                <li>Instale a Supabase CLI: <code>npm install supabase --save-dev</code></li>
                                <li>Faça login: <code>npx supabase login</code></li>
                                <li>Vincule seu projeto: <code>npx supabase link --project-ref SEU_PROJECT_ID</code></li>
                                <li>Implante as funções: <code>npx supabase functions deploy</code></li>
                            </ol>
                        </div>
                        
                        <div className="!mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-800 rounded-lg">
                            <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2"><KeyIcon className="w-6 h-6 text-amber-700"/>Passo 4: Configure a Chave de Serviço (CRÍTICO)</h3>
                            <p className="text-sm mt-1">As funções de admin precisam de permissão total. É aqui que você usará a chave de serviço (<code>service_role</code>).</p>
                             <ol className="list-decimal list-inside space-y-1 pl-4 text-sm">
                                <li>No painel do Supabase, vá em <strong>Project Settings &rarr; API</strong>.</li>
                                <li>Encontre a seção <strong>Project API keys</strong> e copie a chave <strong><code>service_role</code></strong> (clique em "Show").</li>
                                <li>Vá para <strong>Edge Functions</strong>, clique na função <code>admin-get-all-users</code>.</li>
                                <li>Vá em <strong>Secrets</strong>, clique em <strong>Add a new secret</strong>.</li>
                                <li>
                                    Preencha:
                                    <ul className="list-disc list-inside space-y-1 pl-6 mt-2">
                                        <li><strong>Name:</strong> <code>SUPABASE_SERVICE_ROLE_KEY</code></li>
                                        <li><strong>Value:</strong> [Cole a chave <code>service_role</code> que você copiou]</li>
                                    </ul>
                                </li>
                                <li>Repita o processo para a função <code>admin-delete-user</code>.</li>
                            </ol>
                        </div>


                        <div className="space-y-4 p-4 bg-slate-50 border-l-4 border-slate-300">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><ShieldIcon className="w-6 h-6 text-blue-600"/>Passo 5: Atribua a Permissão de Administrador</h3>
                            <p className="text-sm">Para acessar este painel, seu usuário precisa ter a permissão de 'admin'.</p>
                            <ol className="list-decimal list-inside space-y-1 pl-4 text-sm">
                                <li>No painel do Supabase, vá para o <strong>Table Editor</strong> e selecione a tabela <strong>profiles</strong>.</li>
                                <li>Encontre a linha correspondente ao seu usuário.</li>
                                <li>Clique duas vezes na célula da coluna <strong>role</strong>.</li>
                                <li>Mude o valor de <code>user</code> para <code>admin</code> e salve.</li>
                                <li>Recarregue o aplicativo. Agora você deverá ter acesso ao painel.</li>
                            </ol>
                        </div>

                    </div>
                </details>
            </div>
        </div>
    );
};

export default AdminPanel;