import type { ModuleDef, ModuleProps } from "../App";

type State = {
  ua: boolean;
  trott: boolean;
  smarpt: boolean;
  paverkat: boolean;
  feber: "" | "feberfri" | "feber";
  temp: number;
  free: string; // fritext
};

function Component({ state, setState, collapsed, toggle }: ModuleProps<State>) {
  const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
  const num = (v: string, fb = 0) => { const n = Number(v); return Number.isFinite(n) ? n : fb; };

  return (
    <div className={"panel " + (collapsed ? "collapsed" : "")}>
      <button className="panel-h collapsible" onClick={toggle}>
        <span className="twisty">{collapsed ? "▶" : "▼"}</span>
        <span>Allmäntillstånd (AT)</span>
      </button>
      <div className="panel-b">
        <div className="row wrap tight">
          <label className="chk"><input type="checkbox" checked={state.ua} onChange={e=>setState({ ua: e.target.checked })}/> UA</label>
          <label className="chk"><input type="checkbox" checked={state.trott} onChange={e=>setState({ trott: e.target.checked, ua:false })}/> Trött</label>
          <label className="chk"><input type="checkbox" checked={state.smarpt} onChange={e=>setState({ smarpt: e.target.checked, ua:false })}/> Smärtpåverkad</label>
          <label className="chk"><input type="checkbox" checked={state.paverkat} onChange={e=>setState({ paverkat: e.target.checked, ua:false })}/> Påverkat AT</label>

          <span className="lbl ml">Feber:</span>
          <Chip label="Feberfri" active={state.feber==="feberfri"} onClick={()=>setState({ feber: state.feber==="feberfri"?"":"feberfri", ua:false })}/>
          <Chip label="Feber" active={state.feber==="feber"} onClick={()=>setState({ feber: state.feber==="feber"?"":"feber", ua:false })}/>

          <span className="lbl ml">Temp (°C):</span>
          <input className="inp w-20" type="number" step={0.1} min={0} max={45} value={state.temp}
                 onChange={(e)=>setState({ temp: clamp(num(e.target.value, 0), 0, 45), ua:false })}/>
        </div>
        <textarea className="ta mt" rows={2} placeholder="AT: fritext…" value={state.free} onChange={e=>setState({ free: e.target.value })}/>
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
  const parts: string[] = [];
  if (s.trott) parts.push("Ser trött ut");
  if (s.smarpt) parts.push("Smärtpåverkad");
  if (s.paverkat) parts.push("Påverkat allmäntillstånd");
  if (s.feber === "feberfri") parts.push("Feberfri");
  if (s.feber === "feber") parts.push("Feber");
  if (s.temp > 0) parts.push(`Temp ${s.temp.toFixed(1)} °C`);

  let line = "";
  if (parts.length === 0) {
    if (s.ua) line = "Gott och opåverkat.";
    else if (s.free.trim()) line = ensurePeriod(s.free);
  } else {
    let t = parts.join(", ");
    if (s.ua) t += ", i övrigt opåverkat";
    t += ".";
    if (s.free.trim()) t += " " + ensurePeriod(s.free);
    line = t;
  }
  return line ? `Allmäntillstånd: ${line}` : "";
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button className={"chip" + (active ? " active" : "")} onClick={onClick}>{label}</button>;
}

const def: ModuleDef<State> = {
  id: "at",
  title: "Allmäntillstånd",
  order: 20,
  group: "status",
  initialState: { ua:false, trott:false, smarpt:false, paverkat:false, feber:"", temp:0, free:"" },
  Component,
  buildText,
};
export default def;