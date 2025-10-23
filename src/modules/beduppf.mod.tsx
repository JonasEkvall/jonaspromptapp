// src/modules/beduppf.mod.tsx
import type { ModuleDef, ModuleProps } from "../App";

type TimeUnit = "dagar" | "veckor" | "månader" | "år";

type BedUppfState = {
  // Bedömning
  okomplicerad: string[];
  okomplicFritext: string;
  bedText: string;
  ingaTeckenAllvarlig: boolean;

  // Välreglerat (nu uppdelat per parameter)
  blodtryck: { status: "" | "inom" | "forhojt" | "underkant"; fritext: string };
  blodsocker: { status: "" | "inom" | "forhojt"; fritext: string };
  blodfetter: { status: "" | "inom" | "forhojda"; fritext: string };
  
  // Åtgärd
  atgardText: string;

  // Uppföljning
  planText: string;
  ingen: boolean;
  aterLakare: { aktiv: boolean; tid: number | ""; enhet: TimeUnit };
  aterSsk: { aktiv: boolean; tid: number | ""; enhet: TimeUnit };
  aterLabb: { aktiv: boolean; tid: number | ""; enhet: TimeUnit };
  prov: boolean;
};

const BedUppfModule: ModuleDef<BedUppfState> = {
  id: "beduppf",
  title: "Bedömning/uppföljning",
  order: 90,
  group: "bedomning",
  initialState: {
    okomplicerad: [],
    okomplicFritext: "",
    bedText: "",
    ingaTeckenAllvarlig: false,
    blodtryck: { status: "", fritext: "" },
    blodsocker: { status: "", fritext: "" },
    blodfetter: { status: "", fritext: "" },
    atgardText: "",
    planText: "",
    ingen: false,
    aterLakare: { aktiv: false, tid: "", enhet: "veckor" },
    aterSsk: { aktiv: false, tid: "", enhet: "veckor" },
    aterLabb: { aktiv: false, tid: "", enhet: "veckor" },
    prov: false,
  },

  Component: ({ state, setState, collapsed, toggle }: ModuleProps<BedUppfState>) => {
    const toggleArrayItem = (arr: string[], item: string) => {
      return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
    };

    return (
      <div className={"panel " + (collapsed ? "collapsed" : "")}>
        <button className="panel-h collapsible" aria-expanded={!collapsed} onClick={toggle}>
          <span className="twisty">{collapsed ? "▶" : "▼"}</span>
          <span>Bedömning/uppföljning</span>
        </button>
        <div className="panel-b">
          {/* Bedöms som okomplicerad */}
          <div className="row wrap tight mb">
            <span className="lbl">Bedöms som okomplicerad:</span>
            <button
              className={"chip " + (state.okomplicerad.includes("Övre luftvägsinfektion") ? "active" : "")}
              onClick={() =>
                setState({ okomplicerad: toggleArrayItem(state.okomplicerad, "Övre luftvägsinfektion") })
              }
            >
              Övre luftvägsinfektion
            </button>
            <input
              className="inp"
              placeholder="fritext"
              value={state.okomplicFritext}
              onChange={(e) => setState({ okomplicFritext: e.target.value })}
            />
          </div>

          {/* Bedömning fritext */}
          <div className="row tight mb">
            <span className="lbl">Bedömning:</span>
            <input
              className="inp"
              placeholder="fritext (diagnos, resonemang, diffar)"
              value={state.bedText}
              onChange={(e) => setState({ bedText: e.target.value })}
            />
          </div>

          {/* Inga tecken till allvarlig sjukdom */}
          <div className="row wrap tight mb">
            <button
              className={"chip " + (state.ingaTeckenAllvarlig ? "active" : "")}
              onClick={() => setState({ ingaTeckenAllvarlig: !state.ingaTeckenAllvarlig })}
            >
              Inga tecken till allvarlig sjukdom
            </button>
          </div>

          {/* Blodtryck */}
          <div className="row wrap tight mb">
            <span className="lbl">Blodtryck:</span>
            <button
              className={"chip " + (state.blodtryck.status === "inom" ? "active" : "")}
              onClick={() =>
                setState({
                  blodtryck: { ...state.blodtryck, status: state.blodtryck.status === "inom" ? "" : "inom" },
                })
              }
            >
              Inom målvärden
            </button>
            <button
              className={"chip " + (state.blodtryck.status === "forhojt" ? "active" : "")}
              onClick={() =>
                setState({
                  blodtryck: { ...state.blodtryck, status: state.blodtryck.status === "forhojt" ? "" : "forhojt" },
                })
              }
            >
              Förhöjt
            </button>
            <button
              className={"chip " + (state.blodtryck.status === "underkant" ? "active" : "")}
              onClick={() =>
                setState({
                  blodtryck: {
                    ...state.blodtryck,
                    status: state.blodtryck.status === "underkant" ? "" : "underkant",
                  },
                })
              }
            >
              I underkant
            </button>
            <input
              className="inp"
              placeholder="fritext"
              value={state.blodtryck.fritext}
              onChange={(e) => setState({ blodtryck: { ...state.blodtryck, fritext: e.target.value } })}
            />
          </div>

          {/* Blodsocker */}
          <div className="row wrap tight mb">
            <span className="lbl">Blodsocker:</span>
            <button
              className={"chip " + (state.blodsocker.status === "inom" ? "active" : "")}
              onClick={() =>
                setState({
                  blodsocker: { ...state.blodsocker, status: state.blodsocker.status === "inom" ? "" : "inom" },
                })
              }
            >
              Inom målvärden
            </button>
            <button
              className={"chip " + (state.blodsocker.status === "forhojt" ? "active" : "")}
              onClick={() =>
                setState({
                  blodsocker: { ...state.blodsocker, status: state.blodsocker.status === "forhojt" ? "" : "forhojt" },
                })
              }
            >
              Förhöjt
            </button>
            <input
              className="inp"
              placeholder="fritext"
              value={state.blodsocker.fritext}
              onChange={(e) => setState({ blodsocker: { ...state.blodsocker, fritext: e.target.value } })}
            />
          </div>

          {/* Blodfetter */}
          <div className="row wrap tight mb">
            <span className="lbl">Blodfetter:</span>
            <button
              className={"chip " + (state.blodfetter.status === "inom" ? "active" : "")}
              onClick={() =>
                setState({
                  blodfetter: { ...state.blodfetter, status: state.blodfetter.status === "inom" ? "" : "inom" },
                })
              }
            >
              Inom målvärden
            </button>
            <button
              className={"chip " + (state.blodfetter.status === "forhojda" ? "active" : "")}
              onClick={() =>
                setState({
                  blodfetter: { ...state.blodfetter, status: state.blodfetter.status === "forhojda" ? "" : "forhojda" },
                })
              }
            >
              Förhöjda
            </button>
            <input
              className="inp"
              placeholder="fritext"
              value={state.blodfetter.fritext}
              onChange={(e) => setState({ blodfetter: { ...state.blodfetter, fritext: e.target.value } })}
            />
          </div>

          {/* Åtgärd */}
          <div className="row tight mb">
            <span className="lbl">Åtgärd:</span>
            <input
              className="inp"
              placeholder="fritext"
              value={state.atgardText}
              onChange={(e) => setState({ atgardText: e.target.value })}
            />
          </div>

          {/* Tom rad */}
          <div style={{ height: "1rem" }}></div>

          {/* Uppföljning */}
          <div className="row wrap tight mb">
            <span className="lbl">Plan:</span>
            <input
              className="inp"
              placeholder="fritext"
              value={state.planText}
              onChange={(e) => setState({ planText: e.target.value })}
            />
            <label className="chk">
              <input
                type="checkbox"
                checked={state.ingen}
                onChange={(e) => setState({ ingen: e.target.checked })}
              />{" "}
              Ingen planerad uppföljning
            </label>
          </div>

          {/* Åter till Läkare */}
          <div className="row wrap tight mb">
            <label className="chk">
              <input
                type="checkbox"
                checked={state.aterLakare.aktiv}
                onChange={(e) =>
                  setState({ aterLakare: { ...state.aterLakare, aktiv: e.target.checked } })
                }
              />{" "}
              Åter till läkare
            </label>
            {state.aterLakare.aktiv && (
              <>
                <input
                  className="inp w-20"
                  type="number"
                  min={0}
                  placeholder="tid"
                  value={state.aterLakare.tid}
                  onChange={(e) =>
                    setState({
                      aterLakare: {
                        ...state.aterLakare,
                        tid: e.target.value === "" ? "" : Number(e.target.value),
                      },
                    })
                  }
                />
                <select
                  className="inp"
                  value={state.aterLakare.enhet}
                  onChange={(e) =>
                    setState({ aterLakare: { ...state.aterLakare, enhet: e.target.value as TimeUnit } })
                  }
                >
                  <option value="dagar">dagar</option>
                  <option value="veckor">veckor</option>
                  <option value="månader">månader</option>
                  <option value="år">år</option>
                </select>
              </>
            )}
          </div>

          {/* Åter till Sjuksköterska */}
          <div className="row wrap tight mb">
            <label className="chk">
              <input
                type="checkbox"
                checked={state.aterSsk.aktiv}
                onChange={(e) =>
                  setState({ aterSsk: { ...state.aterSsk, aktiv: e.target.checked } })
                }
              />{" "}
              Åter till sjuksköterska
            </label>
            {state.aterSsk.aktiv && (
              <>
                <input
                  className="inp w-20"
                  type="number"
                  min={0}
                  placeholder="tid"
                  value={state.aterSsk.tid}
                  onChange={(e) =>
                    setState({
                      aterSsk: {
                        ...state.aterSsk,
                        tid: e.target.value === "" ? "" : Number(e.target.value),
                      },
                    })
                  }
                />
                <select
                  className="inp"
                  value={state.aterSsk.enhet}
                  onChange={(e) =>
                    setState({ aterSsk: { ...state.aterSsk, enhet: e.target.value as TimeUnit } })
                  }
                >
                  <option value="dagar">dagar</option>
                  <option value="veckor">veckor</option>
                  <option value="månader">månader</option>
                  <option value="år">år</option>
                </select>
              </>
            )}
          </div>

          {/* Åter till Labb */}
          <div className="row wrap tight mb">
            <label className="chk">
              <input
                type="checkbox"
                checked={state.aterLabb.aktiv}
                onChange={(e) =>
                  setState({ aterLabb: { ...state.aterLabb, aktiv: e.target.checked } })
                }
              />{" "}
              Åter till labb
            </label>
            {state.aterLabb.aktiv && (
              <>
                <input
                  className="inp w-20"
                  type="number"
                  min={0}
                  placeholder="tid"
                  value={state.aterLabb.tid}
                  onChange={(e) =>
                    setState({
                      aterLabb: {
                        ...state.aterLabb,
                        tid: e.target.value === "" ? "" : Number(e.target.value),
                      },
                    })
                  }
                />
                <select
                  className="inp"
                  value={state.aterLabb.enhet}
                  onChange={(e) =>
                    setState({ aterLabb: { ...state.aterLabb, enhet: e.target.value as TimeUnit } })
                  }
                >
                  <option value="dagar">dagar</option>
                  <option value="veckor">veckor</option>
                  <option value="månader">månader</option>
                  <option value="år">år</option>
                </select>
              </>
            )}
          </div>

          <label className="chk">
            <input
              type="checkbox"
              checked={state.prov}
              onChange={(e) => setState({ prov: e.target.checked })}
            />{" "}
            Återkoppling när provsvar föreligger
          </label>
        </div>
      </div>
    );
  },

  buildText: (s: BedUppfState) => {
    const blocks: string[] = [];

    // Bedöms som okomplicerad
    const okomp: string[] = [];
    if (s.okomplicerad.length > 0) {
      okomp.push(...s.okomplicerad.map((x) => x.toLowerCase()));
    }
    if (s.okomplicFritext.trim()) {
      okomp.push(s.okomplicFritext.trim());
    }
    if (okomp.length > 0) {
      const txt = okomp.join(", ").replace(/\.*$/, ".");
      blocks.push(`Bedöms som okomplicerad ${txt}`);
    }

    // Bedömning fritext
    if (s.bedText.trim()) {
      const t = s.bedText.trim().replace(/\.*$/, ".");
      blocks.push(`Bedömning: ${t}`);
    }

    // Inga tecken till allvarlig sjukdom
    if (s.ingaTeckenAllvarlig) {
      blocks.push("Inga tecken till allvarlig sjukdom.");
    }

    // Välreglerat - gruppera per status
    const inomMalvarden: string[] = [];
    const forhojda: string[] = [];
    const underkant: string[] = [];
    const fritext: string[] = [];

    if (s.blodtryck.status === "inom") inomMalvarden.push("blodtryck");
    if (s.blodtryck.status === "forhojt") forhojda.push("blodtryck");
    if (s.blodtryck.status === "underkant") underkant.push("blodtryck");
    if (s.blodtryck.fritext.trim()) fritext.push(`blodtryck ${s.blodtryck.fritext.trim()}`);

    if (s.blodsocker.status === "inom") inomMalvarden.push("blodsocker");
    if (s.blodsocker.status === "forhojt") forhojda.push("blodsocker");
    if (s.blodsocker.fritext.trim()) fritext.push(`blodsocker ${s.blodsocker.fritext.trim()}`);

    if (s.blodfetter.status === "inom") inomMalvarden.push("blodfetter");
    if (s.blodfetter.status === "forhojda") forhojda.push("blodfetter");
    if (s.blodfetter.fritext.trim()) fritext.push(`blodfetter ${s.blodfetter.fritext.trim()}`);

    const valregParts: string[] = [];
    if (inomMalvarden.length > 0) {
      const items = inomMalvarden.join(", ");
      valregParts.push(`${items.charAt(0).toUpperCase() + items.slice(1)} inom målvärden`);
    }
    if (forhojda.length > 0) {
      // Hantera grammatik: blodfetter är plural, resten singular
      const parts = forhojda.map((item) => {
        if (item === "blodfetter") return "blodfetter förhöjda";
        return `${item} förhöjt`;
      });
      valregParts.push(parts.join(", "));
    }
    if (underkant.length > 0) {
      valregParts.push(`${underkant.join(", ")} i underkant`);
    }
    if (fritext.length > 0) {
      valregParts.push(fritext.join(", "));
    }

    if (valregParts.length > 0) {
      blocks.push(valregParts.join(". ") + ".");
    }

    // Åtgärd
    if (s.atgardText.trim()) {
      const t = s.atgardText.trim().replace(/\.*$/, ".");
      blocks.push(`Åtgärd: ${t}`);
    }

    // Plan
    const plan: string[] = [];
    
    // Plan fritext först
    if (s.planText.trim()) {
      plan.push(s.planText.trim());
    }

    if (s.ingen) plan.push("Ingen planerad uppföljning.");

    // Konvertera alla åter-besök till dagar för sortering
    const convertToDays = (tid: number | "", enhet: TimeUnit): number => {
      if (tid === "") return Infinity;
      const multipliers = { dagar: 1, veckor: 7, månader: 30, år: 365 };
      return tid * multipliers[enhet];
    };

    // Funktion för att få rätt singular/plural form
    const getTimeUnit = (tid: number, enhet: TimeUnit): string => {
      if (tid === 1) {
        const singular = { dagar: "dag", veckor: "vecka", månader: "månad", år: "år" };
        return singular[enhet];
      }
      return enhet;
    };

    const aterVisits: Array<{ typ: string; tid: number | ""; enhet: TimeUnit; dagar: number }> = [];
    if (s.aterLakare.aktiv && s.aterLakare.tid !== "") {
      aterVisits.push({
        typ: "läkare",
        tid: s.aterLakare.tid,
        enhet: s.aterLakare.enhet,
        dagar: convertToDays(s.aterLakare.tid, s.aterLakare.enhet),
      });
    }
    if (s.aterSsk.aktiv && s.aterSsk.tid !== "") {
      aterVisits.push({
        typ: "sjuksköterska",
        tid: s.aterSsk.tid,
        enhet: s.aterSsk.enhet,
        dagar: convertToDays(s.aterSsk.tid, s.aterSsk.enhet),
      });
    }
    if (s.aterLabb.aktiv && s.aterLabb.tid !== "") {
      aterVisits.push({
        typ: "labb",
        tid: s.aterLabb.tid,
        enhet: s.aterLabb.enhet,
        dagar: convertToDays(s.aterLabb.tid, s.aterLabb.enhet),
      });
    }

    // Sortera kronologiskt
    aterVisits.sort((a, b) => a.dagar - b.dagar);

    // Lägg till i plan
    aterVisits.forEach((visit) => {
      const timeUnit = getTimeUnit(visit.tid as number, visit.enhet);
      plan.push(`Åter till ${visit.typ} om ${visit.tid} ${timeUnit}.`);
    });

    if (s.prov) plan.push("Återkoppling när provsvar föreligger.");
    if (plan.length) blocks.push(`Plan: ${plan.join(" ")}`);

    return blocks.join(" ");
  },
};

export default BedUppfModule;
