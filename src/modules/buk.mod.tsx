// src/modules/buk.mod.tsx
import type { ModuleDef, ModuleProps } from "../App";

type PalpationPlace = 
  | "höger fossa"
  | "vänster fossa" 
  | "epigastriet"
  | "suprapubiskt"
  | "höger arcus"
  | "vänster arcus";

const ALL_PALPATION_PLACES: PalpationPlace[] = [
  "höger fossa",
  "vänster fossa",
  "epigastriet", 
  "suprapubiskt",
  "höger arcus",
  "vänster arcus"
];

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

type AbdState = {
  ua: boolean;
  
  // Inspektion
  uppblast: boolean;
  adipos: boolean;
  magerlagd: boolean;
  arr: boolean;
  arrLokal: string;
  inspektionFree: string;
  
  // Auskultation
  ingaTarmljud: boolean;
  okadeTarmljud: boolean;
  metalliskaTarmljud: boolean;
  auskultationFree: string;
  
  // Perkussion
  perkussionUA: boolean;
  tympanistisk: boolean;
  tympanistiskFree: string;
  dampad: boolean;
  dampadFree: string;
  
  // Palpation
  muskelforsvar: boolean;
  muskelforsvarLokal: string;
  omhet: boolean;
  omhetLokal: string;
  omhetPlaces: string[];
  smarta: boolean;
  smartaLokal: string;
  smartaPlaces: string[];
  organforstoring: boolean;
  organforstoringText: string;
  palpationFree: string;
  
  // Bråckportar
  brackportarUA: boolean;
  brackportarStaende: boolean;
  
  // Fritext bukstatus
  freetextBukstatus: string;
};

