import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// A flag to check if the application is properly configured to connect to Supabase.
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

let supabase: SupabaseClient;

if (isSupabaseConfigured) {
  // If the environment variables are set, create the real Supabase client.
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // If the environment variables are missing, log an informational message to the console
  // and create a mock client. This allows the app to run in a read-only
  // "demo mode" without crashing.
  console.info("INFO: Variáveis de ambiente do Supabase não definidas. O aplicativo está executando em modo de demonstração intencional. O login e o salvamento de projetos estão desativados. Para habilitar a funcionalidade completa, um desenvolvedor deve configurar as variáveis de ambiente.");

  // --- Mock Implementation ---
  const mockSubscription = { unsubscribe: () => {} };
  
  const createMockError = (message: string) => ({
    message,
    name: 'MockError',
    stack: '',
  });

  const mockAuth = {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: mockSubscription } }),
    signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: createMockError("Modo demonstração: Login desativado. Configure o backend para usar esta função.") }),
    signUp: () => Promise.resolve({ data: { user: null, session: null }, error: createMockError("Modo demonstração: Cadastro desativado. Configure o backend para usar esta função.") }),
    signOut: () => Promise.resolve({ error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
  };

  const mockQueryBuilder = {
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ error: createMockError("Modo demonstração: Salvamento desativado.") }),
    update: () => Promise.resolve({ error: createMockError("Modo demonstração: Atualização desativada.") }),
    delete: () => Promise.resolve({ error: createMockError("Modo demonstração: Exclusão desativada.") }),
    eq: () => mockQueryBuilder,
    order: () => mockQueryBuilder,
    single: () => Promise.resolve({ data: null, error: null }),
  };

  supabase = {
    auth: mockAuth,
    from: () => mockQueryBuilder,
    // FIX: Updated mock to accept any arguments to prevent type errors when called.
    rpc: (..._args: any[]) => Promise.resolve({ data: null, error: createMockError("Modo demonstração: Chamadas RPC desativadas.") }),
    functions: {
      // FIX: Updated mock to accept any arguments to prevent type errors when called.
      invoke: (..._args: any[]) => Promise.resolve({ data: null, error: createMockError("Modo demonstração: Funções de servidor desativadas.") })
    }
  } as unknown as SupabaseClient;
}

export { supabase };