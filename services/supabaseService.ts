import { supabase } from './supabaseClient';
import type { ConstructionPlan, ConstructionTask, UserProfile } from '../types';

/*
 * =========================================================================================
 *   NOTA DE SEGURANÇA CRÍTICA
 * =========================================================================================
 * A CHAVE 'service_role' DO SUPABASE NUNCA DEVE SER USADA OU ARMAZENADA NO CÓDIGO DO FRONTEND.
 * Esta chave concede acesso total ao seu banco de dados, ignorando todas as políticas de
 * segurança. A única maneira segura de usá-la é dentro de um ambiente de servidor, como
 * as Supabase Edge Functions, onde ela é configurada como um "Secret" (variável de ambiente).
 * O código abaixo segue essa prática segura, invocando Edge Functions para operações de admin.
*/


// Helper function to standardize error handling
const handleSupabaseError = (error: any, context: string): Error => {
    let finalMessage: string;

    if (error && typeof error === 'object') {
        if (typeof error.message === 'string' && error.message.trim()) {
            finalMessage = error.message;
        } else if (typeof error.error_description === 'string' && error.error_description.trim()) {
            finalMessage = error.error_description;
        } else if (typeof error.error === 'string' && error.error.trim()) {
            finalMessage = error.error;
        } else {
            finalMessage = `Ocorreu um erro desconhecido ${context}.`;
        }
    } else if (typeof error === 'string' && error.trim()) {
        finalMessage = error;
    } else {
        finalMessage = `Ocorreu um erro desconhecido ${context}.`;
    }

    if (finalMessage.toLowerCase().includes('infinite recursion')) {
        return new Error('Erro de Configuração do Banco de Dados: Detectada uma recursão infinita na política de segurança da tabela "profiles" no Supabase. Isso geralmente ocorre devido a uma política de RLS (Row Level Security) mal configurada. Por favor, verifique suas políticas no painel do Supabase para garantir que não criem um loop. A nota neste arquivo (services/supabaseService.ts) contém instruções detalhadas para a correção.');
    }
    
    return new Error(finalMessage);
};


const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw handleSupabaseError(error, 'ao obter usuário');
    if (!user) throw new Error("Usuário não autenticado.");
    return user;
};

export const fetchUserProfile = async (): Promise<UserProfile | null> => {
    const user = await getCurrentUser();
    
    // CHAMADA RPC SEGURA: Em vez de consultar a tabela 'profiles' diretamente (o que aciona
    // as políticas RLS e pode causar recursão), chamamos uma função de banco de dados
    // 'get_my_profile_data' que é executada com 'SECURITY DEFINER'. Isso ignora as
    // políticas RLS para esta consulta específica, tornando o login mais resiliente a
    // configurações incorretas do usuário, e corrigindo o erro de recursão no login.
    // FIX: The function name must be passed as a string. The function takes no arguments, so extra parameters were removed.
    // Fix: Corrected RPC call to pass the function name as a string and remove extra arguments.
    // FIX: The function name `get_my_profile_data` must be passed as a string, and it expects no arguments.
    // FIX: The RPC function name must be passed as a string, and it expects no arguments.
    // Fix: The RPC function name must be a string and it takes no arguments.
    const { data, error } = await supabase.rpc('get_my_profile_data');

    if (error) {
        // Se a função 'get_my_profile_data' não existir, o Supabase retornará um erro
        // como "relation "get_my_profile_data" does not exist".
        // Isso é um forte indicador de que o usuário não executou o script de correção.
        if (error.message.toLowerCase().includes('function get_my_profile_data() does not exist') || error.message.toLowerCase().includes('relation "get_my_profile_data" does not exist')) {
            // Lançamos um erro específico que será capturado pelo App.tsx para mostrar o modal.
            throw new Error('Erro de Configuração do Banco de Dados: A função de segurança \\'get_my_profile_data\\' não foi encontrada. Por favor, execute o script SQL fornecido no modal de configuração para criar as funções e políticas necessárias.');
        }
        throw handleSupabaseError(error, 'ao buscar perfil do usuário');
    }

    // A chamada RPC retorna um array, mesmo que haja apenas um resultado.
    const profileData = data && Array.isArray(data) && data.length > 0 ? data[0] : null;

    if (!profileData) return null;

    return { 
        id: profileData.id,
        full_name: profileData.full_name,
        role: profileData.role,
        token_balance: profileData.token_balance,
        email: user.email || '', 
        created_at: user.created_at || '' 
    } as UserProfile;
}

