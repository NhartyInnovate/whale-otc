import { createClient } from '@supabase/supabase-js';

// WARNING: SUPABASE_SERVICE_ROLE_KEY gives admin access.
// Do NOT expose this to the browser or client-side code.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase credentials are not fully configured in environment variables.');
}

// Create a single supabase client for interacting with the database server-side
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseServiceKey || 'placeholder-key', 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
