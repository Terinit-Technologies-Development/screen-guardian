import { createClient } from 'jsr:@supabase/supabase-js@2';

/**
 * sync-usage Edge Function
 *
 * Receives daily usage snapshots from the device and upserts them
 * into the `usage_snapshots` table.
 *
 * POST /functions/v1/sync-usage
 * Headers:
 *   Authorization: Bearer <user JWT>
 *   Content-Type: application/json
 *
 * Body:
 *   {
 *     snapshots: Array<{
 *       app_id: string;
 *       app_name?: string;
 *       snapshot_date: string;  // ISO date: "2025-05-14"
 *       usage_seconds: number;
 *       launch_count: number;
 *       device_id?: string;
 *     }>
 *   }
 *
 * Response:
 *   { synced: number; errors: string[] }
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Initialise Supabase client using the user's JWT (respects RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const snapshots: Array<{
      app_id: string;
      app_name?: string;
      snapshot_date: string;
      usage_seconds: number;
      launch_count: number;
      device_id?: string;
    }> = body.snapshots ?? [];

    if (!Array.isArray(snapshots) || snapshots.length === 0) {
      return new Response(JSON.stringify({ error: 'No snapshots provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rows = snapshots.map((s) => ({
      user_id: user.id,
      app_id: s.app_id,
      app_name: s.app_name ?? null,
      snapshot_date: s.snapshot_date,
      usage_seconds: s.usage_seconds,
      launch_count: s.launch_count,
      device_id: s.device_id ?? null,
    }));

    // Upsert — conflict on (user_id, snapshot_date, app_id, device_id)
    const { error: upsertError, count } = await supabase
      .from('usage_snapshots')
      .upsert(rows, {
        onConflict: 'user_id,snapshot_date,app_id,device_id',
        count: 'exact',
      });

    if (upsertError) {
      console.error('[sync-usage] Upsert error:', upsertError);
      return new Response(JSON.stringify({ error: upsertError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ synced: count ?? rows.length, errors: [] }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('[sync-usage] Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
