import { createClient } from '@supabase/supabase-js';

// Reemplazar con las credenciales de Supabase usando el archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn("Faltan las credenciales de Supabase en el archivo .env!");
}

const finalUrl = supabaseUrl || 'https://url-del-proyecto.supabase.co';
const finalKey = supabaseKey || 'anon-key';

export const supabase = createClient(finalUrl, finalKey);
