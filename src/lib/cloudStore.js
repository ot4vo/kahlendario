import { supabase } from "./supabaseClient.js";

const TABLE = "kahlendario_state";
const LOCAL_CACHE_PREFIX = "kahlendario:cache:";

function cacheKey(userName) {
  return `${LOCAL_CACHE_PREFIX}${userName}`;
}

function readLocalCache(userName) {
  try {
    const raw = window.localStorage.getItem(cacheKey(userName));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* ignore */
  }
  return null;
}

function writeLocalCache(userName, data) {
  try {
    window.localStorage.setItem(cacheKey(userName), JSON.stringify(data));
  } catch (e) {
    /* ignore */
  }
}

/**
 * Carrega { events, categories } do usuário informado direto do Supabase.
 * Se a rede falhar, cai para o último snapshot salvo localmente nesse
 * dispositivo (modo somente-leitura até a conexão voltar).
 * Retorna null se o usuário ainda não tem nenhum dado salvo.
 */
export async function loadUserData(userName) {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("events, categories")
      .eq("user_name", userName)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      writeLocalCache(userName, data);
      return data;
    }
    return null;
  } catch (err) {
    console.error("[kahlendario] Falha ao carregar do Supabase, usando cache local:", err);
    return readLocalCache(userName);
  }
}

/**
 * Salva (upsert) { events, categories } do usuário no Supabase.
 * Sempre grava também um cache local, para não perder a alteração caso
 * a requisição falhe por instabilidade de rede.
 */
export async function saveUserData(userName, { events, categories }) {
  writeLocalCache(userName, { events, categories });
  try {
    const { error } = await supabase.from(TABLE).upsert(
      {
        user_name: userName,
        events,
        categories,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_name" }
    );
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("[kahlendario] Falha ao salvar no Supabase (guardado localmente):", err);
    return false;
  }
}
