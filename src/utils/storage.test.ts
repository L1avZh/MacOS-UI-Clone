import { beforeEach, describe, expect, it, vi } from "vitest";
import { readStorage, writeStorage, removeStorage } from "./storage";

beforeEach(() => {
  window.localStorage.clear();
});

describe("storage", () => {
  it("round-trips a value", () => {
    writeStorage("key", { a: 1 });
    expect(readStorage("key", null)).toEqual({ a: 1 });
  });

  it("returns the fallback when nothing is stored", () => {
    expect(readStorage("missing", "fallback")).toBe("fallback");
  });

  it("returns the fallback instead of throwing on corrupted JSON", () => {
    window.localStorage.setItem("bad", "{not valid json");
    expect(readStorage("bad", "fallback")).toBe("fallback");
  });

  it("removes a key", () => {
    writeStorage("key", "value");
    removeStorage("key");
    expect(readStorage("key", null)).toBeNull();
  });

  it("does not throw when localStorage.setItem throws (quota exceeded, private mode)", () => {
    const spy = vi.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });
    expect(() => writeStorage("key", "value")).not.toThrow();
    spy.mockRestore();
  });

  it("does not throw when localStorage.getItem throws", () => {
    const spy = vi.spyOn(window.localStorage.__proto__, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readStorage("key", "fallback")).toBe("fallback");
    spy.mockRestore();
  });
});
