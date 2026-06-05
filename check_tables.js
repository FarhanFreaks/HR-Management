import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function check() {
  const { data: d1, error: e1 } = await supabase.from('job_openings').select('*').limit(1);
  console.log('job_openings:', e1 ? e1.message : 'exists, count: ' + (d1?.length || 0));
  
  const { data: d2, error: e2 } = await supabase.from('candidates').select('*').limit(1);
  console.log('candidates:', e2 ? e2.message : 'exists, count: ' + (d2?.length || 0));
}
check();
