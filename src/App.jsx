import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Search, SlidersHorizontal, X, Clock,
  MapPin, Bell, Repeat, Copy, Trash2, Pencil, Check,
  Download, Upload, Menu, ChevronDown, ChevronUp, CalendarDays, ArrowLeft, Palette
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const COLORS = [
  { key: "red",     label: "Vermelho",  hex: "#f43f5e", dot: "bg-rose-500",    ring: "ring-rose-500",    soft: "bg-rose-500/15",    text: "text-rose-400" },
  { key: "blue",    label: "Azul",      hex: "#3b82f6", dot: "bg-blue-500",    ring: "ring-blue-500",    soft: "bg-blue-500/15",    text: "text-blue-400" },
  { key: "green",   label: "Verde",     hex: "#22c55e", dot: "bg-emerald-500", ring: "ring-emerald-500", soft: "bg-emerald-500/15", text: "text-emerald-400" },
  { key: "yellow",  label: "Amarelo",   hex: "#eab308", dot: "bg-yellow-500",  ring: "ring-yellow-500",  soft: "bg-yellow-500/15",  text: "text-yellow-400" },
  { key: "orange",  label: "Laranja",   hex: "#f97316", dot: "bg-orange-500",  ring: "ring-orange-500",  soft: "bg-orange-500/15",  text: "text-orange-400" },
  { key: "purple",  label: "Roxo",      hex: "#a855f7", dot: "bg-purple-500",  ring: "ring-purple-500",  soft: "bg-purple-500/15",  text: "text-purple-400" },
  { key: "pink",    label: "Rosa",      hex: "#ec4899", dot: "bg-pink-500",    ring: "ring-pink-500",    soft: "bg-pink-500/15",    text: "text-pink-400" },
  { key: "cyan",    label: "Ciano",     hex: "#06b6d4", dot: "bg-cyan-500",    ring: "ring-cyan-500",    soft: "bg-cyan-500/15",    text: "text-cyan-400" },
  { key: "gray",    label: "Cinza",     hex: "#9ca3af", dot: "bg-gray-400",    ring: "ring-gray-400",    soft: "bg-gray-400/15",    text: "text-gray-300" },
  { key: "teal",    label: "Verde-azulado", hex: "#14b8a6", dot: "bg-teal-500",    ring: "ring-teal-500",    soft: "bg-teal-500/15",    text: "text-teal-400" },
  { key: "indigo",  label: "Índigo",    hex: "#6366f1", dot: "bg-indigo-500",  ring: "ring-indigo-500",  soft: "bg-indigo-500/15",  text: "text-indigo-400" },
  { key: "lime",    label: "Limão",     hex: "#84cc16", dot: "bg-lime-500",    ring: "ring-lime-500",    soft: "bg-lime-500/15",    text: "text-lime-400" },
  { key: "fuchsia", label: "Fúcsia",    hex: "#d946ef", dot: "bg-fuchsia-500", ring: "ring-fuchsia-500", soft: "bg-fuchsia-500/15", text: "text-fuchsia-400" },
  { key: "amber",   label: "Âmbar",     hex: "#f59e0b", dot: "bg-amber-500",   ring: "ring-amber-500",   soft: "bg-amber-500/15",   text: "text-amber-400" },
  { key: "sky",     label: "Céu",       hex: "#0ea5e9", dot: "bg-sky-500",     ring: "ring-sky-500",     soft: "bg-sky-500/15",     text: "text-sky-400" },
  { key: "white",   label: "Branco",    hex: "#f5f5f5", dot: "bg-[#f5f5f5]",   ring: "ring-[#f5f5f5]",   soft: "bg-[#f5f5f5]/15",   text: "text-[#f5f5f5]" },
  { key: "beige",   label: "Bege",      hex: "#d9c7a3", dot: "bg-[#d9c7a3]",   ring: "ring-[#d9c7a3]",   soft: "bg-[#d9c7a3]/15",   text: "text-[#d9c7a3]" },
];
const colorOf = (key) => COLORS.find((c) => c.key === key) || COLORS[8];

const DEFAULT_CATEGORIES = [
  { id: "trabalho",   name: "Trabalho",   color: "blue" },
  { id: "faculdade",  name: "Faculdade",  color: "purple" },
  { id: "academia",   name: "Academia",   color: "orange" },
  { id: "consulta",   name: "Consulta",   color: "cyan" },
  { id: "financeiro", name: "Financeiro", color: "green" },
  { id: "pessoal",    name: "Pessoal",    color: "pink" },
  { id: "lazer",      name: "Lazer",      color: "yellow" },
];

const REMINDERS = [
  { value: -1,  label: "Sem lembrete" },
  { value: 5,   label: "5 minutos antes" },
  { value: 10,  label: "10 minutos antes" },
  { value: 30,  label: "30 minutos antes" },
  { value: 60,  label: "1 hora antes" },
  { value: 120, label: "2 horas antes" },
  { value: 1440,label: "1 dia antes" },
];

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WEEKDAY_FULL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const MONTH_LABELS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const REPEAT_PRESETS = [
  { key: "none",     label: "Não repetir" },
  { key: "daily",    label: "Todos os dias" },
  { key: "weekdays", label: "Dias úteis (seg–sex)" },
  { key: "weekend",  label: "Finais de semana" },
  { key: "weekly",   label: "Semanal" },
  { key: "biweekly", label: "Quinzenal" },
  { key: "monthly",  label: "Mensal" },
  { key: "yearly",   label: "Anual" },
  { key: "custom",   label: "Dias personalizados" },
];

/* ------------------------------------------------------------------ */
/* Date helpers (local time, no timezone surprises)                   */
/* ------------------------------------------------------------------ */

const pad2 = (n) => String(n).padStart(2, "0");
const keyOf = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const parseKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
const todayKey = () => keyOf(new Date());
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const addMonths = (d, n) => { const r = new Date(d); r.setMonth(r.getMonth() + n); return r; };
const addYears = (d, n) => { const r = new Date(d); r.setFullYear(r.getFullYear() + n); return r; };
const sameDay = (a, b) => keyOf(a) === keyOf(b);
const startOfWeek = (d) => addDays(d, -d.getDay());

function monthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const gridStart = startOfWeek(first);
  const weeks = [];
  let cursor = gridStart;
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let i = 0; i < 7; i++) { week.push(cursor); cursor = addDays(cursor, 1); }
    weeks.push(week);
  }
  return weeks;
}

