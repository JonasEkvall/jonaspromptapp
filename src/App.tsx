import React, { useCallback, useMemo, useRef, useState } from "react";
import "./styles.css";

/** JonasPromptApp – modulär aggregator med startsida, Sökorsak och förbättrad kopiering */
const REV = 12;
const REV_AT = "2025-10-23 23:04"; // visas endast på startsidan

// --------- Grupp-typer ---------
export type Group =
  | "sokorsak"
  | "sjukhistoria"
  | "livsstil"
  | "anamnes"
  | "status"
  | "bedomning";

const GROUP_ORDER: Group[] = [
  "sokorsak",
  "sjukhistoria",
  "livsstil",
  "anamnes",
  "status",
  "bedomning",
];

const GROUP_LABEL: Record<Group, string> = {
  sokorsak: "Sökorsak",
  sjukhistoria: "Sjukhistoria",
  livsstil: "Livsstil/socialt",
  anamnes: "Anamnes",
  status: "Status",
  bedomning: "Bedömning/uppföljning",
};

// --------- Modul-kontrakt ---------
export type ModuleProps<S> = {
  state: S;
  setState: (patch: Partial<S>) => void;
  collapsed: boolean;
  toggle: () => void;
};
export type ModuleDef<S = any> = {
  id: string;
  title: string;
  order: number;
  group: Group;
  initialState: S;
  Component: React.FC<ModuleProps<S>>;
  buildText: (state: S) => string;
};

// Auto-ladda moduler (*.mod.tsx) - cached för bättre prestanda
const modFiles = import.meta.glob("./modules/*.mod.tsx", { eager: true }) as Record<
  string,
  { default: ModuleDef }
>;
const MODS = Object.values(modFiles)
  .map((m) => m.default)
  .sort((a, b) => a.order - b.order);

// --------- Besökstyp (övergripande, inte modul) ---------
type Visit = "" | "akut" | "dropin" | "plan" | "ars";
const VISIT_TYPES: { id: Visit; label: string }[] = [
  { id: "akut", label: "Akutbesök" },
  { id: "dropin", label: "Drop-inbesök" },
  { id: "plan", label: "Planerat besök" },
  { id: "ars", label: "Årskontroll" },
];

// Deep-klon för initialState
function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

type Screen = "home" | "visit" | "history";

// --------- Sparade besök ---------
type SavedVisit = {
  id: string;
  timestamp: string;
  visit: Visit;
  contactReason: string;
  states: Record<string, any>;
};

const MAX_SAVED_VISITS = 10;
const STORAGE_KEY = "jonasprompt_visits";
const MAX_AGE_DAYS = 7; // Besök äldre än detta antal dagar tas bort automatiskt

function loadVisits(): SavedVisit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    
    const allVisits: SavedVisit[] = JSON.parse(raw);
    const now = Date.now();
    const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000; // 7 dagar i millisekunder
    
    // Filtrera bort besök äldre än en vecka
    const validVisits = allVisits.filter((visit) => {
      try {
        const visitTime = new Date(visit.timestamp).getTime();
        return (now - visitTime) < maxAge;
      } catch {
        return false; // Ta bort besök med ogiltigt datum
      }
    });
    
    // Om vi filtrerade bort några besök, uppdatera localStorage
    if (validVisits.length !== allVisits.length) {
      saveVisits(validVisits);
    }
    
    return validVisits;
  } catch {
    return [];
  }
}

function saveVisits(visits: SavedVisit[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
  } catch (e) {
    console.error('Fel vid sparande till localStorage:', e);
  }
}

