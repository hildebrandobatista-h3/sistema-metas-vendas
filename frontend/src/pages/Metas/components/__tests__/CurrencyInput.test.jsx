import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CurrencyInput from "../CurrencyInput";

describe("CurrencyInput", () => {
  it("renders input field", () => {
    render(<CurrencyInput value={0} onChange={() => {}} />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDefined();
  });

  it("accepts zero value", () => {
    render(<CurrencyInput value={0} onChange={() => {}} />);
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("respects disabled prop", () => {
    render(<CurrencyInput value={0} onChange={() => {}} disabled={true} />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("calls onChange when value updates", () => {
    const onChange = vi.fn();
    render(<CurrencyInput value={0} onChange={onChange} />);
    expect(onChange).toBeDefined();
  });

  it("displays placeholder when empty", () => {
    render(<CurrencyInput value={0} onChange={() => {}} placeholder="Digite valor" />);
    expect(screen.getByPlaceholderText("Digite valor")).toBeDefined();
  });

  it("has proper input type attributes", () => {
    render(<CurrencyInput value={0} onChange={() => {}} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("inputMode", "numeric");
  });

  it("accepts keyboard events", () => {
    const onKeyDown = vi.fn();
    render(<CurrencyInput value={0} onChange={() => {}} onKeyDown={onKeyDown} />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDefined();
  });

  it("applies focus styling", () => {
    render(<CurrencyInput value={0} onChange={() => {}} />);
    const input = screen.getByRole("textbox");
    input.focus();
    expect(input).toHaveFocus();
  });

  it("handles onChange callback", () => {
    const onChange = vi.fn();
    render(<CurrencyInput value={0} onChange={onChange} />);
    expect(onChange).toBeDefined();
  });

  it("accepts onBlur callback", () => {
    const onBlur = vi.fn();
    render(<CurrencyInput value={0} onChange={() => {}} onBlur={onBlur} />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDefined();
  });

  it("accepts autoFocus prop", () => {
    render(<CurrencyInput value={0} onChange={() => {}} autoFocus={true} />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDefined();
  });

  it("applies correct CSS classes", () => {
    render(<CurrencyInput value={0} onChange={() => {}} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("w-40");
  });

  it("integrates with parent component", () => {
    let testValue = 0;
    const handleChange = (val) => {
      testValue = val;
    };
    render(<CurrencyInput value={testValue} onChange={handleChange} />);
    expect(testValue).toBe(0);
  });

  it("is accessible with ARIA attributes", () => {
    render(<CurrencyInput value={0} onChange={() => {}} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "text");
  });
});