const BukModule: ModuleDef<AbdState> = {
  id: "buk",
  title: "Buk",
  order: 50,
  group: "status",
  initialState: {
    ua: false,
    
    // Inspektion
    uppblast: false,
    adipos: false,
    magerlagd: false,
    arr: false,
    arrLokal: "",
    inspektionFree: "",
    
    // Auskultation
    ingaTarmljud: false,
    okadeTarmljud: false,
    metalliskaTarmljud: false,
    auskultationFree: "",
    
    // Perkussion
    perkussionUA: false,
    tympanistisk: false,
    tympanistiskFree: "",
    dampad: false,
    dampadFree: "",
    
    // Palpation
    muskelforsvar: false,
    muskelforsvarLokal: "",
    omhet: false,
    omhetLokal: "",
    omhetPlaces: [],
    smarta: false,
    smartaLokal: "",
    smartaPlaces: [],
    organforstoring: false,
    organforstoringText: "",
    palpationFree: "",
    
    // Bråckportar
    brackportarUA: false,
    brackportarStaende: false,
    
    // Fritext bukstatus
    freetextBukstatus: "",
  },

  Component: ({ state, setState, collapsed, toggle: tg }: ModuleProps<AbdState>) => {
    const clearUA = () => state.ua && setState({ ua: false });
    const clearPerkussionUA = () => state.perkussionUA && setState({ perkussionUA: false });

    return (
      <div className={"panel " + (collapsed ? "collapsed" : "")}>
        <button className="panel-h collapsible" aria-expanded={!collapsed} onClick={tg}>
          <span className="twisty">{collapsed ? "▶" : "▼"}</span>
          <span>Buk</span>
        </button>
        <div className="panel-b">
            <label className="chk">
              <input
                type="checkbox"
                checked={state.ua}
                onChange={(e) =>
                  setState({
                    ua: e.target.checked,
                  uppblast: e.target.checked ? false : state.uppblast,
                  adipos: e.target.checked ? false : state.adipos,
                  magerlagd: e.target.checked ? false : state.magerlagd,
                  arr: e.target.checked ? false : state.arr,
                  arrLokal: e.target.checked ? "" : state.arrLokal,
                  inspektionFree: e.target.checked ? "" : state.inspektionFree,
                  ingaTarmljud: e.target.checked ? false : state.ingaTarmljud,
                  okadeTarmljud: e.target.checked ? false : state.okadeTarmljud,
                  metalliskaTarmljud: e.target.checked ? false : state.metalliskaTarmljud,
                  auskultationFree: e.target.checked ? "" : state.auskultationFree,
                  perkussionUA: e.target.checked ? false : state.perkussionUA,
                  tympanistisk: e.target.checked ? false : state.tympanistisk,
                  tympanistiskFree: e.target.checked ? "" : state.tympanistiskFree,
                  dampad: e.target.checked ? false : state.dampad,
                  dampadFree: e.target.checked ? "" : state.dampadFree,
                  muskelforsvar: e.target.checked ? false : state.muskelforsvar,
                  muskelforsvarLokal: e.target.checked ? "" : state.muskelforsvarLokal,
                  omhet: e.target.checked ? false : state.omhet,
                  omhetLokal: e.target.checked ? "" : state.omhetLokal,
                  omhetPlaces: e.target.checked ? [] : state.omhetPlaces,
                  smarta: e.target.checked ? false : state.smarta,
                  smartaLokal: e.target.checked ? "" : state.smartaLokal,
                  smartaPlaces: e.target.checked ? [] : state.smartaPlaces,
                  organforstoring: e.target.checked ? false : state.organforstoring,
                  organforstoringText: e.target.checked ? "" : state.organforstoringText,
                  palpationFree: e.target.checked ? "" : state.palpationFree,
                  brackportarUA: e.target.checked ? false : state.brackportarUA,
                  brackportarStaende: e.target.checked ? false : state.brackportarStaende,
                  freetextBukstatus: e.target.checked ? "" : state.freetextBukstatus,
                  })
                }
              />{" "}
              UA
            </label>

          <div className="row tight mt">
            <span className="lbl">Inspektion:</span>
            <button
              className={"chip " + (state.uppblast ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ uppblast: !state.uppblast });
              }}
            >
              Uppblåst
            </button>
            <button
              className={"chip " + (state.adipos ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ adipos: !state.adipos });
              }}
            >
              Adipös
            </button>
            <button
              className={"chip " + (state.magerlagd ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ magerlagd: !state.magerlagd });
              }}
            >
              Magerlagd
            </button>
            <button
              className={"chip " + (state.arr ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ arr: !state.arr, arrLokal: "" });
              }}
            >
              Ärr
            </button>
            {state.arr && (
              <input
                className="inp"
                placeholder="Lokalisation (ärr)"
                value={state.arrLokal}
                onChange={(e) => setState({ arrLokal: e.target.value })}
              />
            )}
            <input
              className="inp"
              placeholder="Fritext (inspektion)"
              value={state.inspektionFree}
                onChange={(e) => {
                  clearUA();
                setState({ inspektionFree: e.target.value });
              }}
            />
          </div>

          <div className="row tight mt">
            <span className="lbl">Auskultation:</span>
            <button
              className={"chip " + (state.ingaTarmljud ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ ingaTarmljud: !state.ingaTarmljud });
              }}
            >
              Tyst buk
            </button>
            <button
              className={"chip " + (state.okadeTarmljud ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ okadeTarmljud: !state.okadeTarmljud });
              }}
            >
              Ökade tarmljud
            </button>
            <button
              className={"chip " + (state.metalliskaTarmljud ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ metalliskaTarmljud: !state.metalliskaTarmljud });
              }}
            >
              Metalliska tarmljud
            </button>
            <input
              className="inp"
              placeholder="Lokalisation/Fritext"
              value={state.auskultationFree}
              onChange={(e) => {
                clearUA();
                setState({ auskultationFree: e.target.value });
              }}
            />
          </div>

          <div className="row tight mt">
            <span className="lbl">Perkussion:</span>
            <label className="chk">
              <input
                type="checkbox"
                checked={state.perkussionUA}
                onChange={(e) => {
                  clearUA();
                  setState({
                    perkussionUA: e.target.checked,
                    tympanistisk: e.target.checked ? false : state.tympanistisk,
                    tympanistiskFree: e.target.checked ? "" : state.tympanistiskFree,
                    dampad: e.target.checked ? false : state.dampad,
                    dampadFree: e.target.checked ? "" : state.dampadFree,
                  });
                }}
              />{" "}
              UA
            </label>
            <button
              className={"chip " + (state.tympanistisk ? "active" : "")}
              onClick={() => {
                clearUA();
                clearPerkussionUA();
                setState({ tympanistisk: !state.tympanistisk, tympanistiskFree: "" });
              }}
            >
              Tympanistisk ton
            </button>
            {state.tympanistisk && (
              <input
                className="inp"
                placeholder="Lokalisation (tympanistisk ton)"
                value={state.tympanistiskFree}
                onChange={(e) => setState({ tympanistiskFree: e.target.value })}
              />
            )}
            <button
              className={"chip " + (state.dampad ? "active" : "")}
              onClick={() => {
                clearUA();
                clearPerkussionUA();
                setState({ dampad: !state.dampad, dampadFree: "" });
              }}
            >
              Dämpad ton
            </button>
            {state.dampad && (
              <input
                className="inp"
                placeholder="Lokalisation (dämpad ton)"
                value={state.dampadFree}
                onChange={(e) => setState({ dampadFree: e.target.value })}
              />
            )}
          </div>

          <div className="row tight mt">
            <span className="lbl">Palpation:</span>
          </div>

          <div className="row tight mt">
            <button
              className={"chip " + (state.muskelforsvar ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ muskelforsvar: !state.muskelforsvar, muskelforsvarLokal: "" });
              }}
            >
              Muskelförsvar
            </button>
            {state.muskelforsvar && (
              <input
                className="inp"
                placeholder="Lokalisation (muskelförsvar)"
                value={state.muskelforsvarLokal}
                onChange={(e) => setState({ muskelforsvarLokal: e.target.value })}
              />
            )}
          </div>

          <div className="row tight mt">
            <button
              className={"chip " + (state.omhet ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ omhet: !state.omhet, omhetPlaces: [], omhetLokal: "" });
              }}
            >
              Ömhet
            </button>

            {state.omhet && (
              <>
                <span className="lbl">Ömhet:</span>
                {ALL_PALPATION_PLACES.map((p) => (
                  <button
                    key={p}
                    className={"chip " + (state.omhetPlaces.includes(p) ? "active" : "")}
                    style={{
                      fontStyle: 'italic',
                      backgroundColor: state.omhetPlaces.includes(p) ? '#007bff' : '#e3f2fd',
                      border: '1px dashed #2196f3',
                      fontSize: '0.9em'
                    }}
                    onClick={() => setState({ omhetPlaces: toggle(state.omhetPlaces, p) })}
                  >
                    {p}
                  </button>
                ))}
                <input
                  className="inp"
                  placeholder="Lokalisation (Ömhet)"
                  value={state.omhetLokal}
                  onChange={(e) => setState({ omhetLokal: e.target.value })}
                />
              </>
            )}
          </div>

          <div className="row tight mt">
            <button
              className={"chip " + (state.smarta ? "active" : "")}
              onClick={() => {
                  clearUA();
                setState({ smarta: !state.smarta, smartaPlaces: [], smartaLokal: "" });
              }}
            >
              Smärta
            </button>

            {state.smarta && (
              <>
                <span className="lbl">Smärta:</span>
                {ALL_PALPATION_PLACES.map((p) => (
                  <button
                    key={p}
                    className={"chip " + (state.smartaPlaces.includes(p) ? "active" : "")}
                    style={{
                      fontStyle: 'italic',
                      backgroundColor: state.smartaPlaces.includes(p) ? '#007bff' : '#e3f2fd',
                      border: '1px dashed #2196f3',
                      fontSize: '0.9em'
                    }}
                    onClick={() => setState({ smartaPlaces: toggle(state.smartaPlaces, p) })}
                  >
                    {p}
                  </button>
                ))}
                <input
                  className="inp"
                  placeholder="Lokalisation (Smärta)"
                  value={state.smartaLokal}
                  onChange={(e) => setState({ smartaLokal: e.target.value })}
                />
              </>
            )}
          </div>

          <div className="row tight mt">
            <button
              className={"chip " + (state.organforstoring ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ organforstoring: !state.organforstoring, organforstoringText: "" });
              }}
            >
              Organförstoring
            </button>
            {state.organforstoring && (
              <input
                className="inp"
                placeholder="Vilket organ"
                value={state.organforstoringText}
                onChange={(e) => setState({ organforstoringText: e.target.value })}
              />
            )}
          </div>

          <div className="row tight mt">
            <input
              className="inp"
              placeholder="Fritext (palpation)"
              value={state.palpationFree}
              onChange={(e) => {
                clearUA();
                setState({ palpationFree: e.target.value });
              }}
            />
          </div>

          <div className="row tight mt">
            <span className="lbl">Bråckportar:</span>
            <label className="chk">
              <input
                type="checkbox"
                checked={state.brackportarUA}
                onChange={(e) => {
                  clearUA();
                  setState({
                    brackportarUA: e.target.checked,
                    brackportarStaende: e.target.checked ? false : state.brackportarStaende,
                  });
                }}
              />{" "}
              UA
            </label>
            {state.brackportarUA && (
              <label className="chk">
                <input
                  type="checkbox"
                  checked={state.brackportarStaende}
                  onChange={(e) => setState({ brackportarStaende: e.target.checked })}
                />{" "}
                Stående och liggande?
              </label>
            )}
          </div>

          <div className="row tight mt">
            <input
              className="inp"
              placeholder="Fritext bukstatus"
              value={state.freetextBukstatus}
              onChange={(e) => {
                clearUA();
                setState({ freetextBukstatus: e.target.value });
              }}
            />
          </div>
        </div>
      </div>
    );
  },

  buildText: (s: AbdState) => {
    const anyAbn =
      s.uppblast ||
      s.adipos ||
      s.magerlagd ||
      s.arr ||
      !!s.arrLokal.trim() ||
      !!s.inspektionFree.trim() ||
      s.ingaTarmljud ||
      s.okadeTarmljud ||
      s.metalliskaTarmljud ||
      !!s.auskultationFree.trim() ||
      s.perkussionUA ||
      s.tympanistisk ||
      !!s.tympanistiskFree.trim() ||
      s.dampad ||
      !!s.dampadFree.trim() ||
      s.muskelforsvar ||
      !!s.muskelforsvarLokal.trim() ||
      s.omhet ||
      s.omhetPlaces.length > 0 ||
      !!s.omhetLokal.trim() ||
      s.smarta ||
      s.smartaPlaces.length > 0 ||
      !!s.smartaLokal.trim() ||
      s.organforstoring ||
      !!s.organforstoringText.trim() ||
      !!s.palpationFree.trim() ||
      s.brackportarUA ||
      !!s.freetextBukstatus.trim();

    if (s.ua && !anyAbn) {
      return "Buk: Inspekteras sammanfallen, auskulteras med normala tarmljud, palperas mjuk och oöm.";
    }
    if (!anyAbn) return "";

    const parts: string[] = [];

    // Inspektion
    const inspektionParts: string[] = [];
    if (s.uppblast) inspektionParts.push("uppblåst");
    if (s.adipos) inspektionParts.push("adipös");
    if (s.magerlagd) inspektionParts.push("magerlagd");
    if (s.arr) {
      const arrText = s.arrLokal.trim() ? `ärr ${s.arrLokal.trim()}` : "ärr";
      inspektionParts.push(arrText);
    }
    if (s.inspektionFree.trim()) inspektionParts.push(s.inspektionFree.trim());
    
    if (inspektionParts.length) {
      parts.push(`Inspekteras ${inspektionParts.join(", ")}.`);
    } else {
      parts.push("Inspekteras sammanfallen.");
    }

    // Auskultation
    const auskultationParts: string[] = [];
    if (s.ingaTarmljud) auskultationParts.push("tyst buk");
    if (s.okadeTarmljud) auskultationParts.push("ökade tarmljud");
    if (s.metalliskaTarmljud) auskultationParts.push("metalliska tarmljud");
    if (s.auskultationFree.trim()) auskultationParts.push(s.auskultationFree.trim());
    
    if (auskultationParts.length) {
      parts.push(`Auskulteras med ${auskultationParts.join(", ")}.`);
    } else {
      parts.push("Auskulteras med normala tarmljud.");
    }

    // Perkussion
    if (s.perkussionUA && !s.tympanistisk && !s.dampad) {
      parts.push("Perkuteras med normal perkussionston.");
    } else {
      const perkussionParts: string[] = [];
      if (s.tympanistisk) {
        const tympanText = s.tympanistiskFree.trim() ? `tympanistisk ton ${s.tympanistiskFree.trim()}` : "tympanistisk ton";
        perkussionParts.push(tympanText);
      }
      if (s.dampad) {
        const dampadText = s.dampadFree.trim() ? `dämpad ton ${s.dampadFree.trim()}` : "dämpad ton";
        perkussionParts.push(dampadText);
      }
      
      if (perkussionParts.length) {
        parts.push(`Perkuteras med ${perkussionParts.join(", ")}.`);
      }
    }

    // Palpation
    const palpationParts: string[] = [];
    if (s.muskelforsvar) {
      const muskelforsvarText = s.muskelforsvarLokal.trim() ? `muskelförsvar ${s.muskelforsvarLokal.trim()}` : "muskelförsvar";
      palpationParts.push(muskelforsvarText);
    }
    if (s.omhet) {
      const omhetPlaces: string[] = [];
      if (s.omhetPlaces.length > 0) omhetPlaces.push(s.omhetPlaces.join(", "));
      if (s.omhetLokal.trim()) omhetPlaces.push(s.omhetLokal.trim());
      const omhetText = omhetPlaces.length > 0 ? `ömhet ${omhetPlaces.join(", ")}` : "ömhet";
      palpationParts.push(omhetText);
    }
    if (s.smarta) {
      const smartaPlaces: string[] = [];
      if (s.smartaPlaces.length > 0) smartaPlaces.push(s.smartaPlaces.join(", "));
      if (s.smartaLokal.trim()) smartaPlaces.push(s.smartaLokal.trim());
      const smartaText = smartaPlaces.length > 0 ? `smärta ${smartaPlaces.join(", ")}` : "smärta";
      palpationParts.push(smartaText);
    }
    if (s.organforstoring && s.organforstoringText.trim()) {
      palpationParts.push(`organförstoring ${s.organforstoringText.trim()}`);
    }
    if (s.palpationFree.trim()) palpationParts.push(s.palpationFree.trim());
    
    if (palpationParts.length) {
      parts.push(`Palperas med ${palpationParts.join(", ")}.`);
    } else {
      parts.push("Palperas mjuk och oöm.");
    }

    // Bråckportar
    if (s.brackportarUA) {
      if (s.brackportarStaende) {
        parts.push("Bråckportar palperas i stående och liggande utan anmärkning.");
      } else {
        parts.push("Bråckportar palperas utan anmärkning.");
      }
    }

    // Fritext bukstatus
    if (s.freetextBukstatus.trim()) {
      parts.push(s.freetextBukstatus.trim().replace(/\.*$/, "."));
    }

    return "Buk: " + parts.join(" ");
  },
};

export default BukModule;
