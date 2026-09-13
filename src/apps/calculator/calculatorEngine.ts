export type Operator = "+" | "-" | "×" | "÷";

export interface CalculatorState {
  display: string;
  previousValue: number | null;
  operator: Operator | null;
  waitingForOperand: boolean;
  justEvaluated: boolean;
}

export type CalculatorAction =
  | { type: "digit"; digit: string }
  | { type: "decimal" }
  | { type: "operator"; operator: Operator }
  | { type: "equals" }
  | { type: "clear" }
  | { type: "toggleSign" }
  | { type: "percent" }
  | { type: "backspace" };

export const MAX_DIGITS = 15;

export const initialCalculatorState: CalculatorState = {
  display: "0",
  previousValue: null,
  operator: null,
  waitingForOperand: false,
  justEvaluated: false,
};

function applyOperator(a: number, b: number, operator: Operator): number {
  switch (operator) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      return b === 0 ? NaN : a / b;
  }
}

function formatResult(value: number): string {
  if (Number.isNaN(value) || !Number.isFinite(value)) return "Error";
  if (Math.abs(value) >= 1e15 || (Math.abs(value) < 1e-9 && value !== 0)) {
    return value.toExponential(6).replace(/e\+?/, "e");
  }
  const rounded = Math.round(value * 1e9) / 1e9;
  const str = rounded.toString();
  return str.length > MAX_DIGITS ? rounded.toPrecision(10).replace(/\.?0+$/, "") : str;
}

export function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case "digit": {
      if (state.display === "Error") {
        return { ...initialCalculatorState, display: action.digit };
      }
      if (state.waitingForOperand || state.justEvaluated) {
        return {
          ...state,
          display: action.digit,
          waitingForOperand: false,
          justEvaluated: false,
          previousValue: state.justEvaluated ? null : state.previousValue,
          operator: state.justEvaluated ? null : state.operator,
        };
      }
      if (state.display === "0") {
        return { ...state, display: action.digit };
      }
      if (state.display.replace("-", "").replace(".", "").length >= MAX_DIGITS) {
        return state;
      }
      return { ...state, display: state.display + action.digit };
    }

    case "decimal": {
      if (state.waitingForOperand || state.justEvaluated || state.display === "Error") {
        return { ...state, display: "0.", waitingForOperand: false, justEvaluated: false };
      }
      if (state.display.includes(".")) return state;
      return { ...state, display: state.display + "." };
    }

    case "backspace": {
      if (state.waitingForOperand || state.justEvaluated || state.display === "Error") return state;
      const next = state.display.length > 1 ? state.display.slice(0, -1) : "0";
      return { ...state, display: next === "-" ? "0" : next };
    }

    case "toggleSign": {
      if (state.display === "0" || state.display === "Error") return state;
      return { ...state, display: state.display.startsWith("-") ? state.display.slice(1) : `-${state.display}` };
    }

    case "percent": {
      if (state.display === "Error") return state;
      const value = parseFloat(state.display) / 100;
      return { ...state, display: formatResult(value) };
    }

    case "operator": {
      if (state.display === "Error") return state;
      const current = parseFloat(state.display);

      if (state.operator && !state.waitingForOperand) {
        const result = applyOperator(state.previousValue ?? 0, current, state.operator);
        return {
          display: formatResult(result),
          previousValue: result,
          operator: action.operator,
          waitingForOperand: true,
          justEvaluated: false,
        };
      }

      return {
        ...state,
        previousValue: current,
        operator: action.operator,
        waitingForOperand: true,
        justEvaluated: false,
      };
    }

    case "equals": {
      if (state.display === "Error" || state.operator === null || state.previousValue === null) return state;
      const current = parseFloat(state.display);
      const result = applyOperator(state.previousValue, current, state.operator);
      return {
        display: formatResult(result),
        previousValue: null,
        operator: null,
        waitingForOperand: false,
        justEvaluated: true,
      };
    }

    case "clear":
      return initialCalculatorState;

    default:
      return state;
  }
}
