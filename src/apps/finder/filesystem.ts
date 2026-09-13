import type { AppId } from "@/types/app";

export type FsNodeKind = "folder" | "text" | "app" | "image";

export interface FsNode {
  id: string;
  name: string;
  kind: FsNodeKind;
  modified: string;
  size?: string;
  /** For text files, the content shown in the preview pane. */
  content?: string;
  /** For app entries, which registered application launches. */
  appId?: AppId;
  children?: FsNode[];
}

const APPLICATIONS: FsNode = {
  id: "/Applications",
  name: "Applications",
  kind: "folder",
  modified: "—",
  children: (
    [
      ["Finder", "finder"],
      ["Safari", "safari"],
      ["Terminal", "terminal"],
      ["Notes", "notes"],
      ["Calculator", "calculator"],
      ["System Settings", "settings"],
      ["Activity Monitor", "activity-monitor"],
    ] as [string, AppId][]
  ).map(([name, appId]) => ({
    id: `/Applications/${name}`,
    name,
    kind: "app",
    appId,
    modified: "—",
  })),
};

const DOCUMENTS: FsNode = {
  id: "/Users/Guest/Documents",
  name: "Documents",
  kind: "folder",
  modified: "Today",
  children: [
    {
      id: "/Users/Guest/Documents/Read Me.txt",
      name: "Read Me.txt",
      kind: "text",
      modified: "Today",
      size: "612 B",
      content:
        "This Finder is a simulation — every file here is bundled with the app, not read from your real computer.\n\nDouble-click a folder to open it, or a text file to preview it in this pane.",
    },
    {
      id: "/Users/Guest/Documents/Project Notes.txt",
      name: "Project Notes.txt",
      kind: "text",
      modified: "Yesterday",
      size: "348 B",
      content: "Ideas:\n- Ship the desktop\n- Polish the dock magnification\n- Write real tests\n",
    },
  ],
};

const PICTURES: FsNode = {
  id: "/Users/Guest/Pictures",
  name: "Pictures",
  kind: "folder",
  modified: "Today",
  children: [
    { id: "/Users/Guest/Pictures/Sunset.jpg", name: "Sunset.jpg", kind: "image", modified: "Mon", size: "2.1 MB" },
    { id: "/Users/Guest/Pictures/Mountains.jpg", name: "Mountains.jpg", kind: "image", modified: "Tue", size: "3.4 MB" },
    { id: "/Users/Guest/Pictures/City.jpg", name: "City.jpg", kind: "image", modified: "Wed", size: "1.8 MB" },
  ],
};

const DOWNLOADS: FsNode = {
  id: "/Users/Guest/Downloads",
  name: "Downloads",
  kind: "folder",
  modified: "—",
  children: [],
};

const DESKTOP: FsNode = {
  id: "/Users/Guest/Desktop",
  name: "Desktop",
  kind: "folder",
  modified: "—",
  children: [],
};

const GUEST_HOME: FsNode = {
  id: "/Users/Guest",
  name: "Guest",
  kind: "folder",
  modified: "—",
  children: [DESKTOP, DOCUMENTS, DOWNLOADS, PICTURES],
};

const USERS: FsNode = {
  id: "/Users",
  name: "Users",
  kind: "folder",
  modified: "—",
  children: [GUEST_HOME],
};

export const FS_ROOT: FsNode = {
  id: "/",
  name: "Macintosh HD",
  kind: "folder",
  modified: "—",
  children: [APPLICATIONS, USERS],
};

export function resolvePath(path: string[]): FsNode | null {
  let node: FsNode = FS_ROOT;
  for (const segment of path) {
    const next = node.children?.find((c) => c.name === segment);
    if (!next) return null;
    node = next;
  }
  return node;
}

export function searchFs(query: string, node: FsNode = FS_ROOT, results: FsNode[] = []): FsNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return results;
  if (node !== FS_ROOT && node.name.toLowerCase().includes(q)) results.push(node);
  node.children?.forEach((child) => searchFs(query, child, results));
  return results;
}