export default function App() {
  // Startsida
  const [screen, setScreen] = useState<Screen>("home");
  const [visitOpenedAt, setVisitOpenedAt] = useState<string>("");

  // Besökstyp + kontaktorsak
  const [visit, setVisit] = useState<Visit>("");
  const [contactReason, setContactReason] = useState<string>("");

  // Modul-state per id - memoized initialisering
  const initialState = useMemo(() => 
    Object.fromEntries(MODS.map((m) => [m.id, clone(m.initialState)])), 
    []
  );
  const initialCollapsed = useMemo(() => 
    Object.fromEntries(MODS.map((m) => [m.id, false])), 
    []
  );
  
  const [states, setStates] = useState<Record<string, any>>(initialState);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(initialCollapsed);

  const setSlice = useCallback((id: string) => (patch: Partial<any>) =>
    setStates((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } })), []);
  const toggle = useCallback((id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] })), []);

  // Separata memoized beräkningar för bättre prestanda
  const moduleTexts = useMemo(() => {
    return MODS.map((m) => ({
      group: m.group,
      text: (m.buildText(states[m.id]) || "").trim(),
    })).filter((x) => x.text.length > 0);
  }, [states]);

  const sokorsakText = useMemo(() => {
    const sokLines: string[] = [];
    if (visit) {
      const label = VISIT_TYPES.find((v) => v.id === visit)?.label || "";
      sokLines.push(`Besökstyp: ${label}.`);
    }
    if (contactReason.trim()) {
      sokLines.push(`Kontaktorsak: ${contactReason.trim()}.`);
    }
    return sokLines.length ? sokLines.join(" ") : "";
  }, [visit, contactReason]);

  const { allText, byGroup, ranges } = useMemo(() => {
    // Kombinera alla texter
    const pieces = [...moduleTexts];
    if (sokorsakText) {
      pieces.unshift({ group: "sokorsak" as Group, text: sokorsakText });
    }

    // Gruppera
    const byGroup: Record<Group, string> = {
      sokorsak: "",
      sjukhistoria: "",
      livsstil: "",
      anamnes: "",
      status: "",
      bedomning: "",
    };
    for (const g of GROUP_ORDER) {
      const block = pieces.filter((p) => p.group === g).map((p) => p.text).join("\n");
      byGroup[g] = block;
    }

    // Hela texten + intervall
    let all = "";
    const ranges: Record<Group | "all", [number, number]> = {
      all: [0, 0],
      sokorsak: [0, 0],
      sjukhistoria: [0, 0],
      livsstil: [0, 0],
      anamnes: [0, 0],
      status: [0, 0],
      bedomning: [0, 0],
    };
    let cursor = 0;
    GROUP_ORDER.forEach((g) => {
      const t = byGroup[g];
      if (!t) return;
      if (all) {
        all += "\n";
        cursor += 1;
      }
      const start = cursor;
      all += t;
      cursor += t.length;
      ranges[g] = [start, cursor];
    });
    ranges.all = [0, all.length];

    return { allText: all, byGroup, ranges };
  }, [moduleTexts, sokorsakText]);

  // ---- Kopiering med markerings-feedback ----
  const [copied, setCopied] = useState<CopyMode | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const copy = useCallback(async (mode: CopyMode) => {
    const el = taRef.current;
    if (!el) return;
    el.value = allText;
    const [start, end] = mode === "all" ? ranges.all : ranges[mode];
    if (end > start) {
      el.focus();
      el.setSelectionRange(start, end);
    } else {
      el.setSelectionRange(0, 0);
    }
    try {
      const data = mode === "all" ? allText : byGroup[mode];
      await navigator.clipboard.writeText(data);
    } catch {}
    setCopied(mode);
    setTimeout(() => setCopied((c) => (c === mode ? null : c)), 1200);
  }, [allText, ranges, byGroup]);

  // ---- Sparade besök ----
  const saveCurrentVisit = useCallback(() => {
    // Spara bara om det finns någon data
    const hasVisitData = visit || contactReason.trim();
    const hasModuleData = MODS.some((m) => 
      JSON.stringify(states[m.id]) !== JSON.stringify(m.initialState)
    );
    
    if (!hasVisitData && !hasModuleData) {
      return; // Inget att spara
    }

    const visits = loadVisits();
    const newVisit: SavedVisit = {
      id: Date.now().toString(),
      timestamp: visitOpenedAt || new Date().toISOString(),
      visit,
      contactReason,
      states: clone(states),
    };
    
    // Lägg till i början, behåll max 10
    const updated = [newVisit, ...visits].slice(0, MAX_SAVED_VISITS);
    saveVisits(updated);
  }, [visit, contactReason, states, visitOpenedAt]);

  const loadVisit = useCallback((savedVisit: SavedVisit) => {
    // Radera besöket från listan först för att undvika duplicering
    const visits = loadVisits();
    const updated = visits.filter((v) => v.id !== savedVisit.id);
    saveVisits(updated);
    
    // Ladda besöket
    setVisit(savedVisit.visit);
    setContactReason(savedVisit.contactReason);
    setStates(clone(savedVisit.states));
    setVisitOpenedAt(savedVisit.timestamp);
    setCollapsed(Object.fromEntries(MODS.map((m) => [m.id, false])));
    setScreen("visit");
  }, []);

  // ---- Startsida ----
  const goVisit = useCallback(() => {
    // Nollställ allt
    setVisit("");
    setContactReason("");
    setStates(clone(initialState));
    
    // tid för besöket (ISO-format för korrekt parsning)
    const ts = new Date().toISOString();
    setVisitOpenedAt(ts);
    
    // alla moduler kollapsade vid nytt besök
    setCollapsed(Object.fromEntries(MODS.map((m) => [m.id, true])));
    setScreen("visit");
  }, [initialState]);

  const goHome = useCallback(() => {
    saveCurrentVisit();
    setScreen("home");
  }, [saveCurrentVisit]);

  if (screen === "home") {
    return (
      <HomeScreen 
        onStartVisit={goVisit} 
        onShowHistory={() => setScreen("history")} 
      />
    );
  }

  if (screen === "history") {
    return (
      <HistoryScreen 
        onGoHome={() => setScreen("home")}
        onLoadVisit={loadVisit}
      />
    );
  }

  // dynamisk rubrik
  const visitLabel = visit ? VISIT_TYPES.find((v) => v.id === visit)?.label : "";
  const titleParts = [visitLabel, contactReason.trim()].filter(Boolean) as string[];
  
  // Formattera timestamp för visning
  const formattedTime = visitOpenedAt 
    ? new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Europe/Stockholm",
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(visitOpenedAt))
    : "pågår";
  
  const headerTitle =
    titleParts.length > 0
      ? `${titleParts.join(" - ")} - ${formattedTime}`
      : `Besök – ${formattedTime}`;

  // ---- Besök ----
  return (
    <div className="wrap muted">
      <div className="container">
        <VisitHeader 
          title={headerTitle} 
          onGoHome={goHome} 
        />

        <div className="grid">
          {/* Vänster: Sökorsak + moduler */}
          <section className="col">
            <SokorsakPanel 
              visit={visit}
              setVisit={setVisit}
              contactReason={contactReason}
              setContactReason={setContactReason}
            />

            {/* Moduler – startar kollapsade efter NYTT BESÖK */}
            {MODS.map((m) => (
              <m.Component
                key={m.id}
                state={states[m.id]}
                setState={setSlice(m.id)}
                collapsed={collapsed[m.id]}
                toggle={() => toggle(m.id)}
              />
            ))}
          </section>

          {/* Höger: output + kopiering */}
          <section className="col">
            <OutputPanel 
              allText={allText}
              copied={copied}
              onCopy={copy}
              taRef={taRef}
            />
          </section>
        </div>

      </div>
    </div>
  );
}

