import type { ModuleDef, ModuleProps } from "../App";

type State = {
  // Vitalparametrar
  blodtryck: string;
  puls: string;
  pox: string;
  andningsfrekvens: string;
  
  // Labb
  blodstatusUA: boolean;
  blodstatus: string;
  elstatusUA: boolean;
  elstatus: string;
  leverstatusUA: boolean;
  leverstatus: string;
  lipidstatusUA: boolean;
  lipidstatus: string;
  crp: string;
  hb: string;
  glukos: string;
  
  // Övrigt
  ekgUA: boolean;
  ekg: string;
  hemblodtryck: string;
  fritext: string;
};

function Component({ state, setState, collapsed, toggle }: ModuleProps<State>) {
  return (
    <div className={"panel " + (collapsed ? "collapsed" : "")}>
      <button className="panel-h collapsible" onClick={toggle}>
        <span className="twisty">{collapsed ? "▶" : "▼"}</span>
        <span>Labb mm</span>
      </button>
      <div className="panel-b">
        {/* Vitalparametrar */}
        <div className="mb">
          <strong>Vitalparametrar:</strong>
          <div className="row wrap tight" style={{ marginTop: "0.5rem" }}>
            <input
              type="text"
              placeholder="Blodtryck"
              value={state.blodtryck}
              onChange={(e) => setState({ blodtryck: e.target.value })}
              style={{ flex: "1 1 120px", padding: "0.4rem", marginRight: "0.5rem", marginBottom: "0.5rem" }}
            />
            <input
              type="text"
              placeholder="Puls"
              value={state.puls}
              onChange={(e) => setState({ puls: e.target.value })}
              style={{ flex: "1 1 120px", padding: "0.4rem", marginRight: "0.5rem", marginBottom: "0.5rem" }}
            />
            <input
              type="text"
              placeholder="Pox"
              value={state.pox}
              onChange={(e) => setState({ pox: e.target.value })}
              style={{ flex: "1 1 120px", padding: "0.4rem", marginRight: "0.5rem", marginBottom: "0.5rem" }}
            />
            <input
              type="text"
              placeholder="Andningsfrekvens"
              value={state.andningsfrekvens}
              onChange={(e) => setState({ andningsfrekvens: e.target.value })}
              style={{ flex: "1 1 120px", padding: "0.4rem", marginBottom: "0.5rem" }}
            />
          </div>
        </div>

        {/* Labb */}
        <div className="mb">
          <strong>Labb:</strong>
          <div style={{ marginTop: "0.5rem" }}>
            {/* Blodstatus */}
            <div className="row" style={{ marginBottom: "0.5rem", alignItems: "center" }}>
              <span style={{ width: "120px" }}>Blodstatus:</span>
              <button
                className={"chip " + (state.blodstatusUA ? "active" : "")}
                onClick={() => setState({ blodstatusUA: !state.blodstatusUA })}
                style={{ marginRight: "0.5rem" }}
              >
                UA
              </button>
              <input
                type="text"
                placeholder=""
                value={state.blodstatus}
                onChange={(e) => setState({ blodstatus: e.target.value })}
                style={{ flex: 1, padding: "0.4rem" }}
              />
            </div>

            {/* elstatus */}
            <div className="row" style={{ marginBottom: "0.5rem", alignItems: "center" }}>
              <span style={{ width: "120px" }}>elstatus:</span>
              <button
                className={"chip " + (state.elstatusUA ? "active" : "")}
                onClick={() => setState({ elstatusUA: !state.elstatusUA })}
                style={{ marginRight: "0.5rem" }}
              >
                UA
              </button>
              <input
                type="text"
                placeholder=""
                value={state.elstatus}
                onChange={(e) => setState({ elstatus: e.target.value })}
                style={{ flex: 1, padding: "0.4rem" }}
              />
            </div>

            {/* leverstatus */}
            <div className="row" style={{ marginBottom: "0.5rem", alignItems: "center" }}>
              <span style={{ width: "120px" }}>leverstatus:</span>
              <button
                className={"chip " + (state.leverstatusUA ? "active" : "")}
                onClick={() => setState({ leverstatusUA: !state.leverstatusUA })}
                style={{ marginRight: "0.5rem" }}
              >
                UA
              </button>
              <input
                type="text"
                placeholder=""
                value={state.leverstatus}
                onChange={(e) => setState({ leverstatus: e.target.value })}
                style={{ flex: 1, padding: "0.4rem" }}
              />
            </div>

            {/* lipidstatus */}
            <div className="row" style={{ marginBottom: "0.5rem", alignItems: "center" }}>
              <span style={{ width: "120px" }}>lipidstatus:</span>
              <button
                className={"chip " + (state.lipidstatusUA ? "active" : "")}
                onClick={() => setState({ lipidstatusUA: !state.lipidstatusUA })}
                style={{ marginRight: "0.5rem" }}
              >
                UA
              </button>
              <input
                type="text"
                placeholder=""
                value={state.lipidstatus}
                onChange={(e) => setState({ lipidstatus: e.target.value })}
                style={{ flex: 1, padding: "0.4rem" }}
              />
            </div>

            {/* CRP, Hb, Glukos */}
            <div className="row wrap tight" style={{ marginTop: "0.5rem" }}>
              <input
                type="text"
                placeholder="CRP"
                value={state.crp}
                onChange={(e) => setState({ crp: e.target.value })}
                style={{ flex: "1 1 120px", padding: "0.4rem", marginRight: "0.5rem", marginBottom: "0.5rem" }}
              />
              <input
                type="text"
                placeholder="Hb"
                value={state.hb}
                onChange={(e) => setState({ hb: e.target.value })}
                style={{ flex: "1 1 120px", padding: "0.4rem", marginRight: "0.5rem", marginBottom: "0.5rem" }}
              />
              <input
                type="text"
                placeholder="Glukos"
                value={state.glukos}
                onChange={(e) => setState({ glukos: e.target.value })}
                style={{ flex: "1 1 120px", padding: "0.4rem", marginBottom: "0.5rem" }}
              />
            </div>
          </div>
        </div>

        {/* Övrigt */}
        <div>
          <strong>Övrigt:</strong>
          <div style={{ marginTop: "0.5rem" }}>
            {/* EKG */}
            <div className="row" style={{ marginBottom: "0.5rem", alignItems: "center" }}>
              <span style={{ width: "120px" }}>EKG:</span>
              <button
                className={"chip " + (state.ekgUA ? "active" : "")}
                onClick={() => setState({ ekgUA: !state.ekgUA })}
                style={{ marginRight: "0.5rem" }}
              >
                UA
              </button>
              <input
                type="text"
                placeholder="normofrekvent sinusrytm"
                value={state.ekg}
                onChange={(e) => setState({ ekg: e.target.value })}
                style={{ flex: 1, padding: "0.4rem" }}
              />
            </div>

            {/* Hemblodtrycksmätning */}
            <div className="row" style={{ marginBottom: "0.5rem", alignItems: "center" }}>
              <span style={{ width: "120px" }}>Hemblodtrycksmätning:</span>
              <input
                type="text"
                placeholder=""
                value={state.hemblodtryck}
                onChange={(e) => setState({ hemblodtryck: e.target.value })}
                style={{ flex: 1, padding: "0.4rem" }}
              />
            </div>

            {/* Fritext */}
            <div>
              <textarea
                className="ta"
                rows={4}
                placeholder="Fritext (Labb mm)"
                value={state.fritext}
                onChange={(e) => setState({ fritext: e.target.value })}
              />
            </div>
          </div>
        </div>
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
  
  // Vitalparametrar
  const vitalParams: string[] = [];
  if (s.blodtryck.trim()) vitalParams.push(`BT ${s.blodtryck.trim()}`);
  if (s.puls.trim()) vitalParams.push(`puls ${s.puls.trim()}`);
  if (s.pox.trim()) vitalParams.push(`pox ${s.pox.trim()}`);
  if (s.andningsfrekvens.trim()) vitalParams.push(`AF ${s.andningsfrekvens.trim()}`);
  
  if (vitalParams.length > 0) {
    parts.push(`Vitalparametrar: ${vitalParams.join(", ")}`);
  }
  
  // Labb
  const labbParams: string[] = [];
  if (s.blodstatusUA) labbParams.push("blodstatus ua");
  if (s.blodstatus.trim()) labbParams.push(`blodstatus ${s.blodstatus.trim()}`);
  if (s.elstatusUA) labbParams.push("elstatus ua");
  if (s.elstatus.trim()) labbParams.push(`elstatus ${s.elstatus.trim()}`);
  if (s.leverstatusUA) labbParams.push("leverstatus ua");
  if (s.leverstatus.trim()) labbParams.push(`leverstatus ${s.leverstatus.trim()}`);
  if (s.lipidstatusUA) labbParams.push("lipidstatus ua");
  if (s.lipidstatus.trim()) labbParams.push(`lipidstatus ${s.lipidstatus.trim()}`);
  if (s.crp.trim()) labbParams.push(`CRP ${s.crp.trim()}`);
  if (s.hb.trim()) labbParams.push(`Hb ${s.hb.trim()}`);
  if (s.glukos.trim()) labbParams.push(`glukos ${s.glukos.trim()}`);
  
  if (labbParams.length > 0) {
    parts.push(`Labb: ${labbParams.join(", ")}`);
  }
  
  // Övrigt
  const ovrigtParams: string[] = [];
  
  // EKG logik
  if (s.ekgUA && s.ekg.trim()) {
    // Både UA och fritext: EKG med [fritext], bedöms som normalt EKG
    ovrigtParams.push(`EKG med ${s.ekg.trim()}, bedöms som normalt EKG`);
  } else if (s.ekgUA && !s.ekg.trim()) {
    // Endast UA: EKG med normofrekvent sinusrytm, bedöms som normalt EKG
    ovrigtParams.push("EKG med normofrekvent sinusrytm, bedöms som normalt EKG");
  } else if (!s.ekgUA && s.ekg.trim()) {
    // Endast fritext: visa bara fritexten utan "bedöms som normalt EKG"
    ovrigtParams.push(`EKG ${s.ekg.trim()}`);
  }
  
  if (s.hemblodtryck.trim()) {
    ovrigtParams.push(`Hemblodtrycksmätning ${s.hemblodtryck.trim()}`);
  }
  
  if (s.fritext.trim()) {
    ovrigtParams.push(ensurePeriod(s.fritext));
  }
  
  if (ovrigtParams.length > 0) {
    parts.push(`Övrigt: ${ovrigtParams.join(". ")}`);
  }
  
  return parts.join(". ");
}

const def: ModuleDef<State> = {
  id: "labbmm",
  title: "Labb mm",
  order: 6,
  group: "labb",
  initialState: { 
    blodtryck: "",
    puls: "",
    pox: "",
    andningsfrekvens: "",
    blodstatusUA: false,
    blodstatus: "",
    elstatusUA: false,
    elstatus: "",
    leverstatusUA: false,
    leverstatus: "",
    lipidstatusUA: false,
    lipidstatus: "",
    crp: "",
    hb: "",
    glukos: "",
    ekgUA: false,
    ekg: "",
    hemblodtryck: "",
    fritext: ""
  },
  Component,
  buildText,
};
export default def;