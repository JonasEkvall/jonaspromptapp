// src/modules/lungor.mod.tsx
import type { ModuleDef, ModuleProps } from "../App";

type Place =
  | "basalt bilateralt"
  | "höger underlob"
  | "mellanloben"
  | "höger överlob"
  | "vänster underlob"
  | "vänster överlob";

const ALL_PLACES: Place[] = [
  "basalt bilateralt",
  "höger underlob",
  "mellanloben",
  "höger överlob",
  "vänster underlob",
  "vänster överlob",
];

type LungsState = {
  ua: boolean;

  // Inspektion
  work: "" | "samtal" | "vila" | "free";
  workFree: string;

  // Perkussion
  perkDamped: boolean;
  perkDampedPlaces: Place[];
  perkFree: string;

  // Andningsljud
  breathingDamped: boolean;
  breathingDampedPlaces: Place[];
  breathingNone: boolean;
  breathingNonePlaces: Place[];

  // Biljud
  bilSlem: boolean;
  bilSlemPlaces: Place[];
  bilSlemFree: string;
  
  bilRassel: boolean;
  bilRasselPlaces: Place[];
  bilRasselFree: string;
  bilRasselDiscrete: boolean;
  
  bilObstr: boolean;
  bilObstrPlaces: Place[];
  bilObstrFree: string;
  
  bilOther: boolean;
  bilOtherFree: string;

  // Fritext
  freeText: string;
};

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

