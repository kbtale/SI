import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn("Faltan las credenciales de Supabase en el archivo .env! Asegúrate de configurar VITE_SUPABASE_PUBLISHABLE_KEY.");
}

const finalUrl = supabaseUrl || 'https://url-del-proyecto.supabase.co';
const finalKey = supabaseKey || 'publishable-key';

export const supabase = createClient(finalUrl, finalKey);
