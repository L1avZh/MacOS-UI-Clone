import { useState } from "react";
import { createId } from "@/utils/id";
import "./safari.css";

interface Tab {
  id: string;
  history: string[];
  historyIndex: number;
}

const BOOKMARKS = ["Start Page", "Weather", "News", "Maps", "Sports"];

function isUrlLike(value: string): boolean {
  return /^[\w-]+(\.[\w-]+)+/.test(value.trim());
}

function titleFor(entry: string): string {
  if (entry === "Start Page") return "Start Page";
  return entry;
}

function newTab(): Tab {
  return { id: createId("tab"), history: ["Start Page"], historyIndex: 0 };
}

export default function Safari() {
  const [tabs, setTabs] = useState<Tab[]>(() => [newTab()]);
  const [activeTabId, setActiveTabId] = useState(() => tabs[0]!.id);
  const [addressInput, setAddressInput] = useState("");

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0]!;
  const currentEntry = activeTab.history[activeTab.historyIndex] ?? "Start Page";

  function updateTab(id: string, updater: (tab: Tab) => Tab) {
    setTabs((prev) => prev.map((t) => (t.id === id ? updater(t) : t)));
  }

  function navigate(entry: string) {
    const trimmed = entry.trim();
    if (!trimmed) return;
    updateTab(activeTab.id, (tab) => {
      const history = [...tab.history.slice(0, tab.historyIndex + 1), trimmed];
      return { ...tab, history, historyIndex: history.length - 1 };
    });
    setAddressInput("");
  }

  function goBack() {
    updateTab(activeTab.id, (tab) => ({ ...tab, historyIndex: Math.max(0, tab.historyIndex - 1) }));
  }
  function goForward() {
    updateTab(activeTab.id, (tab) => ({ ...tab, historyIndex: Math.min(tab.history.length - 1, tab.historyIndex + 1) }));
  }

  function openTab() {
    const tab = newTab();
    setTabs((prev) => [...prev, tab]);
    setActiveTabId(tab.id);
  }

  function closeTab(id: string) {
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (next.length === 0) {
        const fresh = newTab();
        setActiveTabId(fresh.id);
        return [fresh];
      }
      if (id === activeTabId) setActiveTabId(next[0]!.id);
      return next;
    });
  }

  return (
    <div className="safari-app">
      <div className="safari-tabbar">
        {tabs.map((tab) => {
          const label = titleFor(tab.history[tab.historyIndex] ?? "New Tab");
          return (
            <div key={tab.id} className={`safari-tab ${tab.id === activeTabId ? "active" : ""}`}>
              <button type="button" className="safari-tab-select" onClick={() => setActiveTabId(tab.id)}>
                {label}
              </button>
              {tabs.length > 1 && (
                <button
                  type="button"
                  aria-label={`Close tab ${label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
        <button type="button" className="safari-new-tab" onClick={openTab} aria-label="New tab">
          +
        </button>
      </div>

      <div className="safari-toolbar">
        <button type="button" onClick={goBack} disabled={activeTab.historyIndex === 0} aria-label="Back">
          ‹
        </button>
        <button type="button" onClick={goForward} disabled={activeTab.historyIndex === activeTab.history.length - 1} aria-label="Forward">
          ›
        </button>
        <form
          className="safari-address-bar"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(addressInput);
          }}
        >
          <span className="safari-lock" aria-hidden="true">
            🔒
          </span>
          <input
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder={currentEntry}
            aria-label="Address and search"
          />
        </form>
      </div>

      <div className="safari-bookmarks">
        {BOOKMARKS.map((b) => (
          <button key={b} type="button" onClick={() => navigate(b)}>
            {b}
          </button>
        ))}
      </div>

      <div className="safari-content">
        {currentEntry === "Start Page" ? (
          <div className="safari-start">
            <h1>Start Page</h1>
            <div className="safari-favorites">
              {BOOKMARKS.slice(1).map((b) => (
                <button key={b} type="button" onClick={() => navigate(b)}>
                  <span className="safari-favicon" aria-hidden="true">
                    {b[0]}
                  </span>
                  {b}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="safari-page">
            <h1>{isUrlLike(currentEntry) ? currentEntry : `Results for "${currentEntry}"`}</h1>
            <p>
              This Safari window is a self-contained simulation: it never leaves this browser tab or loads real
              websites. Everything you see here — pages, results, history — is generated locally.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
