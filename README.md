# macOS UI Clone

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://l1avzh.github.io/MacOS-UI-Clone/)

A macOS-inspired desktop experience for the web — draggable windows, a magnifying dock, a real menu bar, Spotlight search, Notification Center, and a handful of genuinely interactive simulated apps, all running client-side in your browser.

**[Try the live demo →](https://l1avzh.github.io/MacOS-UI-Clone/)** — nothing to install, no account, any password unlocks it.

This is an independent, open-source project inspired by Apple's macOS interface design. It is **not** affiliated with, endorsed by, or sponsored by Apple Inc. "macOS" is a trademark of Apple Inc. Every icon and asset here is original artwork, not a reproduction of Apple's.

## Features

- **Window manager** — open, focus, drag, resize, minimize, maximize/restore, and close windows, with correct z-ordering and on-screen boundary clamping.
- **Dock** — click-to-launch, running-app indicators, hover magnification, launch bounce, auto-hide, and position/size settings.
- **Menu bar** — a real Apple menu, a context-aware app menu, File/View/Window/Help with working actions (including a live Window list), Wi-Fi/Bluetooth/battery status, and a live clock.
- **Control Center & Notification Center** — Wi-Fi/Bluetooth/Focus toggles, brightness and volume sliders, and a real notification feed with toasts.
- **Spotlight** (click the menu-bar search icon, or try `Cmd/Ctrl+Space`) — searches apps and files with keyboard navigation.
- **Launchpad** — a searchable app grid.
- **Desktop** — a draggable icon grid with selection, a working right-click menu (New Folder, Get Info, Change Wallpaper, Sort By), and persisted icon positions.
- **Lock screen** — a live clock and an unlock flow (this is a demo: any password works, and nothing is a real account).
- **Apps**: Finder (with a real simulated filesystem, breadcrumbs, grid/list views, search, and a text preview pane), Safari (tabs, address bar, history — fully sandboxed, never loads real websites), Terminal (a sandboxed shell with `help`, `ls`, `cd`, `cat`, `pwd`, `echo`, `whoami`, `date`, `uname`, `neofetch`, and command history), Notes (create/edit/delete, autosaved), Calculator (a fully functional four-function calculator with keyboard support), System Settings (theme, accent color, wallpaper, dock, accessibility, general), and Activity Monitor (simulated, clearly labeled as such, live-updating CPU/memory/disk/network charts).
- **Persistence** — wallpaper, theme, dock preferences, notes, and desktop icon layout survive a reload via `localStorage`, with graceful fallback if storage is corrupted, full, or unavailable.
- **Accessibility** — semantic roles throughout, visible focus rings, keyboard-operable menus and dialogs, and a Reduce Motion / Increase Contrast pair in Settings that also honors the OS-level `prefers-reduced-motion`.
- **RTL support** — switch to Hebrew in Settings → General to flip the entire desktop (menu bar, dock, windows, dialogs) to a right-to-left layout.
- **Light/dark/auto theme**, with a full token-based design system.

## Tech stack

React 18 + TypeScript + Vite, with Zustand for state (window manager, settings, notes, desktop icons, notifications, transient UI). No UI framework or icon library — every visual is hand-built CSS and inline SVG, kept intentionally dependency-light.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. The lock screen accepts any password.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck and build for production (`dist/`) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint (TypeScript + React Hooks + jsx-a11y) |
| `npm run typecheck` | `tsc` in check-only mode |
| `npm test` | Unit/component tests (Vitest + React Testing Library) |
| `npm run test:coverage` | Unit tests with coverage |
| `npm run e2e` | End-to-end tests (Playwright) against a production build |

## Architecture

```text
src/
  apps/           One folder per application (Finder, Safari, Terminal, Notes,
                   Calculator, Settings, Activity Monitor, Trash), each with its
                   own component, styles, and — where there's real logic to test
                   independently of React — a pure module (calculatorEngine.ts,
                   commands.ts, filesystem.ts).
  apps/registry.ts Central app registry: id → { icon, component, window defaults }.
                   Adding an app to the desktop, dock, and Launchpad is one entry.
  components/     Desktop shell: window manager, dock, menu bar, Spotlight,
                   Launchpad, Control Center, Notification Center, lock screen,
                   and shared primitives (Dialog, ContextMenu, ErrorBoundary).
  state/          Zustand stores — one per concern (windows, settings, notes,
                   desktop icons, notifications, transient UI overlays).
  hooks/          Cross-cutting behavior: window drag/resize, icon drag, global
                  keyboard shortcuts, the clock, reduced-motion detection.
  config/         Static data: the app registry's supporting config, wallpapers,
                  desktop icon definitions.
  icons/          Original SVG icon components (app tiles + small UI glyphs).
  styles/         Design tokens (light/dark) and the global CSS reset.
  types/          Shared TypeScript types for windows and apps.
```

**Why this shape:** each app owns its slice end-to-end (component + styles + pure logic), so the pure logic (a reducer, a command parser, a filesystem lookup) is unit-testable without rendering anything, while the window manager and desktop shell stay generic — they know nothing about what's *inside* a window, only how to open, move, and stack one.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Cmd/Ctrl + Space` | Toggle Spotlight (also available via the menu-bar search icon — see note below) |
| `Cmd/Ctrl + W` | Close the focused window |
| `Cmd/Ctrl + Q` | Quit the focused app (closes all its windows) |
| `Cmd/Ctrl + M` | Minimize the focused window |
| `Cmd/Ctrl + ,` | Open System Settings |
| `Escape` | Close whatever overlay is open (Spotlight, Launchpad, a menu, a context menu) |

> **Note:** real macOS reserves `Cmd+Space` for its own Spotlight at the OS level, so some browsers/OSes may intercept it before this page ever sees the keypress. If that happens, click the search icon in the menu bar instead — it does the same thing.

## Limitations

- **Terminal and Safari are sandboxed by design.** The Terminal only reads the bundled simulated filesystem and never executes real shell commands; Safari never fetches real URLs — typing anything into its address bar renders a locally generated placeholder page. This is a deliberate security boundary, not an unfinished feature.
- **Activity Monitor's data is simulated** (clearly labeled in-app) — it does not read your device's real CPU, memory, disk, or network.
- **`Cmd/Ctrl+Space` for Spotlight** can be intercepted by the host OS/browser before it reaches the page (see above); the menu-bar search icon is the reliable fallback.
- **Window state (position/open apps) is not restored across a reload** — only app *data* (notes, settings, desktop layout) persists. Real macOS mostly behaves the same way outside of explicit "reopen windows" opt-ins.
- **RTL is a full layout mirror**, not a translation — all UI strings are still English; Hebrew is used to validate that the layout itself doesn't break, not to demonstrate localized copy.

## Testing

- **Unit/component** (`npm test`): the window manager store (open/focus/minimize/maximize/close/boundary-clamping), the calculator's reducer, the terminal's command parser, the settings/notes stores' persistence (including recovery from corrupted `localStorage`), and error-boundary containment.
- **End-to-end** (`npm run e2e`): full window lifecycle (open → drag → minimize → restore → maximize → close), multi-window focus stacking, wallpaper/theme changes persisting across a reload, a note surviving both an app close/reopen and a full page reload, and calculator correctness via both mouse and keyboard.

## Browser support

Built and tested against current Chromium. Uses `backdrop-filter`, CSS custom properties, and the Pointer Events API — all broadly supported in current Safari, Firefox, and Edge as well. `prefers-reduced-motion` and `prefers-color-scheme` are respected automatically.

## Contributing

Issues and pull requests are welcome. Please keep new assets original (no proprietary Apple artwork) and add tests for new logic.

## License

MIT — see [LICENSE](LICENSE).
