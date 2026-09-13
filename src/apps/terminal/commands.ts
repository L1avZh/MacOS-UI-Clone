import { FS_ROOT, resolvePath, type FsNode } from "@/apps/finder/filesystem";

export interface TerminalContext {
  cwd: string[];
  userName: string;
}

export interface CommandResult {
  output: string[];
  cwd?: string[];
  clear?: boolean;
}

function pathString(cwd: string[]): string {
  return cwd.length === 0 ? "~" : `~/${cwd.join("/")}`;
}

function nodeAt(cwd: string[]): FsNode {
  return resolvePath(cwd) ?? FS_ROOT;
}

const HELP_TEXT = [
  "Available commands:",
  "  help        show this list",
  "  clear       clear the screen",
  "  echo TEXT   print text",
  "  date        show the current date and time",
  "  whoami      show the current user",
  "  pwd         print working directory",
  "  ls          list the current directory",
  "  cd DIR      change directory (cd .. to go up)",
  "  cat FILE    print a text file's contents",
  "  uname       show system information",
  "  neofetch    show a system summary banner",
  "",
  "This terminal is a sandbox: it only reads the simulated filesystem",
  "bundled with this app. It never runs real commands on your computer.",
];

function neofetch(userName: string): string[] {
  return [
    `${userName}@macos-ui-clone`,
    "-----------------",
    "OS: macOS UI Clone (Web Edition)",
    "Host: your browser",
    "Kernel: JavaScript engine",
    "Shell: sandboxed-sh 1.0",
    "Terminal: Terminal.app (simulated)",
    "CPU: whatever's under the hood",
    "Memory: as much as the tab allows",
  ];
}

export function runCommand(rawInput: string, ctx: TerminalContext): CommandResult {
  const trimmed = rawInput.trim();
  if (!trimmed) return { output: [] };

  const [cmd, ...args] = trimmed.split(/\s+/);
  const arg = args.join(" ");

  switch (cmd?.toLowerCase()) {
    case "help":
      return { output: HELP_TEXT };

    case "clear":
      return { output: [], clear: true };

    case "echo":
      return { output: [arg] };

    case "date":
      return { output: [new Date().toString()] };

    case "whoami":
      return { output: [ctx.userName.toLowerCase().replace(/\s+/g, "")] };

    case "pwd":
      return { output: [pathString(ctx.cwd)] };

    case "uname":
      return { output: args.includes("-a") ? ["MacOSUIClone WebKernel 1.0 x86_64 Browser"] : ["MacOSUIClone"] };

    case "neofetch":
      return { output: neofetch(ctx.userName) };

    case "ls": {
      const node = nodeAt(ctx.cwd);
      if (!node.children) return { output: [] };
      if (node.children.length === 0) return { output: [] };
      return { output: [node.children.map((c) => (c.kind === "folder" ? `${c.name}/` : c.name)).join("  ")] };
    }

    case "cd": {
      if (!arg || arg === "~") return { output: [], cwd: [] };
      if (arg === "..") return { output: [], cwd: ctx.cwd.slice(0, -1) };
      const target = [...ctx.cwd, arg];
      const node = resolvePath(target);
      if (!node || node.kind !== "folder") {
        return { output: [`cd: no such directory: ${arg}`] };
      }
      return { output: [], cwd: target };
    }

    case "cat": {
      if (!arg) return { output: ["cat: missing file operand"] };
      const node = nodeAt(ctx.cwd).children?.find((c) => c.name === arg);
      if (!node) return { output: [`cat: ${arg}: No such file or directory`] };
      if (node.kind !== "text") return { output: [`cat: ${arg}: not a text file`] };
      return { output: (node.content ?? "").split("\n") };
    }

    default:
      return { output: [`command not found: ${cmd}. Type "help" for a list of commands.`] };
  }
}

export { pathString };