function timeToMinutes(t) { if (!t) return 0; const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function minutesLabel(mins) {
  const h = Math.floor(mins / 60) % 24, m = mins % 60;
  return `${pad2(h)}:${pad2(m)}`;
}
function formatHM(t) { return t || "--:--"; }

/* ------------------------------------------------------------------ */
/* Repeat occurrence generation                                       */
/* ------------------------------------------------------------------ */

function generateDates(baseDateKey, repeat) {
  const base = parseKey(baseDateKey);
  const out = [];
  const type = repeat?.type || "none";

  if (type === "none") { out.push(baseDateKey); return out; }

  if (type === "daily") {
    for (let i = 0; i < 90; i++) out.push(keyOf(addDays(base, i)));
  } else if (type === "weekdays") {
    let d = base, n = 0;
    while (n < 90) { const wd = d.getDay(); if (wd >= 1 && wd <= 5) { out.push(keyOf(d)); n++; } d = addDays(d, 1); }
  } else if (type === "weekend") {
    let d = base, n = 0;
    while (n < 60) { const wd = d.getDay(); if (wd === 0 || wd === 6) { out.push(keyOf(d)); n++; } d = addDays(d, 1); }
  } else if (type === "weekly") {
    for (let i = 0; i < 26; i++) out.push(keyOf(addDays(base, i * 7)));
  } else if (type === "biweekly") {
    for (let i = 0; i < 26; i++) out.push(keyOf(addDays(base, i * 14)));
  } else if (type === "monthly") {
    for (let i = 0; i < 24; i++) out.push(keyOf(addMonths(base, i)));
  } else if (type === "yearly") {
    for (let i = 0; i < 5; i++) out.push(keyOf(addYears(base, i)));
  } else if (type === "custom") {
    const days = repeat.days || [];
    if (days.length === 0) { out.push(baseDateKey); return out; }
    let d = base, count = 0, guard = 0;
    while (count < 60 && guard < 400) {
      if (days.includes(d.getDay())) { out.push(keyOf(d)); count++; }
      d = addDays(d, 1); guard++;
    }
  }
  return out;
}

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

/* ------------------------------------------------------------------ */
/* Persistence (browser localStorage)                                 */
/* ------------------------------------------------------------------ */

async function loadStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* key missing or storage unavailable */ }
  return fallback;
}
async function saveStorage(key, value) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
}

/* ------------------------------------------------------------------ */
/* Small UI atoms                                                     */
/* ------------------------------------------------------------------ */

/* Tracks the window width so a few components can size themselves up on
   a tablet instead of staying stuck at tiny phone proportions. */
function useViewportWidth() {
  const [width, setWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 390));
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}