// ---- Komponenter ----
const HomeScreen = React.memo(({ 
  onStartVisit, 
  onShowHistory 
}: { 
  onStartVisit: () => void;
  onShowHistory: () => void;
}) => {
  const visits = loadVisits();
  const hasVisits = visits.length > 0;

  return (
    <div className="wrap home">
      <div className="container homec">
        <div className="hero elegant">
          <h1>
            <span className="brand">Jonas</span>PromptApp
          </h1>
          <p className="sub">Modulär textgenerator</p>
          <p className="rev">
            rev {REV} • {REV_AT} • Europe/Stockholm
          </p>
        </div>

        <button className="bigbtn blue" onClick={onStartVisit}>
          NYTT BESÖK
        </button>
        <button 
          className={`bigbtn ${hasVisits ? "green" : "gray"}`}
          onClick={hasVisits ? onShowHistory : undefined}
          style={!hasVisits ? { cursor: "not-allowed" } : undefined}
          title={hasVisits ? `Visa ${visits.length} sparade besök` : "Inga sparade besök"}
        >
          TIDIGARE BESÖK ({visits.length})
        </button>

      </div>
    </div>
  );
});

const VisitHeader = React.memo(({ 
  title, 
  onGoHome 
}: { 
  title: string; 
  onGoHome: () => void; 
}) => (
  <header className="header">
    <h2>{title}</h2>
    <button className="btn" onClick={onGoHome}>
      Spara nuvarande besök och gå till startsidan
    </button>
  </header>
));

