// Quick debug script to check categories data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugCategories() {
  console.log('🔍 Checking categories data...');
  
  const { data, error } = await supabase
    .from('categories')
    .select('id, name_en, icon, color')
    .order('name_en');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Categories data:');
  data.forEach(cat => {
    console.log(`- ${cat.name_en}: icon="${cat.icon}", color="${cat.color}"`);
  });
}

debugCategories().catch(console.error);