/*
 * =========================================================================================
 *   GUIA DE CORREÇÃO OBRIGATÓRIO: ACESSO AO PAINEL DE ADMINISTRADOR
 * =========================================================================================
 * ATENÇÃO: O erro 'Failed to send a request to the Edge Function' que você está vendo
 * significa que uma parte essencial do back-end está faltando. O seu aplicativo está
 * tentando chamar uma função segura no servidor Supabase chamada 'admin-get-all-users',
 * mas ela ainda não foi criada.
 *
 * ISSO NÃO É UM ERRO NO CÓDIGO DO APLICATIVO. Para corrigir, a pessoa que gerencia o
 * projeto Supabase precisa seguir os passos abaixo para criar e implantar esta função.
 * O painel de administrador SÓ funcionará depois que isso for feito.
 *
 *   PASSO 1: INSTALE E FAÇA LOGIN NA SUPABASE CLI (se ainda não fez)
 *   > npm install supabase --save-dev
 *   > npx supabase login
 *
 *   PASSO 2: CRIE A NOVA EDGE FUNCTION
 *   > npx supabase functions new admin-get-all-users
 *
 *   PASSO 3: SUBSTITUA O CÓDIGO DA FUNÇÃO
 *   Abra o arquivo gerado em `supabase/functions/admin-get-all-users/index.ts`
 *   e substitua TODO o conteúdo dele pelo código abaixo:
 *
 *   import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
 *   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
 *
 *   const corsHeaders = {
 *     'Access-Control-Allow-Origin': '*',
 *     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 *   }
 *
 *   serve(async (req) => {
 *     if (req.method === 'OPTIONS') {
 *       return new Response('ok', { headers: corsHeaders })
 *     }
 *
 *     try {
 *       // Cria um cliente Supabase com as permissões do usuário que fez a chamada.
 *       const supabaseClient = createClient(
 *         Deno.env.get('SUPABASE_URL') ?? '',
 *         Deno.env.get('SUPABASE_ANON_KEY') ?? '',
 *         { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
 *       )
 *
 *       // Verifica se o usuário está autenticado.
 *       const { data: { user } } = await supabaseClient.auth.getUser();
 *       if (!user) throw new Error('Usuário não autenticado.');
 *       
 *       // **MELHORIA DE SEGURANÇA E ROBUSTEZ:**
 *       // Em vez de consultar a tabela 'profiles' (que está sujeita a RLS e pode causar
 *       // problemas), chamamos a função RPC 'get_my_role'. Como ela é 'SECURITY DEFINER',
 *       // ela ignora as políticas RLS para esta verificação, tornando o processo mais confiável.
 *       const { data: userRole, error: rpcError } = await supabaseClient.rpc('get_my_role');
 * 
 *       if (rpcError || userRole !== 'admin') {
 *         return new Response(JSON.stringify({ error: 'Acesso negado. Apenas administradores podem executar esta ação.' }), {
 *           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
 *           status: 403,
 *         });
 *       }
 *
 *       // Se a verificação de admin passar, cria um cliente com a SERVICE_ROLE_KEY para ter acesso total.
 *       const supabaseAdmin = createClient(
 *         Deno.env.get('SUPABASE_URL') ?? '',
 *         Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
 *       );
 *
 *       // Busca todos os perfis da tabela 'profiles'.
 *       const { data: profiles, error: profilesError } = await supabaseAdmin
 *           .from('profiles')
 *           .select('id, full_name, role, token_balance');
 *       
 *       if (profilesError) throw profilesError;
 *
 *       // Busca todos os usuários da tabela 'auth.users' para pegar e-mail e data de criação.
 *       const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
 *       if (authError) throw authError;
 *
 *       // Combina os dados das duas tabelas.
 *       const userMetaMap = new Map(authUsers.map(u => [u.id, { email: u.email, created_at: u.created_at }]));
 *       const combinedUsers = profiles.map(p => {
 *           const meta = userMetaMap.get(p.id);
 *           return { ...p, email: meta?.email || 'N/A', created_at: meta?.created_at || 'N/A' }
 *       });
 *
 *       return new Response(JSON.stringify({ users: combinedUsers }), {
 *         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
 *         status: 200,
 *       })
 *
 *     } catch (error) {
 *       return new Response(JSON.stringify({ error: error.message }), {
 *         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
 *         status: 500,
 *       })
 *     }
 *   })
 *
 *   PASSO 4: IMPLANTE A FUNÇÃO NO SUPABASE
 *   > npx supabase functions deploy admin-get-all-users --project-ref SEU_PROJECT_REF
 *   (Você encontra o SEU_PROJECT_REF nas configurações do seu projeto Supabase).
 *
 *   PASSO 5: ADICIONE A CHAVE DE SERVIÇO (MUITO IMPORTANTE!)
 *   1. No painel do Supabase, vá em "Project Settings" (ícone de engrenagem) -> "API".
 *   2. Copie a chave "service_role" (é um token longo).
 *   3. Vá em "Edge Functions" (ícone de nuvem com raio), clique em 'admin-get-all-users'.
 *   4. Vá em "Secrets" e adicione um novo segredo:
 *      - Name: SUPABASE_SERVICE_ROLE_KEY
 *      - Value: [cole a chave que você copiou]
 *
 *   Após seguir estes passos, recarregue o aplicativo.
*/
export const fetchAllUsers = async (): Promise<UserProfile[]> => {
    // Invoca a Edge Function segura em vez de fazer chamadas de admin no cliente.
    const { data, error } = await supabase.functions.invoke('admin-get-all-users');

    if (error) {
        throw handleSupabaseError(error, 'ao buscar todos os usuários');
    }

    if (!data || !Array.isArray(data.users)) {
        throw new Error("A resposta da função de busca de usuários é inválida.");
    }
    
    // A Edge Function já retorna os dados no formato esperado.
    return data.users as UserProfile[];
};

