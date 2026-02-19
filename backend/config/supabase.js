import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_KEY');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Database connection status
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('foods')
      .select('count(*)', { count: 'exact' })
      .limit(1);
    
    if (error) throw error;
    console.log('✓ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('✗ Supabase connection failed:', error.message);
    return false;
  }
};

export default supabase;
