const supabaseUrl = 'https://gsxkwupzlmefunkqwowj.supabase.co';
const supabaseKey = 'sb_publishable_R2Lv35f_be8pt5zBb72uUw_S1YOxe0I';

async function check() {
  const tableRes = await fetch(`${supabaseUrl}/rest/v1/employees?limit=1`, {
    headers: { apikey: supabaseKey, 'Accept': 'text/csv' }
  });
  console.log('Status:', tableRes.status);
  console.log('Employees CSV:', await tableRes.text());
}
check();