/*
 * =========================================================================================
 *   GUIA DE CORREÇÃO OBRIGATÓRIO: DELETAR USUÁRIOS
 * =========================================================================================
 * Assim como para listar usuários, a ação de deletar um usuário precisa de uma Edge Function
 * segura. Siga os mesmos passos da função 'admin-get-all-users', mas com os dados abaixo.
 *
 *   PASSO 1: CRIE A NOVA EDGE FUNCTION
 *   > npx supabase functions new admin-delete-user
 *
 *   PASSO 2: SUBSTITUA O CÓDIGO DA FUNÇÃO
 *   Abra o arquivo em `supabase/functions/admin-delete-user/index.ts` e cole o código:
 *
 *   import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
 *   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
 *
 *   const corsHeaders = {
 *     'Access-Control-Allow-Origin': '*',
 *     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 *   }
 *
 *   serve(async (req) => {
 *     if (req.method === 'OPTIONS') {
 *       return new Response('ok', { headers: corsHeaders })
 *     }
 *
 *     try {
 *       const { userIdToDelete } = await req.json();
 *       if (!userIdToDelete) throw new Error('O ID do usuário a ser deletado não foi fornecido.');
 *
 *       const supabaseClient = createClient(
 *         Deno.env.get('SUPABASE_URL') ?? '',
 *         Deno.env.get('SUPABASE_ANON_KEY') ?? '',
 *         { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
 *       );
 *
 *       const { data: { user } } = await supabaseClient.auth.getUser();
 *       if (!user) throw new Error('Usuário não autenticado.');
 *
 *       // **MELHORIA DE SEGURANÇA E ROBUSTEZ:**
 *       // Utiliza a mesma chamada RPC 'get_my_role' para verificar a permissão de admin.
 *       const { data: userRole, error: rpcError } = await supabaseClient.rpc('get_my_role');
 *
 *       if (rpcError || userRole !== 'admin') {
 *         return new Response(JSON.stringify({ error: 'Acesso negado.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
 *       }
 *
 *       const supabaseAdmin = createClient(
 *         Deno.env.get('SUPABASE_URL') ?? '',
 *         Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
 *       );
 *
 *       const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete);
 *       if (deleteError) throw deleteError;
 *
 *       return new Response(JSON.stringify({ message: 'Usuário deletado com sucesso.' }), {
 *         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
 *         status: 200,
 *       });
 *
 *     } catch (error) {
 *       return new Response(JSON.stringify({ error: error.message }), {
 *         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
 *         status: 500,
 *       });
 *     }
 *   })
 *
 *   PASSO 3: IMPLANTE A FUNÇÃO
 *   > npx supabase functions deploy admin-delete-user --project-ref SEU_PROJECT_REF
 *
 *   PASSO 4: ADICIONE A CHAVE DE SERVIÇO (SE AINDA NÃO FEZ)
 *   A função precisa da `SUPABASE_SERVICE_ROLE_KEY`. Se você já a adicionou para a
 *   função anterior, não precisa fazer de novo. Caso contrário, adicione-a nos "Secrets"
 *   da função 'admin-delete-user' no painel do Supabase.
 */