const LungorModule: ModuleDef<LungsState> = {
  id: "lungor",
  title: "Lungor",
  order: 40,
  group: "status",
  initialState: {
    ua: false,
    work: "",
    workFree: "",

    perkDamped: false,
    perkDampedPlaces: [],
    perkFree: "",

    breathingDamped: false,
    breathingDampedPlaces: [],
    breathingNone: false,
    breathingNonePlaces: [],

    bilSlem: false,
    bilSlemPlaces: [],
    bilSlemFree: "",
    
    bilRassel: false,
    bilRasselPlaces: [],
    bilRasselFree: "",
    bilRasselDiscrete: false,
    
    bilObstr: false,
    bilObstrPlaces: [],
    bilObstrFree: "",
    
    bilOther: false,
    bilOtherFree: "",

    freeText: "",
  },

  Component: ({ state, setState, collapsed, toggle: tg }: ModuleProps<LungsState>) => {
    const clearUA = () => state.ua && setState({ ua: false });

    return (
      <div className={"panel " + (collapsed ? "collapsed" : "")}>
        <button className="panel-h collapsible" aria-expanded={!collapsed} onClick={tg}>
          <span className="twisty">{collapsed ? "▶" : "▼"}</span>
          <span>Lungor</span>
        </button>
        <div className="panel-b">
          <label className="chk">
            <input
              type="checkbox"
              checked={state.ua}
              onChange={(e) =>
                setState({
                  ua: e.target.checked,
                  work: e.target.checked ? "" : state.work,
                  workFree: e.target.checked ? "" : state.workFree,
                  perkDamped: e.target.checked ? false : state.perkDamped,
                  perkDampedPlaces: e.target.checked ? [] : state.perkDampedPlaces,
                  perkFree: e.target.checked ? "" : state.perkFree,
                  breathingDamped: e.target.checked ? false : state.breathingDamped,
                  breathingDampedPlaces: e.target.checked ? [] : state.breathingDampedPlaces,
                  breathingNone: e.target.checked ? false : state.breathingNone,
                  breathingNonePlaces: e.target.checked ? [] : state.breathingNonePlaces,
                  bilSlem: e.target.checked ? false : state.bilSlem,
                  bilSlemPlaces: e.target.checked ? [] : state.bilSlemPlaces,
                  bilSlemFree: e.target.checked ? "" : state.bilSlemFree,
                  bilRassel: e.target.checked ? false : state.bilRassel,
                  bilRasselPlaces: e.target.checked ? [] : state.bilRasselPlaces,
                  bilRasselFree: e.target.checked ? "" : state.bilRasselFree,
                  bilRasselDiscrete: e.target.checked ? false : state.bilRasselDiscrete,
                  bilObstr: e.target.checked ? false : state.bilObstr,
                  bilObstrPlaces: e.target.checked ? [] : state.bilObstrPlaces,
                  bilObstrFree: e.target.checked ? "" : state.bilObstrFree,
                  bilOther: e.target.checked ? false : state.bilOther,
                  bilOtherFree: e.target.checked ? "" : state.bilOtherFree,
                  freeText: e.target.checked ? "" : state.freeText,
                })
              }
            />{" "}
            UA
          </label>

          <div className="row tight mt">
            <span className="lbl">Inspektion:</span>
            <button
              className={"chip " + (state.work === "samtal" ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ work: state.work === "samtal" ? "" : "samtal", workFree: "" });
              }}
            >
              Samtalsdyspné
            </button>
            <button
              className={"chip " + (state.work === "vila" ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ work: state.work === "vila" ? "" : "vila", workFree: "" });
              }}
            >
              Vilodyspné
            </button>
            <input
              className="inp"
              placeholder="Fritext (inspektion)"
              value={state.work === "free" ? state.workFree : ""}
              onChange={(e) => {
                clearUA();
                setState({ work: "free", workFree: e.target.value });
              }}
            />
          </div>

          <div className="row tight mt">
            <span className="lbl">Perkussion:</span>
            <button
              className={"chip " + (state.perkDamped ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ perkDamped: !state.perkDamped, perkDampedPlaces: [] });
              }}
            >
              Dämpad
            </button>
            <input
              className="inp"
              placeholder="Fritext (perkussion)"
              value={state.perkFree}
              onChange={(e) => {
                clearUA();
                setState({ perkFree: e.target.value });
              }}
            />

            {state.perkDamped && (
              <>
                <span className="lbl">Lokalisering:</span>
                {ALL_PLACES.map((p) => (
                  <button
                    key={p}
                    className={"chip " + (state.perkDampedPlaces.includes(p) ? "active" : "")}
                    onClick={() => setState({ perkDampedPlaces: toggle(state.perkDampedPlaces, p) })}
                  >
                    {p}
                  </button>
                ))}
              </>
            )}
          </div>

          <div className="row tight mt">
            <span className="lbl">Andningsljud:</span>
          </div>

          <div className="row tight mt">
            <button
              className={"chip " + (state.breathingDamped ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ breathingDamped: !state.breathingDamped, breathingDampedPlaces: [] });
              }}
            >
              Dämpade
            </button>

            {state.breathingDamped && (
              <>
                <span className="lbl">Dämpade:</span>
                {ALL_PLACES.map((p) => (
                  <button
                    key={p}
                    className={"chip " + (state.breathingDampedPlaces.includes(p) ? "active" : "")}
                    style={{
                      fontStyle: 'italic',
                      backgroundColor: state.breathingDampedPlaces.includes(p) ? '#007bff' : '#e3f2fd',
                      border: '1px dashed #2196f3',
                      fontSize: '0.9em'
                    }}
                    onClick={() => setState({ breathingDampedPlaces: toggle(state.breathingDampedPlaces, p) })}
                  >
                    {p}
                  </button>
                ))}
              </>
            )}
          </div>

          <div className="row tight mt">
            <button
              className={"chip " + (state.breathingNone ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ breathingNone: !state.breathingNone, breathingNonePlaces: [] });
              }}
            >
              Inga
            </button>

            {state.breathingNone && (
              <>
                <span className="lbl">Inga:</span>
                {ALL_PLACES.map((p) => (
                  <button
                    key={p}
                    className={"chip " + (state.breathingNonePlaces.includes(p) ? "active" : "")}
                    style={{
                      fontStyle: 'italic',
                      backgroundColor: state.breathingNonePlaces.includes(p) ? '#007bff' : '#e3f2fd',
                      border: '1px dashed #2196f3',
                      fontSize: '0.9em'
                    }}
                    onClick={() => setState({ breathingNonePlaces: toggle(state.breathingNonePlaces, p) })}
                  >
                    {p}
                  </button>
                ))}
              </>
            )}
          </div>

          <div className="row tight mt">
            <span className="lbl">Biljud:</span>
          </div>

          <div className="row tight mt">
            <button
              className={"chip " + (state.bilSlem ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ bilSlem: !state.bilSlem, bilSlemPlaces: [], bilSlemFree: "" });
              }}
            >
              Slembiljud
            </button>

            {state.bilSlem && (
              <>
                <span className="lbl">Slembiljud:</span>
                {ALL_PLACES.map((p) => (
                  <button
                    key={p}
                    className={"chip " + (state.bilSlemPlaces.includes(p) ? "active" : "")}
                    style={{
                      fontStyle: 'italic',
                      backgroundColor: state.bilSlemPlaces.includes(p) ? '#007bff' : '#e3f2fd',
                      border: '1px dashed #2196f3',
                      fontSize: '0.9em'
                    }}
                    onClick={() => setState({ bilSlemPlaces: toggle(state.bilSlemPlaces, p) })}
                  >
                    {p}
                  </button>
                ))}
                <input
                  className="inp"
                  placeholder="Fritext (slembiljud)"
                  value={state.bilSlemFree}
                  onChange={(e) => setState({ bilSlemFree: e.target.value })}
                />
              </>
            )}
          </div>

          <div className="row tight mt">
            <button
              className={"chip " + (state.bilRassel ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ bilRassel: !state.bilRassel, bilRasselPlaces: [], bilRasselFree: "" });
              }}
            >
              Rassel
            </button>
            <button
              className={"chip " + (state.bilRasselDiscrete ? "active" : "")}
              onClick={() => setState({ bilRasselDiscrete: !state.bilRasselDiscrete })}
            >
              Diskreta
            </button>

            {state.bilRassel && (
              <>
                <span className="lbl">Rassel:</span>
                {ALL_PLACES.map((p) => (
                  <button
                    key={p}
                    className={"chip " + (state.bilRasselPlaces.includes(p) ? "active" : "")}
                    style={{
                      fontStyle: 'italic',
                      backgroundColor: state.bilRasselPlaces.includes(p) ? '#007bff' : '#e3f2fd',
                      border: '1px dashed #2196f3',
                      fontSize: '0.9em'
                    }}
                    onClick={() => setState({ bilRasselPlaces: toggle(state.bilRasselPlaces, p) })}
                  >
                    {p}
                  </button>
                ))}
                <input
                  className="inp"
                  placeholder="Fritext (rassel)"
                  value={state.bilRasselFree}
                  onChange={(e) => setState({ bilRasselFree: e.target.value })}
                />
              </>
            )}
          </div>

          <div className="row tight mt">
            <button
              className={"chip " + (state.bilObstr ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ bilObstr: !state.bilObstr, bilObstrPlaces: [], bilObstrFree: "" });
              }}
            >
              Obstruktiva
            </button>

            {state.bilObstr && (
              <>
                <span className="lbl">Obstruktiva:</span>
                {ALL_PLACES.map((p) => (
                  <button
                    key={p}
                    className={"chip " + (state.bilObstrPlaces.includes(p) ? "active" : "")}
                    style={{
                      fontStyle: 'italic',
                      backgroundColor: state.bilObstrPlaces.includes(p) ? '#007bff' : '#e3f2fd',
                      border: '1px dashed #2196f3',
                      fontSize: '0.9em'
                    }}
                    onClick={() => setState({ bilObstrPlaces: toggle(state.bilObstrPlaces, p) })}
                  >
                    {p}
                  </button>
                ))}
                <input
                  className="inp"
                  placeholder="Fritext (obstruktiva biljud)"
                  value={state.bilObstrFree}
                  onChange={(e) => setState({ bilObstrFree: e.target.value })}
                />
              </>
            )}
          </div>

          <div className="row tight mt">
            <button
              className={"chip " + (state.bilOther ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ bilOther: !state.bilOther, bilOtherFree: "" });
              }}
            >
              Annat
            </button>

            {state.bilOther && (
              <input
                className="inp"
                placeholder="Fritext (biljud)"
                value={state.bilOtherFree}
                onChange={(e) => setState({ bilOtherFree: e.target.value })}
              />
            )}
          </div>

          <div className="row tight mt">
            <input
              className="inp"
              placeholder="Fritext (kommentarer, pox, andningsfrekvens, etc.)"
              value={state.freeText}
              onChange={(e) => setState({ freeText: e.target.value })}
            />
          </div>
        </div>
      </div>
    );
  },

  buildText: (s: LungsState) => {
    const anyAbn =
      s.work !== "" ||
      !!s.workFree.trim() ||
      s.perkDamped ||
      !!s.perkFree.trim() ||
      s.breathingDamped ||
      s.breathingNone ||
      s.bilSlem ||
      s.bilRassel ||
      s.bilObstr ||
      s.bilOther ||
      !!s.bilOtherFree.trim() ||
      !!s.freeText.trim();

    if (s.ua && !anyAbn) {
      return "Lungor: Inspekteras med lugnt, symmetriskt andningsarbete. Auskulteras med vesikulära andningsljud över alla 5 lober.";
    }
    if (!anyAbn) return "";

    const parts: string[] = [];

    // Inspektion - ersätter första meningen
    if (s.work === "samtal") {
      parts.push("Inspekteras med samtalsdyspné.");
    } else if (s.work === "vila") {
      parts.push("Inspekteras med vilodyspné.");
    } else if (s.work === "free" && s.workFree.trim()) {
      parts.push(`Inspekteras med ${s.workFree.trim().replace(/\.*$/, ".")}`);
    } else {
      parts.push("Inspekteras med lugnt, symmetriskt andningsarbete.");
    }

    // Perkussion
    if (s.perkDamped) {
      if (s.perkDampedPlaces.length === 0 && !s.perkFree.trim()) {
        parts.push("Perkuteras med dämpad perkussionston.");
      } else {
        const damped: string[] = [];
        if (s.perkDampedPlaces.length) damped.push(s.perkDampedPlaces.join(", "));
        if (s.perkFree.trim()) damped.push(s.perkFree.trim());
        parts.push(`Perkuteras med dämpad perkussionston ${damped.join(", ")}.`);
      }
    } else if (s.perkFree.trim()) {
      parts.push(`Perkuteras med ${s.perkFree.trim().replace(/\.*$/, ".")}`);
    }

    // Andningsljud och biljud kombinerat
    const auscultationParts: string[] = [];
    
    // Grundtext för auskultation
    if (!s.breathingDamped && !s.breathingNone) {
      auscultationParts.push("vesikulära andningsljud över alla 5 lober");
    }

    // Andningsljud
    if (s.breathingDamped) {
      if (s.breathingDampedPlaces.length === 0) {
        auscultationParts.push("dämpade andningsljud");
      } else {
        auscultationParts.push(`dämpade andningsljud ${s.breathingDampedPlaces.join(", ")}`);
      }
    }
    if (s.breathingNone) {
      if (s.breathingNonePlaces.length === 0) {
        auscultationParts.push("inga andningsljud");
      } else {
        auscultationParts.push(`inga andningsljud ${s.breathingNonePlaces.join(", ")}`);
      }
    }

    // Biljud
    if (s.bilSlem) {
      if (s.bilSlemPlaces.length === 0 && !s.bilSlemFree.trim()) {
        auscultationParts.push("slembiljud");
      } else {
        const places: string[] = [];
        if (s.bilSlemPlaces.length) places.push(s.bilSlemPlaces.join(", "));
        if (s.bilSlemFree.trim()) places.push(s.bilSlemFree.trim());
        auscultationParts.push(`slembiljud ${places.join(", ")}`);
      }
    }
    if (s.bilRassel) {
      let rasselText = "rassel";
      if (s.bilRasselDiscrete) {
        rasselText = "diskreta rassel";
      }
      
      if (s.bilRasselPlaces.length === 0 && !s.bilRasselFree.trim()) {
        auscultationParts.push(rasselText);
      } else {
        const places: string[] = [];
        if (s.bilRasselPlaces.length) places.push(s.bilRasselPlaces.join(", "));
        if (s.bilRasselFree.trim()) places.push(s.bilRasselFree.trim());
        auscultationParts.push(`${rasselText} ${places.join(", ")}`);
      }
    }
    if (s.bilObstr) {
      if (s.bilObstrPlaces.length === 0 && !s.bilObstrFree.trim()) {
        auscultationParts.push("obstruktiva biljud");
      } else {
        const places: string[] = [];
        if (s.bilObstrPlaces.length) places.push(s.bilObstrPlaces.join(", "));
        if (s.bilObstrFree.trim()) places.push(s.bilObstrFree.trim());
        auscultationParts.push(`obstruktiva biljud ${places.join(", ")}`);
      }
    }
    if (s.bilOther && s.bilOtherFree.trim()) {
      auscultationParts.push(s.bilOtherFree.trim());
    }

    if (auscultationParts.length) {
      parts.push(`Auskulteras med ${auscultationParts.join(", ")}.`);
    }

    // Kommentarer
    if (s.freeText.trim()) {
      parts.push(s.freeText.trim().replace(/\.*$/, "."));
    }

    return "Lungor: " + parts.join(" ");
  },
};

export default LungorModule;
