// Os 2 únicos usuários permitidos no app. Mudar aqui muda em todo lugar.
const USERS = ["Karina", "Otavio"];

export default function LoginScreen({ onLogin }) {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-neutral-900 text-neutral-100 px-6">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <p className="text-xs font-medium tracking-wide text-violet-400">Kahlendario</p>
          <h1 className="text-2xl font-semibold mt-1" style={{ fontFamily: "'Fraunces', serif" }}>
            Entrar
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Toque no seu nome para entrar na sua agenda.</p>
        </div>

        <div className="flex flex-col gap-2">
          {USERS.map((u) => (
            <button
              key={u}
              onClick={() => onLogin(u)}
              className="w-full rounded-xl bg-neutral-800 hover:bg-neutral-700 px-4 py-3 text-sm text-center font-medium transition-colors active:scale-[0.98]"
            >
              {u}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}