export const deleteUserByAdmin = async (userId: string) => {
    const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userIdToDelete: userId },
    });

    if (error) {
        throw handleSupabaseError(error, 'ao deletar usuário');
    }

    return data;
};

export const updateUserRoleByAdmin = async (userId: string, newRole: 'admin' | 'user') => {
    const { data, error } = await supabase.rpc('admin_update_user_role', {
        user_id_to_update: userId,
        new_role: newRole,
    });
    if (error) {
        throw handleSupabaseError(error, 'ao atualizar a função do usuário');
    }
    return data;
};

export const decrementToken = async (): Promise<number> => {
    const { data, error } = await supabase.rpc('decrement_token');
    if (error) {
        throw handleSupabaseError(error, 'ao decrementar token');
    }
    return data;
};

export const addTokens = async (tokensToAdd: number): Promise<number> => {
    const { data, error } = await supabase.rpc('add_tokens', {
        tokens_to_add: tokensToAdd,
    });
    if (error) {
        throw handleSupabaseError(error, 'ao adicionar tokens');
    }
    return data;
};


export const fetchProjects = async () => {
    const user = await getCurrentUser();
    const { data, error } = await supabase
        .from('projects')
        .select('id, project_name, client_name, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        throw handleSupabaseError(error, 'ao buscar projetos');
    }
    return data;
};

export const fetchFullProject = async (projectId: number) => {
    const user = await getCurrentUser();
    
    const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

    if (projectError) {
        throw handleSupabaseError(projectError, 'ao buscar dados do projeto');
    }
    if (!projectData) throw new Error("Projeto não encontrado.");

    const [
        tasksResult,
        materialsResult,
        paymentsResult
    ] = await Promise.all([
        supabase.from('tasks').select('*').eq('project_id', projectId).order('id'),
        supabase.from('material_deliveries').select('*').eq('project_id', projectId).order('id'),
        supabase.from('payment_schedule').select('*').eq('project_id', projectId).order('id')
    ]);

    const errors = [tasksResult.error, materialsResult.error, paymentsResult.error].filter(Boolean);
    if (errors.length > 0) {
        console.error("Erro ao buscar detalhes do projeto:", errors);
        const errorMessages = errors.map(e => e!.message).join('; ');
        throw new Error(`Falha ao carregar detalhes do projeto: ${errorMessages}`);
    }

    const plan: ConstructionPlan = {
        projectStartDate: projectData.project_start_date,
        projectEndDate: projectData.project_end_date,
        budget: {
            total: projectData.budget_total,
            materials: projectData.budget_materials,
            labor: projectData.budget_labor,
            managerFee: projectData.budget_manager_fee,
        },
        tasks: tasksResult.data || [],
        materialDeliveries: materialsResult.data || [],
        paymentSchedule: paymentsResult.data || [],
    };
    
    const marketingMaterials = projectData.marketing_materials;
    const projectSummary = projectData.project_details?.summary; 
    const proposalText = projectData.descriptive_memorial;

    return { projectData, plan, marketingMaterials, projectSummary, proposalText };
};


