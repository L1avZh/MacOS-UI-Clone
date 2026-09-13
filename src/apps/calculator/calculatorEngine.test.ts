import { describe, expect, it } from "vitest";
import { calculatorReducer, initialCalculatorState, type CalculatorState } from "./calculatorEngine";

function run(actions: Parameters<typeof calculatorReducer>[1][]): CalculatorState {
  return actions.reduce(calculatorReducer, initialCalculatorState);
}

describe("calculatorReducer", () => {
  it("performs basic addition", () => {
    const state = run([
      { type: "digit", digit: "7" },
      { type: "operator", operator: "+" },
      { type: "digit", digit: "8" },
      { type: "equals" },
    ]);
    expect(state.display).toBe("15");
  });

  it("performs multiplication", () => {
    const state = run([
      { type: "digit", digit: "6" },
      { type: "operator", operator: "×" },
      { type: "digit", digit: "7" },
      { type: "equals" },
    ]);
    expect(state.display).toBe("42");
  });

  it("chains operators without pressing equals", () => {
    // 2 + 3 + 4 = 9
    const state = run([
      { type: "digit", digit: "2" },
      { type: "operator", operator: "+" },
      { type: "digit", digit: "3" },
      { type: "operator", operator: "+" },
      { type: "digit", digit: "4" },
      { type: "equals" },
    ]);
    expect(state.display).toBe("9");
  });

  it("handles decimals", () => {
    const state = run([
      { type: "digit", digit: "1" },
      { type: "decimal" },
      { type: "digit", digit: "5" },
      { type: "operator", operator: "+" },
      { type: "digit", digit: "2" },
      { type: "decimal" },
      { type: "digit", digit: "5" },
      { type: "equals" },
    ]);
    expect(state.display).toBe("4");
  });

  it("prevents multiple decimal points in one number", () => {
    const state = run([
      { type: "digit", digit: "1" },
      { type: "decimal" },
      { type: "digit", digit: "2" },
      { type: "decimal" },
      { type: "digit", digit: "3" },
    ]);
    expect(state.display).toBe("1.23");
  });

  it("divides by zero into an Error state without throwing", () => {
    const state = run([
      { type: "digit", digit: "5" },
      { type: "operator", operator: "÷" },
      { type: "digit", digit: "0" },
      { type: "equals" },
    ]);
    expect(state.display).toBe("Error");
  });

  it("recovers from an Error state on the next digit press", () => {
    const errored = run([
      { type: "digit", digit: "5" },
      { type: "operator", operator: "÷" },
      { type: "digit", digit: "0" },
      { type: "equals" },
    ]);
    const recovered = calculatorReducer(errored, { type: "digit", digit: "3" });
    expect(recovered.display).toBe("3");
  });

  it("clears to the initial state on AC", () => {
    const state = run([{ type: "digit", digit: "9" }, { type: "clear" }]);
    expect(state).toEqual(initialCalculatorState);
  });

  it("toggles sign", () => {
    const state = run([{ type: "digit", digit: "5" }, { type: "toggleSign" }]);
    expect(state.display).toBe("-5");
  });

  it("does not toggle sign on zero", () => {
    const state = run([{ type: "toggleSign" }]);
    expect(state.display).toBe("0");
  });

  it("computes percent", () => {
    const state = run([{ type: "digit", digit: "5" }, { type: "digit", digit: "0" }, { type: "percent" }]);
    expect(state.display).toBe("0.5");
  });

  it("backspaces one character at a time", () => {
    const state = run([
      { type: "digit", digit: "1" },
      { type: "digit", digit: "2" },
      { type: "digit", digit: "3" },
      { type: "backspace" },
    ]);
    expect(state.display).toBe("12");
  });

  it("backspacing to empty returns to zero", () => {
    const state = run([{ type: "digit", digit: "7" }, { type: "backspace" }]);
    expect(state.display).toBe("0");
  });

  it("starts a fresh number after equals when a digit is pressed", () => {
    const evaluated = run([
      { type: "digit", digit: "2" },
      { type: "operator", operator: "+" },
      { type: "digit", digit: "2" },
      { type: "equals" },
    ]);
    expect(evaluated.display).toBe("4");
    const next = calculatorReducer(evaluated, { type: "digit", digit: "9" });
    expect(next.display).toBe("9");
    expect(next.operator).toBeNull();
  });
});
