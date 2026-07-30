import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? "").trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();

if (!supabaseUrl || !supabaseAnonKey) {
  // Isso não trava o app (para não quebrar em dev sem configurar nada),
  // mas os carregamentos/salvamentos vão falhar até as variáveis existirem.
  console.warn(
    "[kahlendario] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configuradas. " +
      "Copie .env.example para .env e preencha com os dados do seu projeto Supabase."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);