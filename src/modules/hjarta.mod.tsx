import type { ModuleDef, ModuleProps } from "../App";

type HeartState = {
  ua: boolean;
  freq: "" | "takykardi" | "bradykardi";
  irregular: boolean;
  extraslag: boolean;
  arytmiFree: string;
  systoliskt: boolean;
  systolisktPM: string[];
  diastoliskt: boolean;
  diastolisktPM: string[];
  freeText: string;
};

const PM_PLACES = ["apex", "I2 sin", "I2 dx", "I4 sin", "I5 sin", "hela prekordiet"] as const;

const HjartaModule: ModuleDef<HeartState> = {
  id: "hjarta",
  title: "Hjärta",
  order: 30,
  group: "status",
  initialState: { ua: false, freq: "", irregular: false, extraslag: false, arytmiFree: "", systoliskt: false, systolisktPM: [], diastoliskt: false, diastolisktPM: [], freeText: "" },

  Component: ({ state, setState, collapsed, toggle }: ModuleProps<HeartState>) => {
    const clearUA = () => state.ua && setState({ ua: false });
    const toggleSystolisktPM = (p: string) =>
      setState({ systolisktPM: state.systolisktPM.includes(p) ? state.systolisktPM.filter((x) => x !== p) : [...state.systolisktPM, p] });
    const toggleDiastolisktPM = (p: string) =>
      setState({ diastolisktPM: state.diastolisktPM.includes(p) ? state.diastolisktPM.filter((x) => x !== p) : [...state.diastolisktPM, p] });

    return (
      <div className={"panel " + (collapsed ? "collapsed" : "")}>
        <button className="panel-h collapsible" aria-expanded={!collapsed} onClick={toggle}>
          <span className="twisty">{collapsed ? "▶" : "▼"}</span>
          <span>Hjärta</span>
        </button>
        <div className="panel-b">
          <label className="chk">
            <input
              type="checkbox"
              checked={state.ua}
              onChange={(e) =>
                setState({
                  ua: e.target.checked,
                  freq: e.target.checked ? "" : state.freq,
                  arytmiFree: e.target.checked ? "" : state.arytmiFree,
                  irregular: e.target.checked ? false : state.irregular,
                  extraslag: e.target.checked ? false : state.extraslag,
                  systoliskt: e.target.checked ? false : state.systoliskt,
                  systolisktPM: e.target.checked ? [] : state.systolisktPM,
                  diastoliskt: e.target.checked ? false : state.diastoliskt,
                  diastolisktPM: e.target.checked ? [] : state.diastolisktPM,
                  freeText: e.target.checked ? "" : state.freeText,
                })
              }
            />{" "}
            UA
          </label>

          <div className="row tight mt">
            <span className="lbl">Frekvens:</span>
            <button
              className={"chip " + (state.freq === "takykardi" ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ freq: state.freq === "takykardi" ? "" : "takykardi" });
              }}
            >
              Takykardi
            </button>
            <button
              className={"chip " + (state.freq === "bradykardi" ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ freq: state.freq === "bradykardi" ? "" : "bradykardi" });
              }}
            >
              Bradykardi
            </button>
          </div>

          <div className="row tight mt">
            <span className="lbl">Arytmi:</span>
            <button
              className={"chip " + (state.irregular ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ irregular: !state.irregular });
              }}
            >
              Oregelbunden rytm
            </button>
            <button
              className={"chip " + (state.extraslag ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ extraslag: !state.extraslag });
              }}
            >
              Extraslag
            </button>
            <input
              className="inp"
              placeholder="fritext (t.ex. förmaksflimmer)"
              value={state.arytmiFree}
              onChange={(e) => {
                clearUA();
                setState({ arytmiFree: e.target.value });
              }}
            />
          </div>

          <div className="row tight mt">
            <span className="lbl">Blåsljud:</span>
          </div>

          <div className="row tight mt">
            <button
              className={"chip " + (state.systoliskt ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ systoliskt: !state.systoliskt, systolisktPM: [] });
              }}
            >
              Systoliskt
            </button>

            {state.systoliskt && (
              <>
                <span className="lbl">PM:</span>
                {PM_PLACES.map((p) => (
                  <button
                    key={p}
                    className={"chip " + (state.systolisktPM.includes(p) ? "active" : "")}
                    style={{
                      fontStyle: 'italic',
                      backgroundColor: state.systolisktPM.includes(p) ? '#007bff' : '#e3f2fd',
                      border: '1px dashed #2196f3',
                      fontSize: '0.9em'
                    }}
                    onClick={() => toggleSystolisktPM(p)}
                  >
                    {p}
                  </button>
                ))}
              </>
            )}
          </div>

          <div className="row tight mt">
            <button
              className={"chip " + (state.diastoliskt ? "active" : "")}
              onClick={() => {
                clearUA();
                setState({ diastoliskt: !state.diastoliskt, diastolisktPM: [] });
              }}
            >
              Diastoliskt
            </button>

            {state.diastoliskt && (
              <>
                <span className="lbl">PM:</span>
                {PM_PLACES.map((p) => (
                  <button
                    key={p}
                    className={"chip " + (state.diastolisktPM.includes(p) ? "active" : "")}
                    style={{
                      fontStyle: 'italic',
                      backgroundColor: state.diastolisktPM.includes(p) ? '#007bff' : '#e3f2fd',
                      border: '1px dashed #2196f3',
                      fontSize: '0.9em'
                    }}
                    onClick={() => toggleDiastolisktPM(p)}
                  >
                    {p}
                  </button>
                ))}
              </>
            )}
          </div>

          <div className="row tight mt">
            <input
              className="inp"
              placeholder="Fritext Hjärta"
              value={state.freeText}
              onChange={(e) => {
                clearUA();
                setState({ freeText: e.target.value });
              }}
            />
          </div>
        </div>
      </div>
    );
  },

  buildText: (s: HeartState) => {
    const anyDetail =
      s.freq !== "" || s.irregular || s.extraslag || s.arytmiFree.trim() !== "" || s.systoliskt || s.diastoliskt || s.freeText.trim() !== "";
    if (s.ua && !anyDetail) {
      return "Hjärta: Normofrekvent, regelbunden rytm, inga bi- eller blåsljud.";
    }
    if (!anyDetail) return "";

    const freq =
      s.freq === "takykardi" ? "Takykardi" : s.freq === "bradykardi" ? "Bradykardi" : "Normofrekvent";

    const rytmParts: string[] = [];
    if (s.irregular) rytmParts.push("oregelbunden rytm");
    if (s.extraslag) rytmParts.push("extraslag");
    if (s.arytmiFree.trim()) rytmParts.push(s.arytmiFree.trim());
    const rytm = rytmParts.length ? rytmParts.join(", ") : "regelbunden rytm";

    const murmurParts: string[] = [];
    if (s.systoliskt) {
      murmurParts.push(`systoliskt blåsljud${s.systolisktPM.length ? " med PM i " + s.systolisktPM.join(", ") : ""}`);
    }
    if (s.diastoliskt) {
      murmurParts.push(`diastoliskt blåsljud${s.diastolisktPM.length ? " med PM i " + s.diastolisktPM.join(", ") : ""}`);
    }
    const murmur = murmurParts.length ? murmurParts.join(", ") : "inga bi- eller blåsljud";

    const mainText = `Hjärta: ${freq}, ${rytm}, ${murmur}.`;
    
    if (s.freeText.trim()) {
      return `${mainText} ${s.freeText.trim().replace(/\.*$/, ".")}`;
    }

    return mainText;
  },
};

export default HjartaModule;