export const saveFullProject = async (
    projectData: any,
    plan: ConstructionPlan,
    projectSummary: string,
    proposalText: string,
    marketingMaterials: any
) => {
    const user = await getCurrentUser();

    // 1. Insert the main project record.
    const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
            user_id: user.id,
            project_name: marketingMaterials?.commercialNames[0] || 'Novo Projeto',
            user_input: projectData.userInput,
            client_name: projectData.clientName,
            total_budget_input: projectData.totalBudget,
            start_date_input: projectData.startDate || null,
            end_date_input: projectData.endDate || null,
            responsible_professional: projectData.responsibleProfessional,
            project_start_date: plan.projectStartDate,
            project_end_date: plan.projectEndDate,
            budget_total: plan.budget.total,
            budget_materials: plan.budget.materials,
            budget_labor: plan.budget.labor,
            budget_manager_fee: plan.budget.managerFee,
            project_details: { summary: projectSummary },
            marketing_materials: marketingMaterials,
            descriptive_memorial: proposalText
        })
        .select()
        .single();

    if (projectError) {
        throw handleSupabaseError(projectError, 'ao salvar projeto');
    }
    
    const projectId = newProject.id;

    // 2. Prepare and insert tasks, then retrieve their new database IDs.
    const tasksToInsert = plan.tasks.map(task => ({
        project_id: projectId,
        user_id: user.id,
        phase: task.phase,
        task_name: task.taskName,
        description: task.description,
        assignee: task.assignee,
        start_date: task.startDate,
        end_date: task.endDate,
        status: task.status,
        dependencies: task.dependencies,
        cost_materials: task.costMaterials,
        cost_labor: task.costLabor,
        notes: task.notes
    }));

    const { data: insertedTasks, error: tasksError } = await supabase
        .from('tasks')
        .insert(tasksToInsert)
        .select();

    if (tasksError) {
        await supabase.from('projects').delete().eq('id', newProject.id); // Cleanup
        throw handleSupabaseError(tasksError, 'ao salvar tarefas');
    }

    if (!insertedTasks || insertedTasks.length !== plan.tasks.length) {
        await supabase.from('projects').delete().eq('id', newProject.id); // Cleanup
        throw new Error('A contagem de tarefas salvas não corresponde à esperada.');
    }

    // 3. Create a map from Gemini's temporary IDs to the new permanent database IDs.
    const taskIdMap = new Map<number, number>();
    plan.tasks.forEach((originalTask, index) => {
        taskIdMap.set(originalTask.id, insertedTasks[index].id);
    });

    // 4. Update task dependencies with the new database IDs.
    const taskUpdatePromises = insertedTasks.map(async (newTask, index) => {
        const originalTask = plan.tasks[index];
        if (originalTask.dependencies && originalTask.dependencies !== 'Nenhuma') {
            const oldDepIds = originalTask.dependencies.split(',').map(idStr => parseInt(idStr.trim(), 10));
            const newDepIds = oldDepIds.map(oldId => taskIdMap.get(oldId)).filter(Boolean).join(', ');
            if (newDepIds && newDepIds !== newTask.dependencies) {
                return supabase.from('tasks').update({ dependencies: newDepIds }).eq('id', newTask.id);
            }
        }
        return Promise.resolve();
    });

    await Promise.all(taskUpdatePromises);

    // 5. Prepare materials and payments with the correct, newly created task IDs.
    const materialsToInsert = plan.materialDeliveries.map(material => ({
        project_id: projectId,
        user_id: user.id,
        material_name: material.materialName,
        related_task_id: taskIdMap.get(material.relatedTaskId),
        delivery_date: material.deliveryDate,
        supplier: material.supplier,
        status: material.status
    }));
    
    const paymentsToInsert = plan.paymentSchedule.map(payment => ({
        project_id: projectId,
        user_id: user.id,
        description: payment.description,
        due_date: payment.dueDate,
        amount: payment.amount,
        status: payment.status,
        category: payment.category
    }));

    // 6. Insert the dependent records (materials and payments).
    const results = await Promise.all([
        materialsToInsert.length > 0 ? supabase.from('material_deliveries').insert(materialsToInsert) : Promise.resolve({ error: null }),
        paymentsToInsert.length > 0 ? supabase.from('payment_schedule').insert(paymentsToInsert) : Promise.resolve({ error: null }),
    ]);
     
    const errors = results.map(r => r.error).filter(Boolean);
    if (errors.length > 0) {
        console.error("Erro ao salvar detalhes do projeto (materiais/pagamentos):", errors);
        await supabase.from('projects').delete().eq('id', newProject.id); // Cleanup
        const errorMessages = errors.map(e => e!.message).join('; ');
        throw new Error(`Falha ao salvar os detalhes do projeto: ${errorMessages}`);
    }

    return newProject;
};

export const updateTask = async (task: ConstructionTask) => {
    // Converte as chaves de camelCase para snake_case antes de atualizar.
    const { id, taskName, startDate, endDate, costMaterials, costLabor, ...rest } = task;
    const taskDataToUpdate = {
        ...rest,
        task_name: taskName,
        start_date: startDate,
        end_date: endDate,
        cost_materials: costMaterials,
        cost_labor: costLabor,
    };
    
    const { error } = await supabase
        .from('tasks')
        .update(taskDataToUpdate)
        .eq('id', id);
    
    if (error) {
        throw handleSupabaseError(error, 'ao atualizar tarefa');
    }
    return true;
};