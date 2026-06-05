import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function check() {
  const { data: d1 } = await supabase.from('employees').select('*').limit(3);
  console.log('Employees:', d1?.map(e => ({ id: e.id, emp_id: e.emp_id, salary: e.salary })));
  
  const { data: d2 } = await supabase.from('leave_requests').select('*').limit(3);
  console.log('Leave Requests:', d2);

  const { data: d3 } = await supabase.from('attendance').select('*').limit(3);
  console.log('Attendance:', d3);
}
check();
