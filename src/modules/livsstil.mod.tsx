import type { ModuleDef, ModuleProps } from "../App";

// ---- State-typer ----
type RokStatus = "" | "rokfri" | "tidigare" | "rokare";
type SnusStatus = "" | "snusfri" | "snusare";
type AlcLevel = "" | "ingen" | "mattligt" | "hog";
type ActLevel = "" | "lag" | "vardag" | "pulshoj";
type DietLevel = "" | "normal" | "lchf" | "veg" | "vegan";

type State = {
  rokStatus: RokStatus;
  paketar: number;
  snusStatus: SnusStatus;
  alcLevel: AlcLevel;
  alcUnits: number;
  actLevel: ActLevel;
  actMinutes: number;
  actStrength: boolean;
  diet: DietLevel;
  dietFree: string;
  sleepHours: number;
  sleepInsomnia: boolean;
  sleepAwakenings: boolean;
  stress: "" | "hanterbar" | "pataglig";
  livFree: string;
};

// ---- UI ----
function clamp(n: number, a: number, b: number) { return Math.max(a, Math.min(b, n)); }
function num(v: string, fb = 0) { const n = Number(v); return Number.isFinite(n) ? n : fb; }

function Component({ state, setState, collapsed, toggle }: ModuleProps<State>) {
  return (
    <div className={"panel " + (collapsed ? "collapsed" : "")}>
      <button className="panel-h collapsible" onClick={toggle}>
        <span className="twisty">{collapsed ? "▶" : "▼"}</span>
        <span>Livsstil</span>
      </button>
      <div className="panel-b">
        {/* Rökning */}
        <div className="subcard">
          <div className="subh">Rökning</div>
          <div className="row wrap tight">
            <Chip label="Rökfri" active={state.rokStatus==="rokfri"} onClick={()=>setState({ rokStatus: state.rokStatus==="rokfri"?"":"rokfri" })}/>
            <Chip label="Tidigare rökare" active={state.rokStatus==="tidigare"} onClick={()=>setState({ rokStatus: state.rokStatus==="tidigare"?"":"tidigare" })}/>
            <Chip label="Rökare" active={state.rokStatus==="rokare"} onClick={()=>setState({ rokStatus: state.rokStatus==="rokare"?"":"rokare" })}/>
            <span className="lbl ml">Paketår:</span>
            <input className="inp w-24" type="number" min={0} max={70} value={state.paketar}
                   onChange={(e)=>setState({ paketar: clamp(num(e.target.value, 0), 0, 70) })}/>
            <input className="range" type="range" min={0} max={70} value={state.paketar}
                   onChange={(e)=>setState({ paketar: clamp(num(e.target.value, 0), 0, 70) })}/>
          </div>
        </div>

        {/* Snus */}
        <div className="subcard">
          <div className="subh">Snus</div>
          <div className="row tight">
            <Chip label="Snusfri" active={state.snusStatus==="snusfri"} onClick={()=>setState({ snusStatus: state.snusStatus==="snusfri"?"":"snusfri" })}/>
            <Chip label="Snusare" active={state.snusStatus==="snusare"} onClick={()=>setState({ snusStatus: state.snusStatus==="snusare"?"":"snusare" })}/>
          </div>
        </div>

        {/* Alkohol */}
        <div className="subcard">
          <div className="subh">Alkohol</div>
          <div className="row wrap tight">
            <Chip label="Ingen" active={state.alcLevel==="ingen"} onClick={()=>setState({ alcLevel: state.alcLevel==="ingen"?"":"ingen" })}/>
            <Chip label="Måttligt" active={state.alcLevel==="mattligt"} onClick={()=>setState({ alcLevel: state.alcLevel==="mattligt"?"":"mattligt" })}/>
            <Chip label="Hög konsumtion" active={state.alcLevel==="hog"} onClick={()=>setState({ alcLevel: state.alcLevel==="hog"?"":"hog" })}/>
            <span className="lbl ml">Enheter/vecka:</span>
            <input className="inp w-24" type="number" min={0} max={50} value={state.alcUnits}
                   onChange={(e)=>setState({ alcUnits: clamp(num(e.target.value, 0), 0, 50) })}/>
            <input className="range" type="range" min={0} max={50} value={state.alcUnits}
                   onChange={(e)=>setState({ alcUnits: clamp(num(e.target.value, 0), 0, 50) })}/>
          </div>
        </div>

        {/* Fysisk aktivitet */}
        <div className="subcard">
          <div className="subh">Fysisk aktivitet</div>
          <div className="row wrap tight">
            <Chip label="Låg fysisk aktivitet" active={state.actLevel==="lag"} onClick={()=>setState({ actLevel: state.actLevel==="lag"?"":"lag" })}/>
            <Chip label="Vardagsmotion (låg intensitet)" active={state.actLevel==="vardag"} onClick={()=>setState({ actLevel: state.actLevel==="vardag"?"":"vardag" })}/>
            <Chip label="Pulshöjande aktivitet" active={state.actLevel==="pulshoj"} onClick={()=>setState({ actLevel: state.actLevel==="pulshoj"?"":"pulshoj" })}/>
            <label className="chk"><input type="checkbox" checked={state.actStrength} onChange={e=>setState({ actStrength: e.target.checked })}/> Muskelstärkande</label>
            <span className="lbl ml">Minuter/vecka:</span>
            <input className="inp w-24" type="number" min={0} max={600} value={state.actMinutes}
                   onChange={(e)=>setState({ actMinutes: clamp(num(e.target.value, 0), 0, 600) })}/>
            <input className="range" type="range" min={0} max={600} step={10} value={state.actMinutes}
                   onChange={(e)=>setState({ actMinutes: clamp(num(e.target.value, 0), 0, 600) })}/>
          </div>
        </div>

        {/* Kost */}
        <div className="subcard">
          <div className="subh">Kost</div>
          <div className="row wrap tight">
            <Chip label="Normal kost" active={state.diet==="normal"} onClick={()=>setState({ diet: state.diet==="normal"?"":"normal" })}/>
            <Chip label="LCHF" active={state.diet==="lchf"} onClick={()=>setState({ diet: state.diet==="lchf"?"":"lchf" })}/>
            <Chip label="Vegetarisk" active={state.diet==="veg"} onClick={()=>setState({ diet: state.diet==="veg"?"":"veg" })}/>
            <Chip label="Vegansk" active={state.diet==="vegan"} onClick={()=>setState({ diet: state.diet==="vegan"?"":"vegan" })}/>
            <input className="inp" placeholder="Fritext (kost)" value={state.dietFree} onChange={e=>setState({ dietFree: e.target.value })}/>
          </div>
        </div>

        {/* Sömn */}
        <div className="subcard">
          <div className="subh">Sömn</div>
          <div className="row wrap tight">
            <span className="lbl">Timmar/natt:</span>
            <input className="inp w-20" type="number" min={0} max={12} step={0.5} value={state.sleepHours}
                   onChange={(e)=>setState({ sleepHours: clamp(num(e.target.value, 0), 0, 12) })}/>
            <input className="range" type="range" min={0} max={12} step={0.5} value={state.sleepHours}
                   onChange={(e)=>setState({ sleepHours: clamp(num(e.target.value, 0), 0, 12) })}/>
            <button className={"chip " + (state.sleepInsomnia?"active":"")} onClick={()=>setState({ sleepInsomnia: !state.sleepInsomnia })}>Insomningsproblem</button>
            <button className={"chip " + (state.sleepAwakenings?"active":"")} onClick={()=>setState({ sleepAwakenings: !state.sleepAwakenings })}>Nattliga uppvaknanden</button>
          </div>
        </div>

        {/* Stress + fritext */}
        <div className="subcard">
          <div className="subh">Stress</div>
          <div className="row tight">
            <Chip label="Hanterbar" active={state.stress==="hanterbar"} onClick={()=>setState({ stress: state.stress==="hanterbar"?"":"hanterbar" })}/>
            <Chip label="Påtaglig" active={state.stress==="pataglig"} onClick={()=>setState({ stress: state.stress==="pataglig"?"":"pataglig" })}/>
          </div>
        </div>

        <textarea className="ta mt" rows={3} placeholder="Livsstil: fritext…" value={state.livFree} onChange={e=>setState({ livFree: e.target.value })}/>
      </div>
    </div>
  );
}

