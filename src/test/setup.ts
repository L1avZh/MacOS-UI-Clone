import "@testing-library/jest-dom/vitest";

// jsdom's localStorage can come back undefined under newer Node runtimes
// (Node's own experimental webstorage implementation shadows it). Provide a
// minimal in-memory Storage polyfill so tests don't depend on that interaction.
if (typeof window.localStorage === "undefined" || window.localStorage === null) {
  class MemoryStorage implements Storage {
    private store = new Map<string, string>();
    get length(): number {
      return this.store.size;
    }
    clear(): void {
      this.store.clear();
    }
    getItem(key: string): string | null {
      return this.store.has(key) ? this.store.get(key)! : null;
    }
    key(index: number): string | null {
      return Array.from(this.store.keys())[index] ?? null;
    }
    removeItem(key: string): void {
      this.store.delete(key);
    }
    setItem(key: string, value: string): void {
      this.store.set(key, String(value));
    }
  }

  Object.defineProperty(window, "localStorage", {
    value: new MemoryStorage(),
    writable: true,
    configurable: true,
  });
}

if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
