import { createClient } from '@supabase/supabase-js';

async function main() {
  const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);
  
  const { data } = await supabase
    .from('server_readmes')
    .select('*')
    .limit(1);
    
  if (data && data[0]) {
    console.log('项目名称:', data[0].project_name);
    console.log('README长度:', data[0].raw_content?.length || 0);
    console.log('前1000字符:');
    console.log(data[0].raw_content?.substring(0, 1000) || '');
  }
}

main().catch(console.error);