function ensurePeriod(s: string) {
  const t = s.trim();
  if (!t) return "";
  return /[.!?]$/.test(t) ? t : t + ".";
}

// ---- Generator ----
function buildText(s: State) {
  const parts: string[] = [];
  if (s.rokStatus === "rokfri") parts.push("Rökfri.");
  if (s.rokStatus === "tidigare") parts.push("Tidigare rökare.");
  if (s.rokStatus === "rokare") parts.push("Rökare.");
  if (s.paketar > 0) parts.push(`Paketår ≈ ${s.paketar}.`);
  if (s.snusStatus === "snusfri") parts.push("Snusfri.");
  if (s.snusStatus === "snusare") parts.push("Snusare.");
  if (s.alcLevel === "ingen") parts.push("Alkoholkonsumtion: ingen.");
  if (s.alcLevel === "mattligt") parts.push("Alkoholkonsumtion i måttliga mängder.");
  if (s.alcLevel === "hog") parts.push("Hög alkoholkonsumtion.");
  if (s.alcUnits > 0) parts.push(`≈ ${s.alcUnits} enheter/vecka.`);
  if (s.actLevel === "lag") parts.push("Låg fysisk aktivitet.");
  if (s.actLevel === "vardag") parts.push("Vardagsmotion (låg intensitet).");
  if (s.actLevel === "pulshoj") parts.push("Pulshöjande aktivitet.");
  if (s.actMinutes > 0) parts.push(`~${s.actMinutes} min/vecka.`);
  if (s.actStrength) parts.push("Muskelstärkande träning.");
  if (s.diet === "normal") parts.push("Normal kost.");
  if (s.diet === "lchf") parts.push("LCHF.");
  if (s.diet === "veg") parts.push("Vegetarisk kost.");
  if (s.diet === "vegan") parts.push("Vegansk kost.");
  if (s.dietFree.trim()) parts.push(ensurePeriod(s.dietFree));
  if (s.sleepHours > 0) parts.push(`Sömn ~${s.sleepHours} h/natt.`);
  if (s.sleepInsomnia) parts.push("Insomningsproblem.");
  if (s.sleepAwakenings) parts.push("Nattliga uppvaknanden.");
  if (s.stress === "hanterbar") parts.push("Upplever stress som hanterbar.");
  if (s.stress === "pataglig") parts.push("Upplever påtaglig stress.");
  if (s.livFree.trim()) parts.push(ensurePeriod(s.livFree));

  if (!parts.length) return "";
  return `Livsstil: ${parts.join(" ")}`;
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button className={"chip" + (active ? " active" : "")} onClick={onClick}>{label}</button>;
}

const def: ModuleDef<State> = {
  id: "livsstil",
  title: "Livsstil",
  order: 10,
  group: "livsstil",
  initialState: {
    rokStatus: "", paketar: 0, snusStatus: "",
    alcLevel: "", alcUnits: 0,
    actLevel: "", actMinutes: 0, actStrength: false,
    diet: "", dietFree: "",
    sleepHours: 0, sleepInsomnia: false, sleepAwakenings: false,
    stress: "", livFree: "",
  },
  Component,
  buildText,
};
export default def;