function IconBtn({ onClick, children, label, active }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors active:scale-95 ${
        active ? "bg-violet-500/20 text-violet-300" : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700"
      }`}
    >
      {children}
    </button>
  );
}

function Sheet({ open, onClose, children, title, maxHeight = "85vh" }) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full bg-neutral-800 border-t border-neutral-700 rounded-t-3xl overflow-hidden flex flex-col animate-[slideUp_0.25s_ease-out]"
        style={{ maxHeight }}
      >
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-neutral-600" />
        </div>
        {title && (
          <div className="px-5 pb-3 flex items-center justify-between shrink-0">
            <h2 className="text-lg font-semibold text-neutral-100">{title}</h2>
            <IconBtn onClick={onClose} label="Fechar"><X size={18} /></IconBtn>
          </div>
        )}
        <div className="overflow-y-auto px-5 pb-8">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Event Form (create / edit)                                         */
/* ------------------------------------------------------------------ */

function EventForm({ initial, categories, onCancel, onSave }) {
  const [title, setTitle] = useState(initial.title || "");
  const [description, setDescription] = useState(initial.description || "");
  const [location, setLocation] = useState(initial.location || "");
  const [date, setDate] = useState(initial.date || todayKey());
  const [startTime, setStartTime] = useState(initial.startTime || "09:00");
  const [endTime, setEndTime] = useState(initial.endTime || "10:00");
  const [color, setColor] = useState(initial.color || "blue");
  const [categoryId, setCategoryId] = useState(initial.categoryId || "");
  const [reminder, setReminder] = useState(initial.reminder ?? -1);
  const [repeatType, setRepeatType] = useState(initial.repeat?.type || "none");
  const [customDays, setCustomDays] = useState(initial.repeat?.days || []);
  const [repeatOpen, setRepeatOpen] = useState(false);

  const toggleDay = (i) => setCustomDays((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i].sort()));

  const canSave = title.trim().length > 0 && date;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      date,
      startTime,
      endTime,
      color,
      categoryId: categoryId || null,
      reminder,
      repeat: { type: repeatType, days: repeatType === "custom" ? customDays : [] },
    });
  };

  return (
    <div className="flex flex-col gap-5 pt-1">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título do evento"
        className="w-full bg-transparent text-2xl font-semibold text-neutral-100 placeholder-neutral-500 outline-none border-b border-neutral-700 pb-3 focus:border-violet-500 transition-colors"
        style={{ fontFamily: "'Fraunces', serif" }}
      />

      <div className="grid grid-cols-3 gap-2">
        <label className="col-span-3 flex items-center gap-3 bg-neutral-700/60 rounded-2xl px-4 py-3">
          <CalendarDays size={18} className="text-neutral-500 shrink-0" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="bg-transparent text-neutral-100 outline-none w-full [color-scheme:dark]" />
        </label>
        <label className="col-span-3 sm:col-span-1 flex items-center gap-2 bg-neutral-700/60 rounded-2xl px-4 py-3">
          <Clock size={18} className="text-neutral-500 shrink-0" />
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
            className="bg-transparent text-neutral-100 outline-none w-full [color-scheme:dark]" />
        </label>
        <div className="col-span-3 sm:col-span-1 flex items-center justify-center text-neutral-500 text-sm">até</div>
        <label className="col-span-3 sm:col-span-1 flex items-center gap-2 bg-neutral-700/60 rounded-2xl px-4 py-3">
          <Clock size={18} className="text-neutral-500 shrink-0" />
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
            className="bg-transparent text-neutral-100 outline-none w-full [color-scheme:dark]" />
        </label>
      </div>

      <label className="flex items-center gap-3 bg-neutral-700/60 rounded-2xl px-4 py-3">
        <MapPin size={18} className="text-neutral-500 shrink-0" />
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Local (opcional)"
          className="bg-transparent text-neutral-100 placeholder-neutral-500 outline-none w-full" />
      </label>

      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição (opcional)" rows={2}
        className="bg-neutral-700/60 rounded-2xl px-4 py-3 text-neutral-100 placeholder-neutral-500 outline-none resize-none" />

      <div>
        <div className="text-sm text-neutral-500 mb-2">Cor</div>
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map((c) => (
            <button key={c.key} onClick={() => setColor(c.key)} aria-label={c.label}
              className={`w-8 h-8 rounded-full ${c.dot} transition-transform active:scale-90 ${color === c.key ? `ring-2 ring-offset-2 ring-offset-neutral-800 ${c.ring} scale-110` : ""}`} />
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 bg-neutral-700/60 rounded-2xl px-4 py-3">
        <Bell size={18} className="text-neutral-500 shrink-0" />
        <select value={reminder} onChange={(e) => setReminder(Number(e.target.value))}
          className="bg-transparent text-neutral-100 outline-none w-full">
          {REMINDERS.map((r) => <option key={r.value} value={r.value} className="bg-neutral-800">{r.label}</option>)}
        </select>
      </label>

      <div className="bg-neutral-700/60 rounded-2xl overflow-hidden">
        <button onClick={() => setRepeatOpen((o) => !o)} className="w-full flex items-center gap-3 px-4 py-3">
          <Repeat size={18} className="text-neutral-500 shrink-0" />
          <span className="text-neutral-100 flex-1 text-left">{REPEAT_PRESETS.find((p) => p.key === repeatType)?.label}</span>
          <ChevronDown size={16} className={`text-neutral-500 transition-transform ${repeatOpen ? "rotate-180" : ""}`} />
        </button>
        {repeatOpen && (
          <div className="px-4 pb-4 flex flex-col gap-1 border-t border-neutral-600/50 pt-3">
            {REPEAT_PRESETS.map((p) => (
              <button key={p.key} onClick={() => setRepeatType(p.key)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm text-left ${repeatType === p.key ? "bg-violet-500/15 text-violet-300" : "text-neutral-300"}`}>
                {p.label}
                {repeatType === p.key && <Check size={16} />}
              </button>
            ))}
            {repeatType === "custom" && (
              <div className="flex justify-between gap-1 pt-2">
                {WEEKDAY_LABELS.map((lab, i) => (
                  <button key={i} onClick={() => toggleDay(i)}
                    className={`w-9 h-9 rounded-full text-xs font-medium flex items-center justify-center transition-colors ${customDays.includes(i) ? "bg-violet-500 text-white" : "bg-neutral-600/60 text-neutral-400"}`}>
                    {lab[0]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2 sticky bottom-0">
        <button onClick={onCancel} className="flex-1 py-3.5 rounded-2xl bg-neutral-700 text-neutral-300 font-medium active:scale-95 transition-transform">
          Cancelar
        </button>
        <button onClick={handleSave} disabled={!canSave}
          className="flex-1 py-3.5 rounded-2xl bg-violet-600 text-white font-medium active:scale-95 transition-transform disabled:opacity-40 disabled:active:scale-100">
          Salvar
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Event chip / row                                                   */
/* ------------------------------------------------------------------ */

function EventRow({ ev, category, onClick, onMoveUp, onMoveDown }) {
  const c = colorOf(ev.color);
  const canReorder = onMoveUp || onMoveDown;
  return (
    <div className="w-full flex items-stretch gap-3 group">
      <div className="flex flex-col items-center pt-0.5 w-12 shrink-0">
        <span className="text-xs font-medium text-neutral-300">{formatHM(ev.startTime)}</span>
        <span className="text-[10px] text-neutral-500">{formatHM(ev.endTime)}</span>
      </div>
      <div className={`w-1 rounded-full ${c.dot} shrink-0`} />
      <button onClick={onClick} className="flex-1 text-left bg-neutral-700/50 active:bg-neutral-700 rounded-2xl px-4 py-3 mb-2 transition-colors min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-neutral-100 font-medium break-words">{ev.title}</p>
          {ev.repeat?.type && ev.repeat.type !== "none" && <Repeat size={12} className="text-neutral-500 shrink-0" />}
        </div>
        {ev.location && (
          <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5 truncate"><MapPin size={11} />{ev.location}</p>
        )}
        {ev.description && <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{ev.description}</p>}
        {category && (
          <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full ${c.soft} ${c.text}`}>{category.name}</span>
        )}
      </button>
      {canReorder && (
        <div className="flex flex-col justify-center gap-1 shrink-0 mb-2">
          <button aria-label="Mover para cima" onClick={onMoveUp} disabled={!onMoveUp}
            className="w-7 h-7 flex items-center justify-center rounded-full text-neutral-500 hover:text-neutral-200 hover:bg-neutral-700 disabled:opacity-25 disabled:hover:bg-transparent transition-colors">
            <ChevronUp size={16} />
          </button>
          <button aria-label="Mover para baixo" onClick={onMoveDown} disabled={!onMoveDown}
            className="w-7 h-7 flex items-center justify-center rounded-full text-neutral-500 hover:text-neutral-200 hover:bg-neutral-700 disabled:opacity-25 disabled:hover:bg-transparent transition-colors">
            <ChevronDown size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main App                                                            */
/* ------------------------------------------------------------------ */

export default function CalendarApp() {
  const [loaded, setLoaded] = useState(false);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  const [view, setView] = useState("week"); // month | week | day
  const [cursorDate, setCursorDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayKey());

  const [daySheetOpen, setDaySheetOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [detailEvent, setDetailEvent] = useState(null);
  const [seriesPrompt, setSeriesPrompt] = useState(null); // {action:'edit'|'delete', event}

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeColors, setActiveColors] = useState([]);
  const [activeCats, setActiveCats] = useState([]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("blue");
  const [bulkColorOpen, setBulkColorOpen] = useState(false);
  const [bulkGroupKey, setBulkGroupKey] = useState(null);
  const [toast, setToast] = useState("");
  const csvInputRef = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  /* ---- load / save ---- */
  useEffect(() => {
    (async () => {
      const [ev, cats] = await Promise.all([
        loadStorage("calendar:events", []),
        loadStorage("calendar:categories", DEFAULT_CATEGORIES),
      ]);
      setEvents(ev);
      setCategories(cats);
      setLoaded(true);
    })();
  }, []);
  useEffect(() => { if (loaded) saveStorage("calendar:events", events); }, [events, loaded]);
  useEffect(() => { if (loaded) saveStorage("calendar:categories", categories); }, [categories, loaded]);

  const isLight = false; // Kahlendario é sempre no tema escuro

  /* Sorts a day's events by manual order (if the user has reordered them),
     falling back to start time for events that haven't been reordered. */
  const sortDay = (list) =>
    list.sort((a, b) => (a.order ?? timeToMinutes(a.startTime)) - (b.order ?? timeToMinutes(b.startTime)));

  /* ---- derived ---- */
  const eventsByDate = useMemo(() => {
    const map = {};
    for (const ev of events) { (map[ev.date] = map[ev.date] || []).push(ev); }
    for (const k in map) sortDay(map[k]);
    return map;
  }, [events]);

  const categoryById = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);

  /* Groups events by normalized title, so recurring/imported events with the
     same name (e.g. "Trabalho" imported seg-sex) can have their color
     changed all at once. */
  const eventGroups = useMemo(() => {
    const map = {};
    for (const ev of events) {
      const key = ev.title.trim().toLowerCase();
      if (!map[key]) map[key] = { key, title: ev.title.trim(), ids: [], colors: {} };
      map[key].ids.push(ev.id);
      map[key].colors[ev.color] = (map[key].colors[ev.color] || 0) + 1;
    }
    return Object.values(map)
      .map((g) => ({ ...g, dominantColor: Object.entries(g.colors).sort((a, b) => b[1] - a[1])[0][0] }))
      .sort((a, b) => b.ids.length - a.ids.length || a.title.localeCompare(b.title));
  }, [events]);

  const applyBulkColor = (groupKey, colorKey) => {
    const group = eventGroups.find((g) => g.key === groupKey);
    if (!group) return;
    setEvents((prev) => prev.map((e) => (group.ids.includes(e.id) ? { ...e, color: colorKey } : e)));
    showToast(`Cor de "${group.title}" atualizada em ${group.ids.length} evento(s)`);
  };

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (activeColors.length && !activeColors.includes(ev.color)) return false;
      if (activeCats.length && !activeCats.includes(ev.categoryId)) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        if (!ev.title.toLowerCase().includes(q) && !(ev.description || "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [events, activeColors, activeCats, query]);

  const filteredByDate = useMemo(() => {
    const map = {};
    for (const ev of filteredEvents) { (map[ev.date] = map[ev.date] || []).push(ev); }
    for (const k in map) sortDay(map[k]);
    return map;
  }, [filteredEvents]);

  const hasFilters = activeColors.length > 0 || activeCats.length > 0;

  /* ---- actions ---- */
  const openCreateForm = (dateKey) => {
    setEditingId(null);
    setFormInitial({ date: dateKey || selectedDate });
    setFormOpen(true);
    setDaySheetOpen(false);
    setDetailEvent(null);
  };

  const openEditForm = (ev) => {
    setEditingId(ev.id);
    setFormInitial(ev);
    setFormOpen(true);
    setDetailEvent(null);
  };

  const handleSaveForm = (data) => {
    if (editingId) {
      setEvents((prev) => prev.map((e) => (e.id === editingId ? { ...e, ...data } : e)));
      showToast("Evento atualizado");
    } else {
      const seriesId = uid();
      const dates = generateDates(data.date, data.repeat);
      const newOnes = dates.map((d) => ({ ...data, id: uid(), seriesId: dates.length > 1 ? seriesId : null, date: d }));
      setEvents((prev) => [...prev, ...newOnes]);
      showToast(dates.length > 1 ? `${dates.length} ocorrências criadas` : "Evento criado");
    }
    setFormOpen(false);
    setEditingId(null);
  };

  const deleteEvent = (ev, wholeSeries) => {
    setEvents((prev) => prev.filter((e) => (wholeSeries && ev.seriesId ? e.seriesId !== ev.seriesId : e.id !== ev.id)));
    setDetailEvent(null);
    setSeriesPrompt(null);
    showToast(wholeSeries ? "Série excluída" : "Evento excluído");
  };

  /* Moves an event up/down within its day's list, independent of its start
     time. Reassigns a manual "order" to every event of that day so the new
     sequence sticks even though the times themselves never change. */
  const moveEventInDay = (dateKey, id, direction) => {
    const list = (eventsByDate[dateKey] || []).slice();
    const idx = list.findIndex((e) => e.id === id);
    const swapWith = idx + direction;
    if (idx === -1 || swapWith < 0 || swapWith >= list.length) return;
    [list[idx], list[swapWith]] = [list[swapWith], list[idx]];
    const orderById = Object.fromEntries(list.map((e, i) => [e.id, i]));
    setEvents((prev) => prev.map((e) => (e.id in orderById ? { ...e, order: orderById[e.id] } : e)));
  };

  const duplicateEvent = (ev) => {
    setEvents((prev) => [...prev, { ...ev, id: uid(), seriesId: null, title: ev.title + " (cópia)" }]);
    setDetailEvent(null);
    showToast("Evento duplicado");
  };

  const changeColor = (ev, colorKey) => {
    setEvents((prev) => prev.map((e) => (e.id === ev.id ? { ...e, color: colorKey } : e)));
    setDetailEvent((d) => (d && d.id === ev.id ? { ...d, color: colorKey } : d));
  };

  const requestDelete = (ev) => { if (ev.seriesId) setSeriesPrompt({ action: "delete", event: ev }); else deleteEvent(ev, false); };
  const requestEdit = (ev) => { if (ev.seriesId) setSeriesPrompt({ action: "edit", event: ev }); else openEditForm(ev); };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ events, categories }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `calendario-backup-${todayKey()}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Backup exportado");
  };

  /* Parses CSV text into an array of row-arrays, respecting quoted fields
     (handles commas and escaped quotes inside "..."). */
  const parseCSVRows = (text) => {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else inQuotes = false;
        } else field += ch;
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field); field = "";
      } else if (ch === "\n") {
        row.push(field); field = "";
        rows.push(row); row = [];
      } else if (ch === "\r") {
        /* skip, \n handles the row break */
      } else {
        field += ch;
      }
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows;
  };

  /* Imports a CSV backup exported by nCalendar-style apps
     (Title,Color,AllDay,StartTime,EndTime,RRule,XDate,Alert,Place,UrlEvent,Note). */
  const importCSV = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rows = parseCSVRows(String(reader.result));
        const headerIdx = rows.findIndex((r) => r[0]?.trim().toLowerCase() === "title");
        if (headerIdx === -1) { showToast("CSV não reconhecido"); return; }

        const newEvents = [];
        for (const r of rows.slice(headerIdx + 1)) {
          const [title, colorCode, allDay, startMs, endMs, , , , place, , note] = r;
          if (!title || !startMs) continue;
          const start = new Date(Number(startMs));
          const end = endMs ? new Date(Number(endMs)) : start;
          const isAllDay = String(allDay).trim().toLowerCase() === "true";
          const c = COLORS[Math.abs(Number(colorCode) || 0) % COLORS.length];
          newEvents.push({
            id: uid(),
            title: title.trim(),
            description: (note || "").trim(),
            location: (place || "").trim(),
            date: keyOf(start),
            startTime: isAllDay ? "" : `${pad2(start.getHours())}:${pad2(start.getMinutes())}`,
            endTime: isAllDay ? "" : `${pad2(end.getHours())}:${pad2(end.getMinutes())}`,
            color: c.key,
            categoryId: null,
            reminder: -1,
            repeat: { type: "none", days: [] },
            seriesId: null,
          });
        }
        if (newEvents.length === 0) { showToast("Nenhum evento encontrado no CSV"); return; }
        setEvents((prev) => [...prev, ...newEvents]);
        showToast(`${newEvents.length} evento(s) importado(s)`);
      } catch (e) { showToast("Não foi possível ler o CSV"); }
    };
    reader.readAsText(file);
  };

  const addCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    setCategories((prev) => [...prev, { id: uid(), name, color: newCatColor }]);
    setNewCatName("");
    setNewCatColor("blue");
    showToast("Categoria adicionada");
  };

  const removeCategory = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setEvents((prev) => prev.map((e) => (e.categoryId === id ? { ...e, categoryId: null } : e)));
    setActiveCats((prev) => prev.filter((c) => c !== id));
    showToast("Categoria removida");
  };

  /* ---- navigation ---- */
  const goToday = () => { const t = new Date(); setCursorDate(t); setSelectedDate(todayKey()); };
  const stepMonth = (n) => setCursorDate((d) => addMonths(d, n));
  const stepWeek = (n) => setCursorDate((d) => addDays(d, n * 7));
  const stepDay = (n) => { const nd = addDays(parseKey(selectedDate), n); setSelectedDate(keyOf(nd)); setCursorDate(nd); };

  const headerLabel = useMemo(() => {
    if (view === "day") { const d = parseKey(selectedDate); return `${d.getDate()} de ${MONTH_LABELS[d.getMonth()]}`; }
    if (view === "week") { const s = startOfWeek(cursorDate), e = addDays(s, 6);
      return s.getMonth() === e.getMonth() ? `${MONTH_LABELS[s.getMonth()]} ${s.getFullYear()}` : `${MONTH_LABELS[s.getMonth()].slice(0,3)}–${MONTH_LABELS[e.getMonth()].slice(0,3)} ${e.getFullYear()}`;
    }
    return `${MONTH_LABELS[cursorDate.getMonth()]} ${cursorDate.getFullYear()}`;
  }, [view, cursorDate, selectedDate]);

  /* swipe */
  const touchRef = useRef(null);
  const onTouchStart = (e) => { touchRef.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchRef.current == null) return;
    const dx = e.changedTouches[0].clientX - touchRef.current;
    if (Math.abs(dx) > 60) {
      const dir = dx > 0 ? -1 : 1;
      if (view === "month") stepMonth(dir);
      else if (view === "week") stepWeek(dir);
      else stepDay(dir);
    }
    touchRef.current = null;
  };


  if (!loaded) {
    return (
      <div className="min-h-[100dvh] bg-neutral-900 flex items-center justify-center">
        <div className="text-neutral-500 text-sm animate-pulse">Carregando agenda…</div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */

  return (
    <div className={`h-[100dvh] w-full flex justify-center overflow-hidden ${isLight ? "bg-neutral-100" : "bg-neutral-900"}`}>
      <div className={`w-full max-w-md md:max-w-2xl lg:max-w-3xl h-[100dvh] flex flex-col relative overflow-hidden ${isLight ? "bg-white text-neutral-800" : "bg-neutral-900 text-neutral-100"}`}>

        {/* Header */}
        <div className={`sticky top-0 z-30 backdrop-blur-md ${isLight ? "bg-white/90 border-neutral-200" : "bg-neutral-900/90 border-neutral-800"} border-b px-4 pt-4 pb-3`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className={`text-xs font-medium tracking-wide ${isLight ? "text-neutral-500" : "text-violet-400"}`}>Kahlendario</p>
              <h1 className="text-2xl font-semibold -mt-0.5" style={{ fontFamily: "'Fraunces', serif" }}>{headerLabel}</h1>
            </div>
            <div className="flex items-center gap-1">
              <IconBtn onClick={() => setSearchOpen(true)} label="Pesquisar"><Search size={19} className={isLight ? "text-neutral-500" : ""} /></IconBtn>
              <IconBtn onClick={() => setFilterOpen(true)} label="Filtros" active={hasFilters}><SlidersHorizontal size={19} className={isLight && !hasFilters ? "text-neutral-500" : ""} /></IconBtn>
              <IconBtn onClick={() => setMenuOpen(true)} label="Menu"><Menu size={19} className={isLight ? "text-neutral-500" : ""} /></IconBtn>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-1 rounded-full p-1 ${isLight ? "bg-neutral-100" : "bg-neutral-800"}`}>
              {[["month","Mês"],["week","Semana"],["day","Dia"]].map(([v,l]) => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${view === v ? "bg-violet-600 text-white" : isLight ? "text-neutral-500" : "text-neutral-400"}`}>
                  {l}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-0.5">
              <IconBtn onClick={() => (view === "month" ? stepMonth(-1) : view === "week" ? stepWeek(-1) : stepDay(-1))} label="Anterior"><ChevronLeft size={18} className={isLight ? "text-neutral-500" : ""} /></IconBtn>
              <button onClick={goToday} className={`text-xs font-medium px-2 py-1 rounded-full ${isLight ? "text-violet-600" : "text-violet-400"}`}>Hoje</button>
              <IconBtn onClick={() => (view === "month" ? stepMonth(1) : view === "week" ? stepWeek(1) : stepDay(1))} label="Próximo"><ChevronRight size={18} className={isLight ? "text-neutral-500" : ""} /></IconBtn>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto pb-28" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {view === "month" && (
            <MonthView
              cursorDate={cursorDate}
              eventsByDate={hasFilters || query ? filteredByDate : eventsByDate}
              selectedDate={selectedDate}
              isLight={isLight}
              onSelectDay={(k) => { setSelectedDate(k); setDaySheetOpen(true); }}
            />
          )}
          {view === "week" && (
            <WeekView
              cursorDate={cursorDate}
              eventsByDate={hasFilters || query ? filteredByDate : eventsByDate}
              selectedDate={selectedDate}
              isLight={isLight}
              onSelectDay={(k) => { setSelectedDate(k); setCursorDate(parseKey(k)); setView("day"); }}
              onEventClick={setDetailEvent}
            />
          )}
          {view === "day" && (
            <DayView
              dateKey={selectedDate}
              events={(hasFilters || query ? filteredByDate : eventsByDate)[selectedDate] || []}
              isLight={isLight}
              categoryById={categoryById}
              onEventClick={setDetailEvent}
              onSlotClick={(time) => { setFormInitial({ date: selectedDate, startTime: time, endTime: minutesLabel(timeToMinutes(time) + 60) }); setEditingId(null); setFormOpen(true); }}
            />
          )}
        </div>

        {/* FAB */}
        <button
          onClick={() => openCreateForm(selectedDate)}
          className="absolute bottom-7 right-6 z-30 w-14 h-14 rounded-full bg-violet-600 text-white shadow-lg shadow-violet-950/50 flex items-center justify-center active:scale-90 transition-transform"
        >
          <Plus size={26} />
        </button>

        {/* Toast */}
        {toast && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 bg-neutral-700 text-neutral-100 text-sm px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
            {toast}
          </div>
        )}

        {/* Day sheet (month view tap) */}
        <Sheet open={daySheetOpen} onClose={() => setDaySheetOpen(false)}
          title={parseKey(selectedDate).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}>
          <div className="flex flex-col">
            {((hasFilters || query ? filteredByDate : eventsByDate)[selectedDate] || []).length === 0 && (
              <div className="py-6 text-center text-neutral-500 text-sm">Nenhum compromisso neste dia.</div>
            )}
            {((hasFilters || query ? filteredByDate : eventsByDate)[selectedDate] || []).map((ev, i, list) => (
              <EventRow key={ev.id} ev={ev} category={categoryById[ev.categoryId]} onClick={() => setDetailEvent(ev)}
                onMoveUp={!hasFilters && !query && i > 0 ? () => moveEventInDay(selectedDate, ev.id, -1) : null}
                onMoveDown={!hasFilters && !query && i < list.length - 1 ? () => moveEventInDay(selectedDate, ev.id, 1) : null} />
            ))}
            <button onClick={() => openCreateForm(selectedDate)}
              className="mt-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-neutral-600 text-neutral-400 text-sm">
              <Plus size={16} /> Adicionar compromisso
            </button>
          </div>
        </Sheet>

        {/* Create/Edit form */}
        <Sheet open={formOpen} onClose={() => setFormOpen(false)} title={editingId ? "Editar evento" : "Novo evento"} maxHeight="92vh">
          {formOpen && (
            <EventForm
              key={editingId || "new"}
              initial={formInitial || {}}
              categories={categories}
              onCancel={() => setFormOpen(false)}
              onSave={handleSaveForm}
            />
          )}
        </Sheet>

        {/* Event detail */}
        <Sheet open={!!detailEvent} onClose={() => setDetailEvent(null)}>
          {detailEvent && (
            <div className="flex flex-col gap-5 pt-1">
              <div className="flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${colorOf(detailEvent.color).dot}`} />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>{detailEvent.title}</h2>
                  <p className="text-sm text-neutral-400 mt-0.5">
                    {parseKey(detailEvent.date).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })} · {formatHM(detailEvent.startTime)}–{formatHM(detailEvent.endTime)}
                  </p>
                </div>
              </div>

              {detailEvent.location && <p className="text-sm text-neutral-300 flex items-center gap-2"><MapPin size={14} className="text-neutral-500" />{detailEvent.location}</p>}
              {detailEvent.description && <p className="text-sm text-neutral-400 leading-relaxed">{detailEvent.description}</p>}
              {categoryById[detailEvent.categoryId] && (
                <span className={`self-start text-xs px-2.5 py-1 rounded-full ${colorOf(detailEvent.color).soft} ${colorOf(detailEvent.color).text}`}>
                  {categoryById[detailEvent.categoryId].name}
                </span>
              )}
              {detailEvent.reminder != null && detailEvent.reminder >= 0 && (
                <p className="text-xs text-neutral-500 flex items-center gap-2"><Bell size={13} />{REMINDERS.find(r => r.value === detailEvent.reminder)?.label}</p>
              )}
              {detailEvent.seriesId && (
                <p className="text-xs text-neutral-500 flex items-center gap-2"><Repeat size={13} />Parte de uma série recorrente</p>
              )}

              <div>
                <div className="text-xs text-neutral-500 mb-2">Alterar cor</div>
                <div className="flex flex-wrap gap-2.5">
                  {COLORS.map((c) => (
                    <button key={c.key} onClick={() => changeColor(detailEvent, c.key)}
                      className={`w-7 h-7 rounded-full ${c.dot} ${detailEvent.color === c.key ? `ring-2 ring-offset-2 ring-offset-neutral-800 ${c.ring}` : ""}`} />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button onClick={() => requestEdit(detailEvent)} className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-neutral-700 text-neutral-200 text-sm font-medium active:scale-95 transition-transform">
                  <Pencil size={15} /> Editar
                </button>
                <button onClick={() => duplicateEvent(detailEvent)} className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-neutral-700 text-neutral-200 text-sm font-medium active:scale-95 transition-transform">
                  <Copy size={15} /> Duplicar
                </button>
                <button onClick={() => requestDelete(detailEvent)} className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500/10 text-red-400 text-sm font-medium active:scale-95 transition-transform">
                  <Trash2 size={15} /> Excluir
                </button>
              </div>
            </div>
          )}
        </Sheet>

        {/* Series prompt */}
        <Sheet open={!!seriesPrompt} onClose={() => setSeriesPrompt(null)} title={seriesPrompt?.action === "delete" ? "Excluir evento recorrente" : "Editar evento recorrente"}>
          {seriesPrompt && (
            <div className="flex flex-col gap-3 pt-1">
              <p className="text-sm text-neutral-400">Este compromisso faz parte de uma série. O que deseja fazer?</p>
              <button
                onClick={() => seriesPrompt.action === "delete" ? deleteEvent(seriesPrompt.event, false) : (openEditForm(seriesPrompt.event), setSeriesPrompt(null))}
                className="py-3 rounded-2xl bg-neutral-700 text-neutral-100 text-sm font-medium">
                Apenas esta ocorrência
              </button>
              <button
                onClick={() => seriesPrompt.action === "delete" ? deleteEvent(seriesPrompt.event, true) : (openEditForm(seriesPrompt.event), setSeriesPrompt(null))}
                className="py-3 rounded-2xl bg-red-500/10 text-red-400 text-sm font-medium">
                Toda a série
              </button>
              <button onClick={() => setSeriesPrompt(null)} className="py-3 rounded-2xl text-neutral-500 text-sm">Cancelar</button>
            </div>
          )}
        </Sheet>

        {/* Search overlay */}
        {searchOpen && (
          <div className={`absolute inset-0 z-50 flex justify-center ${isLight ? "bg-white" : "bg-neutral-900"}`}>
            <div className="w-full flex flex-col h-full">
              <div className="flex items-center gap-2 p-4 border-b border-neutral-700">
                <IconBtn onClick={() => { setSearchOpen(false); setQuery(""); }} label="Voltar"><ArrowLeft size={19} /></IconBtn>
                <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar eventos…"
                  className={`flex-1 bg-transparent outline-none text-lg ${isLight ? "text-neutral-800 placeholder-neutral-400" : "text-neutral-100 placeholder-neutral-500"}`} />
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {query.trim() === "" && <p className="text-sm text-neutral-500 text-center mt-8">Digite para pesquisar por título ou descrição.</p>}
                {query.trim() !== "" && filteredEvents.length === 0 && <p className="text-sm text-neutral-500 text-center mt-8">Nenhum evento encontrado.</p>}
                {query.trim() !== "" && filteredEvents
                  .slice().sort((a,b) => a.date.localeCompare(b.date))
                  .map((ev) => (
                    <button key={ev.id} onClick={() => { setSelectedDate(ev.date); setCursorDate(parseKey(ev.date)); setSearchOpen(false); setQuery(""); setDetailEvent(ev); }}
                      className="w-full flex items-center gap-3 py-3 border-b border-neutral-800 text-left">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${colorOf(ev.color).dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${isLight ? "text-neutral-800" : "text-neutral-100"}`}>{ev.title}</p>
                        <p className="text-xs text-neutral-500">{parseKey(ev.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })} · {formatHM(ev.startTime)}</p>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <Sheet open={filterOpen} onClose={() => setFilterOpen(false)} title="Filtros">
          <div className="flex flex-col gap-5 pt-1">
            <div>
              <div className="text-sm text-neutral-500 mb-2">Cor</div>
              <div className="flex flex-wrap gap-2.5">
                {COLORS.map((c) => (
                  <button key={c.key} onClick={() => setActiveColors((a) => a.includes(c.key) ? a.filter(x => x !== c.key) : [...a, c.key])}
                    className={`w-8 h-8 rounded-full ${c.dot} ${activeColors.includes(c.key) ? `ring-2 ring-offset-2 ring-offset-neutral-800 ${c.ring}` : "opacity-50"}`} />
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-neutral-500 mb-2">Categoria</div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const cc = colorOf(cat.color);
                  const on = activeCats.includes(cat.id);
                  return (
                    <button key={cat.id} onClick={() => setActiveCats((a) => on ? a.filter(x => x !== cat.id) : [...a, cat.id])}
                      className={`px-3 py-1.5 rounded-full text-sm border flex items-center gap-1.5 ${on ? `border-transparent ${cc.soft} ${cc.text}` : "border-neutral-600 text-neutral-400"}`}>
                      <span className={`w-2 h-2 rounded-full ${cc.dot}`} />{cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <button onClick={() => { setActiveColors([]); setActiveCats([]); }} className="text-sm text-violet-400 self-start">Limpar filtros</button>
          </div>
        </Sheet>

        {/* Menu */}
        <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
          <div className="flex flex-col gap-1 pt-1">
            <button onClick={() => { setCategoriesOpen(true); setMenuOpen(false); }} className="flex items-center gap-3 px-2 py-3 text-sm">
              <Palette size={17} /> Categorias
            </button>
            <button onClick={() => { setBulkGroupKey(null); setBulkColorOpen(true); setMenuOpen(false); }} className="flex items-center gap-3 px-2 py-3 text-sm">
              <Palette size={17} /> Mudar cor em massa
            </button>
            <button onClick={exportJSON} className="flex items-center gap-3 px-2 py-3 text-sm">
              <Download size={17} /> Exportar backup (JSON)
            </button>
            <button onClick={() => csvInputRef.current?.click()} className="flex items-center gap-3 px-2 py-3 text-sm">
              <Upload size={17} /> Importar eventos (CSV)
            </button>
            <input ref={csvInputRef} type="file" accept=".csv,text/csv" className="hidden"
              onChange={(e) => { if (e.target.files[0]) importCSV(e.target.files[0]); e.target.value = ""; setMenuOpen(false); }} />
            <p className="text-xs text-neutral-500 px-2 pt-3">Seus dados ficam salvos automaticamente neste dispositivo.</p>
          </div>
        </Sheet>

        {/* Categories management */}
        <Sheet open={categoriesOpen} onClose={() => setCategoriesOpen(false)} title="Categorias">
          <div className="flex flex-col gap-5 pt-1">
            <div className="flex flex-col gap-2">
              {categories.length === 0 && (
                <p className="text-sm text-neutral-500">Nenhuma categoria ainda.</p>
              )}
              {categories.map((cat) => {
                const cc = colorOf(cat.color);
                return (
                  <div key={cat.id} className="flex items-center gap-3 bg-neutral-700/50 rounded-2xl px-4 py-3">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cc.dot}`} />
                    <span className="flex-1 text-sm text-neutral-100 truncate">{cat.name}</span>
                    <button onClick={() => removeCategory(cat.id)} aria-label={`Remover ${cat.name}`}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-500 hover:text-rose-400 hover:bg-neutral-700 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 border-t border-neutral-700 pt-4">
              <div className="text-sm text-neutral-500">Nova categoria</div>
              <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Nome da categoria"
                className="w-full bg-neutral-700/60 rounded-2xl px-4 py-3 text-neutral-100 placeholder-neutral-500 outline-none" />
              <div className="flex flex-wrap gap-2.5">
                {COLORS.map((c) => (
                  <button key={c.key} onClick={() => setNewCatColor(c.key)} aria-label={c.label}
                    className={`w-8 h-8 rounded-full ${c.dot} transition-transform active:scale-90 ${newCatColor === c.key ? `ring-2 ring-offset-2 ring-offset-neutral-800 ${c.ring} scale-110` : ""}`} />
                ))}
              </div>
              <button onClick={addCategory} disabled={!newCatName.trim()}
                className="py-3.5 rounded-2xl bg-violet-600 text-white font-medium active:scale-95 transition-transform disabled:opacity-40 disabled:active:scale-100">
                Adicionar categoria
              </button>
            </div>
          </div>
        </Sheet>

        {/* Bulk color change */}
        <Sheet open={bulkColorOpen} onClose={() => { setBulkColorOpen(false); setBulkGroupKey(null); }}
          title={bulkGroupKey ? eventGroups.find((g) => g.key === bulkGroupKey)?.title : "Mudar cor em massa"}>
          {!bulkGroupKey ? (
            <div className="flex flex-col gap-2 pt-1">
              {eventGroups.length === 0 && (
                <p className="text-sm text-neutral-500">Nenhum evento ainda.</p>
              )}
              <p className="text-xs text-neutral-500 pb-1">
                Escolha um grupo (eventos com o mesmo título) pra trocar a cor de todos de uma vez.
              </p>
              {eventGroups.map((g) => {
                const cc = colorOf(g.dominantColor);
                return (
                  <button key={g.key} onClick={() => setBulkGroupKey(g.key)}
                    className="w-full flex items-center gap-3 bg-neutral-700/50 hover:bg-neutral-700 rounded-2xl px-4 py-3 transition-colors text-left">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cc.dot}`} />
                    <span className="flex-1 text-sm text-neutral-100 truncate">{g.title}</span>
                    <span className="text-xs text-neutral-500 shrink-0">{g.ids.length} evento{g.ids.length > 1 ? "s" : ""}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-5 pt-1">
              <button onClick={() => setBulkGroupKey(null)} className="flex items-center gap-2 text-sm text-neutral-400 self-start">
                <ArrowLeft size={16} /> Voltar
              </button>
              <p className="text-sm text-neutral-500">
                Escolha a nova cor pra todos os {eventGroups.find((g) => g.key === bulkGroupKey)?.ids.length} eventos deste grupo.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {COLORS.map((c) => (
                  <button key={c.key} onClick={() => { applyBulkColor(bulkGroupKey, c.key); setBulkGroupKey(null); }}
                    aria-label={c.label}
                    className={`w-9 h-9 rounded-full ${c.dot} transition-transform active:scale-90`} />
                ))}
              </div>
            </div>
          )}
        </Sheet>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Month view                                                          */
/* ------------------------------------------------------------------ */

function MonthView({ cursorDate, eventsByDate, selectedDate, isLight, onSelectDay }) {
  const width = useViewportWidth();
  const isTablet = width >= 700;
  const weeks = monthMatrix(cursorDate.getFullYear(), cursorDate.getMonth());
  const month = cursorDate.getMonth();
  const tKey = todayKey();
  const VISIBLE = isTablet ? 5 : 3;

  return (
    <div className="px-2 pt-3">
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className={`text-center text-[11px] font-medium py-1 ${isLight ? "text-neutral-400" : "text-neutral-500"}`}>{d}</div>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((d) => {
              const k = keyOf(d);
              const inMonth = d.getMonth() === month;
              const dayEvents = eventsByDate[k] || [];
              const isToday = k === tKey;
              const isSelected = k === selectedDate;
              return (
                <button key={k} onClick={() => onSelectDay(k)}
                  className={`relative ${isTablet ? "min-h-[110px]" : "min-h-[74px]"} rounded-xl flex flex-col items-stretch p-1 pt-1 transition-colors overflow-hidden border ${
                    isSelected
                      ? "bg-violet-600 border-violet-600"
                      : isLight
                        ? "border-neutral-200 hover:bg-neutral-100"
                        : "border-neutral-800/80 hover:bg-neutral-800 hover:border-neutral-700"
                  }`}>
                  <span className={`text-[12px] leading-none w-5 h-5 flex items-center justify-center rounded-full shrink-0 self-start ${
                    isSelected ? "text-white font-semibold" :
                    isToday ? "bg-violet-500/20 text-violet-300 font-semibold" :
                    inMonth ? (isLight ? "text-neutral-700" : "text-neutral-200") : (isLight ? "text-neutral-300" : "text-neutral-600")
                  }`}>{d.getDate()}</span>

                  <div className="flex flex-col gap-0.5 mt-1 w-full">
                    {dayEvents.slice(0, VISIBLE).map((ev) => {
                      const c = colorOf(ev.color);
                      return (
                        <span key={ev.id}
                          title={ev.title}
                          className={`${isTablet ? "text-[11px]" : "text-[9px]"} leading-tight font-medium px-1 py-[1px] rounded truncate w-full text-left ${
                            isSelected ? "bg-white/25 text-white" : `${c.soft} ${c.text}`
                          }`}>
                          {ev.title}
                        </span>
                      );
                    })}
                    {dayEvents.length > VISIBLE && (
                      <span className={`text-[9px] leading-tight px-1 ${isSelected ? "text-white/80" : isLight ? "text-neutral-400" : "text-neutral-500"}`}>
                        +{dayEvents.length - VISIBLE} mais
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Week view                                                            */
/* ------------------------------------------------------------------ */

/* Lays out one day's events into columns so overlapping events sit
   side-by-side (like Google Calendar) instead of stacking on top of
   each other. Returns each event with its start/end in minutes, its
   column index, and how many columns its overlap-cluster needs. */
function layoutDayEvents(dayEvents) {
  const sorted = [...dayEvents].sort((a, b) => {
    const as = timeToMinutes(a.startTime), bs = timeToMinutes(b.startTime);
    if (as !== bs) return as - bs;
    return timeToMinutes(b.endTime) - timeToMinutes(a.endTime);
  });

  const result = [];
  let cluster = [];
  let clusterEnd = -Infinity;

  const flush = () => {
    if (!cluster.length) return;
    const colEnds = [];
    const placed = [];
    for (const item of cluster) {
      let col = colEnds.findIndex((endTime) => item.s >= endTime);
      if (col === -1) { col = colEnds.length; colEnds.push(item.e); }
      else colEnds[col] = item.e;
      placed.push({ ...item, col });
    }
    const totalCols = colEnds.length;
    for (const p of placed) result.push({ ...p, totalCols });
    cluster = [];
  };

  for (const ev of sorted) {
    const s = timeToMinutes(ev.startTime);
    const e = Math.max(timeToMinutes(ev.endTime), s + 15);
    if (cluster.length === 0) { cluster.push({ ev, s, e }); clusterEnd = e; continue; }
    if (s < clusterEnd) { cluster.push({ ev, s, e }); clusterEnd = Math.max(clusterEnd, e); }
    else { flush(); cluster = [{ ev, s, e }]; clusterEnd = e; }
  }
  flush();
  return result;
}

function WeekView({ cursorDate, eventsByDate, selectedDate, onSelectDay, onEventClick }) {
  const width = useViewportWidth();
  const isTablet = width >= 700; // roughly a Tab S10 FE or bigger, in either orientation
  const TIME_COL_W = isTablet ? 46 : 32;
  const start = startOfWeek(cursorDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const tKey = todayKey();

  const dayLayouts = days.map((d) => {
    const k = keyOf(d);
    return { k, d, layout: layoutDayEvents(eventsByDate[k] || []) };
  });

  /* Adaptive hour range: shows the whole day only if it has events outside
     the usual 6h–22h window, so the grid stays compact by default instead
     of always rendering 24 empty hours. */
  let minH = 6, maxH = 22;
  for (const { layout } of dayLayouts) {
    for (const { s, e } of layout) {
      minH = Math.min(minH, Math.floor(s / 60));
      maxH = Math.max(maxH, Math.ceil(e / 60));
    }
  }
  minH = Math.max(0, minH);
  maxH = Math.min(24, maxH);
  const hourCount = maxH - minH;
  const HOUR_H = isTablet
    ? (hourCount <= 16 ? 56 : hourCount <= 20 ? 46 : 38)
    : (hourCount <= 16 ? 34 : hourCount <= 20 ? 28 : 22);
  const hours = Array.from({ length: hourCount }, (_, i) => minH + i);
  const gridCols = `${TIME_COL_W}px repeat(7, minmax(0,1fr))`;
  const titleSize = isTablet ? "text-xs" : "text-[8px]";
  const timeSize = isTablet ? "text-[10px]" : "text-[7px]";
  const hourLabelSize = isTablet ? "text-[11px]" : "text-[8px]";

  return (
    <div className="px-3 pt-2">
      <div className="relative">
        {/* Sticky header: weekday + date per column */}
        <div className="sticky top-0 z-20 grid bg-neutral-900/95 backdrop-blur border-b border-neutral-800"
          style={{ gridTemplateColumns: gridCols }}>
          <div />
          {dayLayouts.map(({ k, d }) => {
            const isToday = k === tKey;
            return (
              <button key={k} onClick={() => onSelectDay(k)}
                className="flex flex-col items-center justify-center gap-1 py-1.5 border-l border-neutral-800/60 min-w-0">
                <span className={`${isTablet ? "text-xs" : "text-[9px]"} uppercase tracking-wide text-neutral-500`}>{WEEKDAY_LABELS[d.getDay()]}</span>
                <span
                  className={`${isTablet ? "text-base w-8 h-8" : "text-xs w-6 h-6"} font-semibold flex items-center justify-center rounded-full ${
                    isToday ? "bg-violet-600 text-white" : "text-neutral-200"
                  }`}
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {d.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grid body */}
        <div className="relative" style={{ height: hourCount * HOUR_H }}>
          {/* full-width hour separator lines, independent of column widths */}
          {hours.map((h) => (
            <div key={h} className="absolute left-0 right-0 border-t border-neutral-800/70"
              style={{ top: (h - minH) * HOUR_H }} />
          ))}

          <div className="grid h-full" style={{ gridTemplateColumns: gridCols }}>
            <div className="relative">
              {hours.map((h) => (
                <span key={h} className={`absolute right-1 ${hourLabelSize} text-neutral-500 -translate-y-1/2`}
                  style={{ top: (h - minH) * HOUR_H }}>
                  {pad2(h)}h
                </span>
              ))}
            </div>

            {dayLayouts.map(({ k, layout }) => (
              <div key={k} className="relative border-l border-neutral-800/40 min-w-0">
                {layout.map(({ ev, s, e, col, totalCols }) => {
                  const c = colorOf(ev.color);
                  const top = ((s / 60) - minH) * HOUR_H;
                  const height = Math.max((((e - s) / 60)) * HOUR_H - 2, isTablet ? 24 : 18);
                  const widthPct = 100 / totalCols;
                  return (
                    <button key={ev.id} onClick={() => onEventClick(ev)}
                      className={`absolute rounded-md text-left overflow-hidden border-l-2 ${isTablet ? "px-2 py-1" : "px-1 py-0.5"} ${c.soft}`}
                      style={{
                        top, height,
                        left: `${col * widthPct}%`,
                        width: `calc(${widthPct}% - ${isTablet ? 4 : 2}px)`,
                        borderLeftColor: c.hex,
                      }}>
                      <p className={`${titleSize} font-medium leading-tight truncate`} style={{ color: c.hex }}>{ev.title}</p>
                      {height > (isTablet ? 34 : 26) && (
                        <p className={`${timeSize} text-neutral-500 leading-tight truncate`}>{formatHM(ev.startTime)}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Day view (timeline)                                                  */
/* ------------------------------------------------------------------ */

function DayView({ dateKey, events, isLight, categoryById, onEventClick, onSlotClick }) {
  const HOUR_H = 60;
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="px-3 pt-4">
      <div className="relative" style={{ height: HOUR_H * 24 }}>
        {hours.map((h) => (
          <div key={h} className="absolute left-0 right-0 flex items-start gap-2" style={{ top: h * HOUR_H }}>
            <span className={`text-[10px] w-9 text-right pt-0 ${isLight ? "text-neutral-400" : "text-neutral-500"}`}>{pad2(h)}:00</span>
            <div onClick={() => onSlotClick(`${pad2(h)}:00`)}
              className={`flex-1 border-t cursor-pointer ${isLight ? "border-neutral-200" : "border-neutral-800"}`} style={{ height: HOUR_H }} />
          </div>
        ))}

        {events.map((ev) => {
          const start = timeToMinutes(ev.startTime);
          const end = Math.max(timeToMinutes(ev.endTime), start + 20);
          const top = (start / 60) * HOUR_H;
          const height = ((end - start) / 60) * HOUR_H - 3;
          const c = colorOf(ev.color);
          return (
            <button key={ev.id} onClick={() => onEventClick(ev)}
              className={`absolute left-11 right-1 rounded-xl px-3 py-1.5 text-left overflow-hidden ${c.soft} border-l-4`}
              style={{ top, height: Math.max(height, 26), borderLeftColor: c.hex }}>
              <p className={`text-xs font-medium truncate ${isLight ? "text-neutral-700" : "text-neutral-100"}`}>{ev.title}</p>
              {height > 32 && <p className="text-[10px] text-neutral-500">{formatHM(ev.startTime)}–{formatHM(ev.endTime)}</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
