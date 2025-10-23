import type { ModuleDef, ModuleProps } from "../App";

type State = {
  hypertoni: boolean;
  hyperlipidemi: boolean;
  diabetesMellitus: boolean;
  astma: boolean;
  kol: boolean;
  sjukhistoria: string;
};

function Component({ state, setState, collapsed, toggle }: ModuleProps<State>) {
  return (
    <div className={"panel " + (collapsed ? "collapsed" : "")}>
      <button className="panel-h collapsible" onClick={toggle}>
        <span className="twisty">{collapsed ? "▶" : "▼"}</span>
        <span>Sjukhistoria</span>
      </button>
      <div className="panel-b">
        <div className="row wrap tight mb">
          <button
            className={"chip " + (state.hypertoni ? "active" : "")}
            onClick={() => setState({ hypertoni: !state.hypertoni })}
          >
            Hypertoni
          </button>
          <button
            className={"chip " + (state.hyperlipidemi ? "active" : "")}
            onClick={() => setState({ hyperlipidemi: !state.hyperlipidemi })}
          >
            Hyperlipidemi
          </button>
          <button
            className={"chip " + (state.diabetesMellitus ? "active" : "")}
            onClick={() => setState({ diabetesMellitus: !state.diabetesMellitus })}
          >
            Diabetes Mellitus Typ 2
          </button>
          <button
            className={"chip " + (state.astma ? "active" : "")}
            onClick={() => setState({ astma: !state.astma })}
          >
            Astma
          </button>
          <button
            className={"chip " + (state.kol ? "active" : "")}
            onClick={() => setState({ kol: !state.kol })}
          >
            KOL
          </button>
        </div>
        <textarea className="ta" rows={4} placeholder="Sjukhistoria…" value={state.sjukhistoria} onChange={e=>setState({ sjukhistoria: e.target.value })}/>
      </div>
    </div>
  );
}

function ensurePeriod(s: string) {
  const t = s.trim();
  if (!t) return "";
  return /[.!?]$/.test(t) ? t : t + ".";
}

function buildText(s: State) {
  const diagnoses: string[] = [];
  
  if (s.hypertoni) diagnoses.push("hypertoni");
  if (s.hyperlipidemi) diagnoses.push("hyperlipidemi");
  if (s.diabetesMellitus) diagnoses.push("diabetes mellitus typ 2");
  if (s.astma) diagnoses.push("astma");
  if (s.kol) diagnoses.push("KOL");
  
  const parts: string[] = [];
  
  if (diagnoses.length > 0) {
    parts.push(diagnoses.join(", "));
  }
  
  if (s.sjukhistoria.trim()) {
    parts.push(ensurePeriod(s.sjukhistoria));
  }
  
  if (parts.length === 0) return "";
  
  return `Sjukhistoria: ${parts.join(", ")}`;
}

const def: ModuleDef<State> = {
  id: "sjukhistorik",
  title: "Sjukhistoria",
  order: 5,
  group: "sjukhistoria",
  initialState: { 
    hypertoni: false,
    hyperlipidemi: false,
    diabetesMellitus: false,
    astma: false,
    kol: false,
    sjukhistoria: "" 
  },
  Component,
  buildText,
};
export default def;