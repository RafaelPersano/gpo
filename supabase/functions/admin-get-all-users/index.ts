import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }

serve(async (req) => {
  if (req.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }) }
  try {
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: req.headers.get('Authorization')! } } })
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');
    const { data: profile } = await supabaseClient.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin') { return new Response(JSON.stringify({ error: 'Acesso negado.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}); }
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const { data: profiles, error: profilesError } = await supabaseAdmin.from('profiles').select('id, full_name, role, token_balance');
    if (profilesError) throw profilesError;
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;
    const userMetaMap = new Map(authUsers.map(u => [u.id, { email: u.email, created_at: u.created_at }]));
    const combinedUsers = profiles.map(p => ({ ...p, email: userMetaMap.get(p.id)?.email || 'N/A', created_at: userMetaMap.get(p.id)?.created_at || 'N/A' }));
    return new Response(JSON.stringify({ users: combinedUsers }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
  }
})