const SokorsakPanel = React.memo(({ 
  visit, 
  setVisit, 
  contactReason, 
  setContactReason 
}: {
  visit: Visit;
  setVisit: (visit: Visit) => void;
  contactReason: string;
  setContactReason: (reason: string) => void;
}) => (
  <div className="panel">
    <div className="panel-h">Sökorsak</div>
    <div className="panel-b">
      <div className="row tight mb">
        <span className="lbl">Besökstyp:</span>
        {VISIT_TYPES.map((v) => (
          <button
            key={v.id}
            className={"chip " + (visit === v.id ? "active" : "")}
            onClick={() => setVisit(visit === v.id ? "" : v.id)}
            aria-pressed={visit === v.id}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div className="row tight">
        <span className="lbl">Kontaktorsak:</span>
        <input
          className="inp"
          placeholder="fritext, t.ex. huvudvärk"
          value={contactReason}
          onChange={(e) => setContactReason(e.target.value)}
        />
      </div>
    </div>
  </div>
));

type CopyMode = "all" | Group;

const OutputPanel = React.memo(({ 
  allText, 
  copied, 
  onCopy, 
  taRef 
}: {
  allText: string;
  copied: CopyMode | null;
  onCopy: (mode: CopyMode) => void;
  taRef: React.RefObject<HTMLTextAreaElement | null>;
}) => (
  <div className="panel flexcol">
    <div className="panel-h">Genererad text</div>
    <div className="panel-b">
      <div className="row wrap tight mb">
        <button
          className={"chip" + (copied === "all" ? " active" : "")}
          onClick={() => onCopy("all")}
          title="Kopiera allt"
        >
          Kopiera: Alla
        </button>
        {GROUP_ORDER.map((g) => (
          <button
            key={g}
            className={"chip" + (copied === g ? " active" : "")}
            onClick={() => onCopy(g)}
            title={`Kopiera ${GROUP_LABEL[g]}`}
          >
            {GROUP_LABEL[g]}
          </button>
        ))}
      </div>

      <textarea ref={taRef} className="ta grow" readOnly value={allText} />
      <p className="hint mt">Texten som kopieras markeras i rutan.</p>
    </div>
  </div>
));

const HistoryScreen = React.memo(({ 
  onGoHome, 
  onLoadVisit 
}: { 
  onGoHome: () => void;
  onLoadVisit: (visit: SavedVisit) => void;
}) => {
  const [visits, setVisits] = useState<SavedVisit[]>(() => loadVisits());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(visits.map((v) => v.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const deleteVisit = (id: string) => {
    const updated = visits.filter((v) => v.id !== id);
    setVisits(updated);
    saveVisits(updated);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const deleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Är du säker på att du vill radera ${selectedIds.size} markerade besök? Detta går inte att ångra.`)) {
      const updated = visits.filter((v) => !selectedIds.has(v.id));
      setVisits(updated);
      saveVisits(updated);
      setSelectedIds(new Set());
    }
  };

  const deleteAllVisits = () => {
    if (confirm(`Är du säker på att du vill radera alla ${visits.length} sparade besök? Detta går inte att ångra.`)) {
      setVisits([]);
      saveVisits([]);
      setSelectedIds(new Set());
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const date = new Date(ts);
      return new Intl.DateTimeFormat("sv-SE", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    } catch {
      return ts;
    }
  };

  const getVisitLabel = (savedVisit: SavedVisit) => {
    const parts: string[] = [];
    if (savedVisit.visit) {
      const label = VISIT_TYPES.find((v) => v.id === savedVisit.visit)?.label;
      if (label) parts.push(label);
    }
    if (savedVisit.contactReason.trim()) {
      parts.push(savedVisit.contactReason.trim());
    }
    return parts.length > 0 ? parts.join(" - ") : "Besök";
  };

  return (
    <div className="wrap home">
      <div className="container homec">
        <div className="hero elegant">
          <h1>Tidigare besök</h1>
          <p className="sub">
            {visits.length === 0 
              ? "Inga sparade besök än" 
              : `${visits.length} av max ${MAX_SAVED_VISITS} besök`}
          </p>
          <p className="rev" style={{ marginTop: "0.5rem" }}>
            Besök tas automatiskt bort efter {MAX_AGE_DAYS} dagar
          </p>
        </div>

        {visits.length === 0 ? (
          <div style={{ textAlign: "center", opacity: 0.6, margin: "2rem 0" }}>
            Inga besök sparade ännu. Påbörja ett nytt besök för att börja.
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              <button className="chip" onClick={selectAll}>
                Markera alla
              </button>
              <button className="chip" onClick={deselectAll}>
                Avmarkera alla
              </button>
              {selectedIds.size > 0 && (
                <button 
                  className="chip"
                  onClick={deleteSelected}
                  style={{ 
                    backgroundColor: "#fee2e2",
                    borderColor: "#dc2626",
                    color: "#dc2626"
                  }}
                >
                  Radera {selectedIds.size} markerade
                </button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
              {visits.map((visit) => (
                <div 
                  key={visit.id} 
                  className="panel"
                  style={{ 
                    backgroundColor: selectedIds.has(visit.id) ? "#eff6ff" : "#fff",
                    borderColor: selectedIds.has(visit.id) ? "#2563eb" : "#e5e7eb"
                  }}
                >
                  <div className="panel-b">
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(visit.id)}
                        onChange={() => toggleSelect(visit.id)}
                        style={{ marginTop: "0.25rem", cursor: "pointer", width: "16px", height: "16px" }}
                      />
                      <div 
                        style={{ flex: 1, cursor: "pointer" }}
                        onClick={() => onLoadVisit(visit)}
                      >
                        <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                          {getVisitLabel(visit)}
                        </div>
                        <div style={{ fontSize: "0.875rem", opacity: 0.7 }}>
                          {formatTimestamp(visit.timestamp)}
                        </div>
                      </div>
                      <button
                        className="btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Radera detta besök?")) {
                            deleteVisit(visit.id);
                          }
                        }}
                        style={{ flexShrink: 0 }}
                      >
                        Radera
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {visits.length > 0 && (
          <button 
            className="btn" 
            onClick={deleteAllVisits}
            style={{ 
              width: "100%", 
              justifyContent: "center",
              marginBottom: "1rem",
              color: "#dc2626",
              borderColor: "#dc2626"
            }}
          >
            Radera alla {visits.length} besök
          </button>
        )}

        <button className="bigbtn blue" onClick={onGoHome}>
          TILLBAKA TILL START
        </button>
      </div>
    </div>
  );
});

