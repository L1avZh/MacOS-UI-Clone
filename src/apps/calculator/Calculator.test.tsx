import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Calculator from "./Calculator";

describe("Calculator", () => {
  it("computes 6 x 7 via button clicks", async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    await user.click(screen.getByRole("button", { name: "6" }));
    await user.click(screen.getByRole("button", { name: "×" }));
    await user.click(screen.getByRole("button", { name: "7" }));
    await user.click(screen.getByRole("button", { name: "=" }));

    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("supports keyboard input", async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    await user.keyboard("9+1{Enter}");

    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("AC resets the display to 0", async () => {
    const user = userEvent.setup();
    const { container } = render(<Calculator />);
    const display = () => container.querySelector(".calculator-display");

    await user.click(screen.getByRole("button", { name: "5" }));
    expect(display()).toHaveTextContent("5");

    await user.click(screen.getByRole("button", { name: "AC" }));
    expect(display()).toHaveTextContent("0");
  });
});
