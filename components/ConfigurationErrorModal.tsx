import React from 'react';
import { InfoIcon } from './icons/InfoIcon';
import { XIcon } from './icons/XIcon';

interface ConfigurationErrorModalProps {
  show: boolean;
  onClose: () => void;
}

const fixSqlScript = `
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
`;

const ConfigurationErrorModal: React.FC<ConfigurationErrorModalProps> = ({ show, onClose }) => {
  if (!show) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full m-4 transform transition-all">
        <div className="flex items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <InfoIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4 text-left flex-grow">
                <h3 className="text-lg font-bold leading-6 text-slate-900" id="modal-title">
                    Ação Necessária: Corrija a Configuração do Supabase
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-slate-600">
                        O aplicativo detectou um problema de configuração nas políticas de segurança (RLS) da sua tabela <strong>'profiles'</strong> no Supabase.
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                        Este não é um bug do aplicativo, mas uma configuração incorreta no seu banco de dados. Para que todas as funcionalidades (incluindo o login e o painel de admin) funcionem, você precisa corrigir isso no seu painel do Supabase.
                    </p>
                </div>
            </div>
             <button
                type="button"
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                onClick={onClose}
              >
                <XIcon className="h-6 w-6" />
              </button>
        </div>
        
        <div className="mt-6">
            <h4 className="font-semibold text-slate-800">Como Corrigir em 3 Passos</h4>
            <ol className="list-decimal list-inside mt-2 text-sm text-slate-600 space-y-2">
                <li>
                  Acesse seu projeto no Supabase, vá para <strong>Authentication &rarr; Policies</strong> e <strong>delete TODAS as políticas existentes</strong> para a tabela <code>public.profiles</code> para evitar conflitos.
                </li>
                <li>
                  Depois, vá para o <strong>SQL Editor</strong> na barra lateral esquerda (ícone de banco de dados).
                </li>
                <li>
                  Copie o script SQL completo abaixo, cole no editor e clique em <strong>"RUN"</strong>.
                </li>
            </ol>

            <pre className="mt-4 bg-slate-800 text-white p-4 rounded-lg text-xs overflow-x-auto">
                <code>
                    {fixSqlScript.trim()}
                </code>
            </pre>
            <p className="mt-3 text-xs text-slate-500">
                Este script cria as funções de segurança necessárias para o app funcionar e, em seguida, cria as políticas corretas para proteger seus dados.
            </p>
        </div>

        <div className="mt-6 text-right">
          <button
            type="button"
            className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            onClick={onClose}
          >
            Entendi, vou corrigir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationErrorModal;