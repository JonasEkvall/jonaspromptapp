import type { ModuleDef, ModuleProps } from "../App";

type State = {
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
  if (!s.sjukhistoria.trim()) return "";
  return `Sjukhistoria: ${ensurePeriod(s.sjukhistoria)}`;
}

const def: ModuleDef<State> = {
  id: "sjukhistorik",
  title: "Sjukhistoria",
  order: 20,
  group: "status",
  initialState: { sjukhistoria: "" },
  Component,
  buildText,
};
export default def;