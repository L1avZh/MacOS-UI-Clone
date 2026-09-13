import { useCallback, useEffect, useReducer } from "react";
import { calculatorReducer, initialCalculatorState, type Operator } from "./calculatorEngine";
import "./calculator.css";

interface ButtonSpec {
  label: string;
  kind: "digit" | "op" | "function" | "equals";
  span?: boolean;
}

const ROWS: ButtonSpec[][] = [
  [
    { label: "AC", kind: "function" },
    { label: "+/-", kind: "function" },
    { label: "%", kind: "function" },
    { label: "÷", kind: "op" },
  ],
  [
    { label: "7", kind: "digit" },
    { label: "8", kind: "digit" },
    { label: "9", kind: "digit" },
    { label: "×", kind: "op" },
  ],
  [
    { label: "4", kind: "digit" },
    { label: "5", kind: "digit" },
    { label: "6", kind: "digit" },
    { label: "-", kind: "op" },
  ],
  [
    { label: "1", kind: "digit" },
    { label: "2", kind: "digit" },
    { label: "3", kind: "digit" },
    { label: "+", kind: "op" },
  ],
  [
    { label: "0", kind: "digit", span: true },
    { label: ".", kind: "digit" },
    { label: "=", kind: "equals" },
  ],
];

export default function Calculator() {
  const [state, dispatch] = useReducer(calculatorReducer, initialCalculatorState);

  const press = useCallback(
    (spec: ButtonSpec) => {
      if (spec.kind === "digit") {
        if (spec.label === ".") dispatch({ type: "decimal" });
        else dispatch({ type: "digit", digit: spec.label });
      } else if (spec.kind === "op") {
        dispatch({ type: "operator", operator: spec.label as Operator });
      } else if (spec.kind === "equals") {
        dispatch({ type: "equals" });
      } else if (spec.label === "AC") {
        dispatch({ type: "clear" });
      } else if (spec.label === "+/-") {
        dispatch({ type: "toggleSign" });
      } else if (spec.label === "%") {
        dispatch({ type: "percent" });
      }
    },
    []
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (/^[0-9]$/.test(e.key)) dispatch({ type: "digit", digit: e.key });
      else if (e.key === ".") dispatch({ type: "decimal" });
      else if (e.key === "+") dispatch({ type: "operator", operator: "+" });
      else if (e.key === "-") dispatch({ type: "operator", operator: "-" });
      else if (e.key === "*") dispatch({ type: "operator", operator: "×" });
      else if (e.key === "/") {
        e.preventDefault();
        dispatch({ type: "operator", operator: "÷" });
      } else if (e.key === "Enter" || e.key === "=") dispatch({ type: "equals" });
      else if (e.key === "Backspace") dispatch({ type: "backspace" });
      else if (e.key === "Escape") dispatch({ type: "clear" });
      else if (e.key === "%") dispatch({ type: "percent" });
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const displayFontSize = state.display.length > 9 ? "28px" : state.display.length > 6 ? "36px" : "48px";

  return (
    <div className="calculator">
      <div className="calculator-display" style={{ fontSize: displayFontSize }} aria-live="polite">
        {state.display}
      </div>
      <div className="calculator-grid">
        {ROWS.flat().map((spec) => (
          <button
            key={spec.label}
            type="button"
            className={`calc-btn calc-${spec.kind}${spec.span ? " calc-span" : ""}`}
            onClick={() => press(spec)}
            aria-label={spec.label}
          >
            {spec.label}
          </button>
        ))}
      </div>
    </div>
  );
}
