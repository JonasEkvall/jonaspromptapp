import type { ModuleDef, ModuleProps } from "../App";

type State = {
  text: string; // fritext för sjukhistoria
};

function Component({ state, setState, collapsed, toggle }: ModuleProps<State>) {
  return (
    <div className={"panel " + (collapsed ? "collapsed" : "")}>
      <button className="panel-h collapsible" onClick={toggle}>
        <span className="twisty">{collapsed ? "▶" : "▼"}</span>
        <span>Sjukhistoria</span>
      </button>
      <div className="panel-b">
        <textarea 
          className="ta" 
          rows={4} 
          placeholder="Sjukhistoria: fritext…" 
          value={state.text} 
          onChange={e => setState({ text: e.target.value })}
        />
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
  if (!s.text.trim()) return "";
  return `Sjukhistoria: ${ensurePeriod(s.text)}`;
}

const def: ModuleDef<State> = {
  id: "sjukhistoria",
  title: "Sjukhistoria",
  order: 5, // Lägre än livsstil (order: 10) för att hamna ovanför
  group: "sjukhistoria",
  initialState: {
    text: "",
  },
  Component,
  buildText,
};

export default def;