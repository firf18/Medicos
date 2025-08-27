// scripts/test-supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), 'medicos-platform/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing Supabase environment variables.');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are in medicos-platform/.env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Attempting to connect to Supabase...');

  // Consultamos una tabla que debe tener datos (nuestras especialidades)
  const { data, error } = await supabase
    .from('medical_specialties')
    .select('name, code')
    .limit(5);

  if (error) {
    console.error('❌ Supabase connection test failed:');
    console.error(error);
    return;
  }

  if (data && data.length > 0) {
    console.log('✅ Supabase connection successful!');
    console.log('✅ Successfully fetched data from "medical_specialties" table:');
    console.table(data);
  } else {
    console.warn('🤔 Connection successful, but no data found in "medical_specialties".');
    console.warn('Please verify that the seed data was inserted correctly.');
  }
}

testConnection();
