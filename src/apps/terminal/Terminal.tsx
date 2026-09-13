import { useEffect, useRef, useState } from "react";
import { runCommand, pathString } from "./commands";
import { useSettingsStore } from "@/state/settingsStore";
import "./terminal.css";

interface Line {
  id: number;
  kind: "input" | "output";
  text: string;
  prompt?: string;
}

let lineCounter = 0;
function nextId() {
  return ++lineCounter;
}

export default function Terminal() {
  const userName = useSettingsStore((s) => s.userName);
  const [cwd, setCwd] = useState<string[]>([]);
  const [lines, setLines] = useState<Line[]>([
    { id: nextId(), kind: "output", text: `Last login: ${new Date().toDateString()} on ttys000` },
    { id: nextId(), kind: "output", text: 'Type "help" to see what this sandboxed terminal can do.' },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  function focusInput() {
    inputRef.current?.focus();
  }

  function submit(raw: string) {
    const prompt = `${userName.toLowerCase().replace(/\s+/g, "")}@macos-ui-clone ${pathString(cwd)} %`;
    const inputLine: Line = { id: nextId(), kind: "input", text: raw, prompt };

    const result = runCommand(raw, { cwd, userName });

    if (result.clear) {
      setLines([]);
    } else {
      const outputLines: Line[] = result.output.map((text) => ({ id: nextId(), kind: "output", text }));
      setLines((prev) => [...prev, inputLine, ...outputLines]);
    }
    if (result.cwd) setCwd(result.cwd);
    if (raw.trim()) setHistory((prev) => [...prev, raw]);
    setHistoryIndex(null);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      submit(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === null) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(null);
        setInput("");
      } else {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex] ?? "");
      }
    }
  }

  const promptLabel = `${userName.toLowerCase().replace(/\s+/g, "")}@macos-ui-clone ${pathString(cwd)} %`;

  return (
    // Clicking anywhere in the scrollback focuses the real input below it —
    // a convenience for pointer users; the input itself is the actual
    // interactive, keyboard-reachable element.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div className="terminal-app" onClick={focusInput}>
      <div className="terminal-scroll" ref={scrollRef} role="log" aria-live="polite">
        {lines.map((line) =>
          line.kind === "input" ? (
            <div key={line.id} className="terminal-line">
              <span className="terminal-prompt">{line.prompt}</span> <span>{line.text}</span>
            </div>
          ) : (
            <div key={line.id} className="terminal-line terminal-output">
              {line.text || " "}
            </div>
          )
        )}
        <div className="terminal-line terminal-input-row">
          <span className="terminal-prompt">{promptLabel}</span>
          <input
            ref={inputRef}
            className="terminal-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Terminal command input"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
