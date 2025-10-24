import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";

/** JonasPromptApp – modulär aggregator med startsida, Sökorsak och förbättrad kopiering */
const REV = 17;
const REV_AT = "2025-10-24 00:45"; // visas endast på startsidan

// --------- Grupp-typer ---------
export type Group =
  | "sokorsak"
  | "sjukhistoria"
  | "livsstil"
  | "anamnes"
  | "status"
  | "labb"
  | "bedomning";

const GROUP_ORDER: Group[] = [
  "sokorsak",
  "sjukhistoria",
  "livsstil",
  "anamnes",
  "status",
  "labb",
  "bedomning",
];

const GROUP_LABEL: Record<Group, string> = {
  sokorsak: "Sökorsak",
  sjukhistoria: "Sjukhistoria",
  livsstil: "Livsstil/socialt",
  anamnes: "Anamnes",
  status: "Status",
  labb: "Labb mm",
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
const TEMPLATES_STORAGE_KEY = "jonasprompt_templates";
const MAX_AGE_DAYS = 7; // Besök äldre än detta antal dagar tas bort automatiskt
const AUTOSAVE_DELAY_MS = 5000; // Autospara efter 5 sekunder

// --------- Mallar ---------
type Template = {
  id: string;
  name: string;
  description: string;
  visit: Visit;
  contactReason: string;
  states: Record<string, any>;
  createdAt: string;
};

function loadTemplates(): Template[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveTemplates(templates: Template[]) {
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error('Fel vid sparande av mallar:', e);
  }
}

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
  
  // Autosparande
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autosaveTimerRef = useRef<number | null>(null);

  const setSlice = useCallback((id: string) => (patch: Partial<any>) =>
    setStates((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } })), []);
  const toggle = useCallback((id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] })), []);

  // Separata memoized beräkningar för bättre prestanda
  const moduleTexts = useMemo(() => {
    return MODS.map((m) => ({
      group: m.group,
      moduleId: m.id,
      moduleTitle: m.title,
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

  const { allText, byGroup, ranges, modulesByGroup } = useMemo(() => {
    // Kombinera alla texter
    const pieces = [...moduleTexts];
    if (sokorsakText) {
      pieces.unshift({ 
        group: "sokorsak" as Group, 
        moduleId: "sokorsak", 
        moduleTitle: "Sökorsak",
        text: sokorsakText 
      });
    }

    // Gruppera
    const byGroup: Record<Group, string> = {
      sokorsak: "",
      sjukhistoria: "",
      livsstil: "",
      anamnes: "",
      status: "",
      labb: "",
      bedomning: "",
    };
    
    // Gruppera moduler per grupp (för visuell distinktion)
    const modulesByGroup: Record<Group, Array<{ moduleId: string; moduleTitle: string; text: string }>> = {
      sokorsak: [],
      sjukhistoria: [],
      livsstil: [],
      anamnes: [],
      status: [],
      labb: [],
      bedomning: [],
    };
    
    for (const g of GROUP_ORDER) {
      const groupPieces = pieces.filter((p) => p.group === g);
      byGroup[g] = groupPieces.map((p) => p.text).join("\n");
      modulesByGroup[g] = groupPieces.map((p) => ({
        moduleId: p.moduleId,
        moduleTitle: p.moduleTitle,
        text: p.text,
      }));
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
      labb: [0, 0],
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

    return { allText: all, byGroup, ranges, modulesByGroup };
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
    const timestamp = visitOpenedAt || new Date().toISOString();
    
    // Leta efter befintligt besök med samma timestamp (samma session)
    const existingIndex = visits.findIndex((v) => v.timestamp === timestamp);
    
    const visitData: SavedVisit = {
      id: existingIndex >= 0 ? visits[existingIndex].id : Date.now().toString(),
      timestamp,
      visit,
      contactReason,
      states: clone(states),
    };
    
    let updated: SavedVisit[];
    if (existingIndex >= 0) {
      // Uppdatera befintligt besök
      updated = [...visits];
      updated[existingIndex] = visitData;
    } else {
      // Lägg till nytt besök i början, behåll max 10
      updated = [visitData, ...visits].slice(0, MAX_SAVED_VISITS);
    }
    
    saveVisits(updated);
    setLastSaved(new Date());
  }, [visit, contactReason, states, visitOpenedAt]);

  // ---- Autosparande ----
  useEffect(() => {
    if (screen !== "visit") return;

    // Rensa tidigare timer
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    // Sätt ny timer
    autosaveTimerRef.current = window.setTimeout(() => {
      saveCurrentVisit();
    }, AUTOSAVE_DELAY_MS);

    // Cleanup
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [screen, visit, contactReason, states, saveCurrentVisit]);

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

  // ---- Mallhantering ----
  const saveAsTemplate = useCallback((name: string, description: string) => {
    const templates = loadTemplates();
    const newTemplate: Template = {
      id: Date.now().toString(),
      name,
      description,
      visit,
      contactReason,
      states: clone(states),
      createdAt: new Date().toISOString(),
    };
    
    const updated = [newTemplate, ...templates];
    saveTemplates(updated);
    return true;
  }, [visit, contactReason, states]);

  const loadTemplate = useCallback((template: Template) => {
    setVisit(template.visit);
    setContactReason(template.contactReason);
    setStates(clone(template.states));
    setCollapsed(Object.fromEntries(MODS.map((m) => [m.id, false])));
  }, []);

  const deleteTemplate = useCallback((templateId: string) => {
    const templates = loadTemplates();
    const updated = templates.filter((t) => t.id !== templateId);
    saveTemplates(updated);
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
          lastSaved={lastSaved}
          onSaveTemplate={saveAsTemplate}
          onLoadTemplate={loadTemplate}
          onDeleteTemplate={deleteTemplate}
          onCollapseAll={() => setCollapsed(Object.fromEntries(MODS.map((m) => [m.id, true])))}
          onExpandAll={() => setCollapsed(Object.fromEntries(MODS.map((m) => [m.id, false])))}
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
            {MODS.map((m) => {
              const previewText = m.buildText(states[m.id]);
              return (
                <ModuleWrapper
                  key={m.id}
                  module={m}
                  state={states[m.id]}
                  setState={setSlice(m.id)}
                  collapsed={collapsed[m.id]}
                  toggle={() => toggle(m.id)}
                  previewText={previewText}
                />
              );
            })}
          </section>

          {/* Höger: output + kopiering */}
          <section className="col">
            <OutputPanel 
              allText={allText}
              copied={copied}
              onCopy={copy}
              taRef={taRef}
              byGroup={byGroup}
              modulesByGroup={modulesByGroup}
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
  onGoHome,
  lastSaved,
  onSaveTemplate,
  onLoadTemplate,
  onDeleteTemplate,
  onCollapseAll,
  onExpandAll,
}: { 
  title: string; 
  onGoHome: () => void;
  lastSaved: Date | null;
  onSaveTemplate: (name: string, desc: string) => boolean;
  onLoadTemplate: (template: Template) => void;
  onDeleteTemplate: (id: string) => void;
  onCollapseAll: () => void;
  onExpandAll: () => void;
}) => {
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert("Vänligen ange ett namn för mallen");
      return;
    }
    onSaveTemplate(templateName.trim(), templateDesc.trim());
    setTemplateName("");
    setTemplateDesc("");
    setShowTemplateDialog(false);
    alert("Mall sparad!");
  };

  const handleExportTemplates = () => {
    const templates = loadTemplates();
    if (templates.length === 0) {
      alert("Inga mallar att exportera");
      return;
    }
    
    const dataStr = JSON.stringify(templates, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jonasprompt-mallar-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert(`${templates.length} mallar exporterade!`);
  };

  const handleImportTemplates = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTemplates: Template[] = JSON.parse(e.target?.result as string);
        
        if (!Array.isArray(importedTemplates)) {
          throw new Error("Ogiltig filformat");
        }

        const existingTemplates = loadTemplates();
        
        // Kontrollera för dubbletter (baserat på namn)
        const existingNames = new Set(existingTemplates.map(t => t.name));
        const newTemplates = importedTemplates.filter(t => !existingNames.has(t.name));
        const duplicates = importedTemplates.length - newTemplates.length;
        
        if (newTemplates.length === 0) {
          alert("Alla mallar i filen finns redan!");
          return;
        }

        // Generera nya ID:n för importerade mallar
        const templatesWithNewIds = newTemplates.map(t => ({
          ...t,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
        }));

        const updated = [...templatesWithNewIds, ...existingTemplates];
        saveTemplates(updated);
        
        let message = `${newTemplates.length} mallar importerade!`;
        if (duplicates > 0) {
          message += ` (${duplicates} dubbletter hoppades över)`;
        }
        alert(message);
        setShowLoadDialog(false);
        
      } catch (error) {
        alert("Fel vid import: Ogiltig JSON-fil");
        console.error(error);
      }
    };
    reader.readAsText(file);
    
    // Återställ input så samma fil kan väljas igen
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const templates = loadTemplates();

  return (
    <header className="header" style={{ flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <button className="btn" onClick={onGoHome}>
          Spara nuvarande besök och gå till startsidan
        </button>
      </div>
      
      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", width: "100%" }}>
        <button className="chip" onClick={() => setShowTemplateDialog(true)}>
          💾 Spara som mall
        </button>
        <button className="chip" onClick={() => setShowLoadDialog(true)}>
          📂 Ladda mall ({templates.length})
        </button>
        
        {/* Separator */}
        <div style={{ 
          width: "1px", 
          height: "24px", 
          backgroundColor: "#d1d5db",
          margin: "0 4px"
        }} />
        
        <button className="chip" onClick={onExpandAll}>
          ▼ Öppna alla
        </button>
        <button className="chip" onClick={onCollapseAll}>
          ▲ Stäng alla
        </button>
        
        {lastSaved && (
          <span className="hint" style={{ marginLeft: "auto" }}>
            Autosparad: {new Intl.DateTimeFormat("sv-SE", { timeStyle: "medium" }).format(lastSaved)}
          </span>
        )}
      </div>

      {showTemplateDialog && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }} onClick={() => setShowTemplateDialog(false)}>
          <div className="panel" style={{ width: "min(500px, 90vw)", maxHeight: "80vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="panel-h">Spara som mall</div>
            <div className="panel-b">
              <div style={{ marginBottom: "12px" }}>
                <label className="lbl" style={{ display: "block", marginBottom: "4px" }}>Mallnamn *</label>
                <input
                  className="inp"
                  style={{ width: "100%" }}
                  placeholder="t.ex. Årskontroll Diabetes"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label className="lbl" style={{ display: "block", marginBottom: "4px" }}>Beskrivning (valfritt)</label>
                <textarea
                  className="ta"
                  rows={3}
                  placeholder="Beskrivning av mallen..."
                  value={templateDesc}
                  onChange={(e) => setTemplateDesc(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button className="btn" onClick={() => setShowTemplateDialog(false)}>
                  Avbryt
                </button>
                <button className="btn" style={{ backgroundColor: "#2563eb", color: "#fff" }} onClick={handleSaveTemplate}>
                  Spara mall
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLoadDialog && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }} onClick={() => setShowLoadDialog(false)}>
          <div className="panel" style={{ width: "min(600px, 90vw)", maxHeight: "80vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="panel-h">Ladda mall</div>
            <div className="panel-b">
              {/* Export/Import knappar */}
              <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>
                  💾 Säkerhetskopiera mallar
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button 
                    className="chip" 
                    onClick={handleExportTemplates}
                    disabled={templates.length === 0}
                    style={{ 
                      backgroundColor: templates.length === 0 ? "#e5e7eb" : "#10b981",
                      color: templates.length === 0 ? "#9ca3af" : "#fff",
                      borderColor: templates.length === 0 ? "#e5e7eb" : "#10b981",
                      cursor: templates.length === 0 ? "not-allowed" : "pointer"
                    }}
                  >
                    ⬇️ Exportera alla mallar
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportTemplates}
                    style={{ display: "none" }}
                  />
                  <button 
                    className="chip" 
                    onClick={() => fileInputRef.current?.click()}
                    style={{ 
                      backgroundColor: "#2563eb",
                      color: "#fff",
                      borderColor: "#2563eb"
                    }}
                  >
                    ⬆️ Importera mallar
                  </button>
                </div>
                <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "6px" }}>
                  Exportera dina mallar för att använda dem på andra datorer/webbläsare
                </div>
              </div>

              {templates.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", opacity: 0.6 }}>
                  Inga sparade mallar ännu
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {templates.map((template) => (
                    <div key={template.id} className="panel" style={{ padding: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                        <div style={{ flex: 1, cursor: "pointer" }} onClick={() => {
                          onLoadTemplate(template);
                          setShowLoadDialog(false);
                        }}>
                          <div style={{ fontWeight: "600", marginBottom: "4px" }}>{template.name}</div>
                          {template.description && (
                            <div style={{ fontSize: "13px", opacity: 0.7, marginBottom: "4px" }}>
                              {template.description}
                            </div>
                          )}
                          <div style={{ fontSize: "12px", opacity: 0.5 }}>
                            Skapad: {new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium" }).format(new Date(template.createdAt))}
                          </div>
                        </div>
                        <button
                          className="btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Radera mallen "${template.name}"?`)) {
                              onDeleteTemplate(template.id);
                              setShowLoadDialog(false);
                            }
                          }}
                          style={{ flexShrink: 0, color: "#dc2626" }}
                        >
                          Radera
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: "12px", textAlign: "right" }}>
                <button className="btn" onClick={() => setShowLoadDialog(false)}>
                  Stäng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
});

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

const GROUP_COLORS: Record<Group, { bg: string; border: string; text: string }> = {
  sokorsak: { bg: "#fef3c7", border: "#fbbf24", text: "#78350f" },
  sjukhistoria: { bg: "#fee2e2", border: "#f87171", text: "#7f1d1d" },
  livsstil: { bg: "#dcfce7", border: "#4ade80", text: "#14532d" },
  anamnes: { bg: "#e0e7ff", border: "#818cf8", text: "#312e81" },
  status: { bg: "#ddd6fe", border: "#a78bfa", text: "#4c1d95" },
  labb: { bg: "#fff7ed", border: "#fb923c", text: "#7c2d12" },
  bedomning: { bg: "#fce7f3", border: "#f472b6", text: "#831843" },
};

const OutputPanel = React.memo(({ 
  allText, 
  copied, 
  onCopy, 
  taRef,
  byGroup,
  modulesByGroup,
}: {
  allText: string;
  copied: CopyMode | null;
  onCopy: (mode: CopyMode) => void;
  taRef: React.RefObject<HTMLTextAreaElement | null>;
  byGroup: Record<Group, string>;
  modulesByGroup: Record<Group, Array<{ moduleId: string; moduleTitle: string; text: string }>>;
}) => {
  const [viewMode, setViewMode] = React.useState<"formatted" | "plain">("formatted");

  // Funktion för att göra färgen lite mörkare för submoduler
  const darkenColor = (hex: string, percent: number) => {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, ((num >> 16) & 0xff) * (1 - percent));
    const g = Math.max(0, ((num >> 8) & 0xff) * (1 - percent));
    const b = Math.max(0, (num & 0xff) * (1 - percent));
    return "#" + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
  };

  return (
    <div className="panel flexcol">
      <div className="panel-h">Genererad text</div>
      <div className="panel-b">
        <div className="row wrap tight mb">
          <button
            className={"chip" + (copied === "all" ? " active" : "")}
            onClick={() => onCopy("all")}
            title="Kopiera allt"
          >
            📋 Kopiera allt
          </button>
          {GROUP_ORDER.map((g) => {
            if (!byGroup[g]) return null;
            const colors = GROUP_COLORS[g];
            return (
              <button
                key={g}
                className={"chip" + (copied === g ? " active" : "")}
                onClick={() => onCopy(g)}
                title={`Kopiera ${GROUP_LABEL[g]}`}
                style={
                  copied === g
                    ? undefined
                    : {
                        backgroundColor: colors.bg,
                        borderColor: colors.border,
                        color: colors.text,
                      }
                }
              >
                {GROUP_LABEL[g]}
              </button>
            );
          })}
        </div>

        <div className="row tight mb">
          <button
            className={"chip" + (viewMode === "formatted" ? " active" : "")}
            onClick={() => setViewMode("formatted")}
          >
            🎨 Formaterad vy
          </button>
          <button
            className={"chip" + (viewMode === "plain" ? " active" : "")}
            onClick={() => setViewMode("plain")}
          >
            📄 Enkel vy
          </button>
        </div>

        <div style={{ 
          overflow: "auto",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          backgroundColor: "#fafafa",
          minHeight: "300px",
          display: viewMode === "formatted" ? "block" : "none",
        }}>
          {GROUP_ORDER.map((g) => {
            const modules = modulesByGroup[g];
            if (!modules || modules.length === 0) return null;
            const colors = GROUP_COLORS[g];
            
            return (
              <div
                key={g}
                style={{
                  margin: "8px",
                  padding: "12px",
                  backgroundColor: colors.bg,
                  border: `2px solid ${colors.border}`,
                  borderRadius: "8px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    color: colors.text,
                    marginBottom: modules.length > 1 ? "12px" : "8px",
                    opacity: 0.8,
                    letterSpacing: "0.5px",
                  }}
                >
                  {GROUP_LABEL[g]}
                </div>
                
                {/* Visa moduler som subsektioner om det finns fler än 1 */}
                {modules.length > 1 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {modules.map((mod, idx) => (
                      <div
                        key={mod.moduleId}
                        style={{
                          padding: "10px",
                          backgroundColor: `rgba(255, 255, 255, ${0.3 + idx * 0.1})`,
                          borderRadius: "6px",
                          border: `1px solid ${darkenColor(colors.border, 0.1)}`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "10px",
                            fontWeight: "600",
                            color: colors.text,
                            marginBottom: "6px",
                            opacity: 0.7,
                          }}
                        >
                          {mod.moduleTitle}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            lineHeight: "1.6",
                            color: colors.text,
                            whiteSpace: "pre-wrap",
                            fontFamily: "inherit",
                          }}
                        >
                          {mod.text}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: "13px",
                      lineHeight: "1.6",
                      color: colors.text,
                      whiteSpace: "pre-wrap",
                      fontFamily: "inherit",
                    }}
                  >
                    {modules[0].text}
                  </div>
                )}
              </div>
            );
          })}
          {!allText && (
            <div style={{ 
              padding: "2rem", 
              textAlign: "center", 
              opacity: 0.5,
              color: "#6b7280" 
            }}>
              Börja fylla i formulären för att generera text...
            </div>
          )}
        </div>
        <textarea 
          ref={taRef} 
          className="ta grow" 
          readOnly 
          value={allText}
          style={{ display: viewMode === "plain" ? "block" : "none" }}
        />
        
        <p className="hint mt">
          {viewMode === "formatted" 
            ? "Formaterad vy visar text i färgade sektioner. Byt till enkel vy för att se markeringar vid kopiering."
            : "Texten som kopieras markeras i rutan."}
        </p>
      </div>
    </div>
  );
});

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

const ModuleWrapper = React.memo(({
  module,
  state,
  setState,
  collapsed,
  toggle,
  previewText,
}: {
  module: ModuleDef;
  state: any;
  setState: (patch: Partial<any>) => void;
  collapsed: boolean;
  toggle: () => void;
  previewText: string;
}) => {
  return (
    <div>
      <module.Component
        state={state}
        setState={setState}
        collapsed={collapsed}
        toggle={toggle}
      />
      {!collapsed && previewText && (
        <div style={{
          marginTop: "8px",
          padding: "8px 12px",
          backgroundColor: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: "8px",
          fontSize: "13px",
          color: "#0c4a6e",
        }}>
          <div style={{ fontWeight: "600", marginBottom: "4px", fontSize: "12px", opacity: 0.7 }}>
            📝 Förhandsvisning:
          </div>
          <div style={{ whiteSpace: "pre-wrap" }}>{previewText}</div>
        </div>
      )}
    </div>
  );
});

