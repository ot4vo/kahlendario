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

// dirty=true marca que esse snapshot local ainda não foi confirmado no
// Supabase (por exemplo, a aba foi recarregada antes do debounce de envio
// disparar). Enquanto estiver dirty, o load deve preferir o cache local em
// vez do que está no Supabase, senão a mudança mais recente "some".
function writeLocalCache(userName, data, dirty) {
  try {
    window.localStorage.setItem(
      cacheKey(userName),
      JSON.stringify({ ...data, dirty })
    );
  } catch (e) {
    /* ignore */
  }
}

/**
 * Carrega { events, categories } do usuário informado.
 * Se existir um cache local ainda não sincronizado (dirty), ele tem
 * prioridade sobre o Supabase — e uma sincronização é tentada em seguida.
 * Se a rede falhar, cai para o último snapshot salvo localmente.
 * Retorna null se o usuário ainda não tem nenhum dado salvo em lugar nenhum.
 */
export async function loadUserData(userName) {
  const cached = readLocalCache(userName);
  if (cached && cached.dirty) {
    // Tenta sincronizar em segundo plano, sem bloquear o carregamento.
    saveUserData(userName, { events: cached.events, categories: cached.categories });
    return cached;
  }

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("events, categories")
      .eq("user_name", userName)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      writeLocalCache(userName, data, false);
      return data;
    }
    return cached;
  } catch (err) {
    console.error("[kahlendario] Falha ao carregar do Supabase, usando cache local:", err);
    return cached;
  }
}

// Grava o cache local IMEDIATAMENTE (sem debounce) a cada mudança, marcado
// como "dirty" até que saveUserData confirme a gravação no Supabase.
export function cacheUserDataLocally(userName, data) {
  writeLocalCache(userName, data, true);
}

/**
 * Salva (upsert) { events, categories } do usuário no Supabase.
 */
export async function saveUserData(userName, { events, categories }) {
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
    writeLocalCache(userName, { events, categories }, false);
    return true;
  } catch (err) {
    console.error("[kahlendario] Falha ao salvar no Supabase (guardado localmente):", err);
    return false;
  }
}