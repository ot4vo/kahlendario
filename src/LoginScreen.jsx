import { useState } from "react";

// Os 3 únicos usuários permitidos no app. Mudar aqui muda em todo lugar.
const USERS = ["Karina", "Otavio", "Teste"];

export default function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const tryLogin = (value) => {
    const match = USERS.find((u) => u.toLowerCase() === value.trim().toLowerCase());
    if (match) {
      setError("");
      onLogin(match);
    } else {
      setError("Nome não reconhecido. Digite Karina, Otavio ou Teste.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    tryLogin(name);
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-neutral-900 text-neutral-100 px-6">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <p className="text-xs font-medium tracking-wide text-violet-400">Kahlendario</p>
          <h1 className="text-2xl font-semibold mt-1" style={{ fontFamily: "'Fraunces', serif" }}>
            Quem é você?
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Digite seu nome para entrar na sua agenda.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            placeholder="Seu nome"
            className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm outline-none focus:border-violet-500 transition-colors"
          />
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 text-white py-3 text-sm font-medium active:scale-[0.98] transition-transform"
          >
            Entrar
          </button>
        </form>

        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <div className="h-px flex-1 bg-neutral-800" />
          ou toque no seu nome
          <div className="h-px flex-1 bg-neutral-800" />
        </div>

        <div className="flex flex-col gap-2">
          {USERS.map((u) => (
            <button
              key={u}
              onClick={() => tryLogin(u)}
              className="w-full rounded-xl bg-neutral-800 hover:bg-neutral-700 px-4 py-3 text-sm text-left transition-colors"
            >
              {u}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
