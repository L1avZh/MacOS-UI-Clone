import { describe, expect, it } from "vitest";
import { runCommand } from "./commands";

const ctx = { cwd: [] as string[], userName: "Guest" };

describe("runCommand", () => {
  it("shows help text", () => {
    const result = runCommand("help", ctx);
    expect(result.output.join("\n")).toContain("Available commands");
  });

  it("echoes text", () => {
    expect(runCommand("echo hello world", ctx).output).toEqual(["hello world"]);
  });

  it("clears the screen", () => {
    expect(runCommand("clear", ctx)).toEqual({ output: [], clear: true });
  });

  it("reports the working directory", () => {
    expect(runCommand("pwd", { cwd: [], userName: "Guest" }).output).toEqual(["~"]);
    expect(runCommand("pwd", { cwd: ["Applications"], userName: "Guest" }).output).toEqual(["~/Applications"]);
  });

  it("lists the current directory", () => {
    const result = runCommand("ls", ctx);
    expect(result.output[0]).toContain("Applications/");
    expect(result.output[0]).toContain("Users/");
  });

  it("navigates into a real directory", () => {
    const result = runCommand("cd Applications", ctx);
    expect(result.cwd).toEqual(["Applications"]);
  });

  it("refuses to navigate into a missing directory", () => {
    const result = runCommand("cd NoSuchPlace", ctx);
    expect(result.cwd).toBeUndefined();
    expect(result.output[0]).toContain("no such directory");
  });

  it("navigates back up with cd ..", () => {
    const result = runCommand("cd ..", { cwd: ["Applications"], userName: "Guest" });
    expect(result.cwd).toEqual([]);
  });

  it("reads a text file with cat", () => {
    const result = runCommand("cat Read Me.txt", { cwd: ["Users", "Guest", "Documents"], userName: "Guest" });
    expect(result.output.join("\n")).toContain("simulation");
  });

  it("errors when cat targets a missing file", () => {
    const result = runCommand("cat nope.txt", ctx);
    expect(result.output[0]).toContain("No such file or directory");
  });

  it("errors when cat targets a folder", () => {
    const result = runCommand("cat Applications", ctx);
    expect(result.output[0]).toContain("not a text file");
  });

  it("reports whoami based on the settings user name", () => {
    expect(runCommand("whoami", { cwd: [], userName: "Peter Yates" }).output).toEqual(["peteryates"]);
  });

  it("never executes unknown commands silently — it reports them", () => {
    const result = runCommand("rm -rf /", ctx);
    expect(result.output[0]).toContain("command not found");
  });

  it("ignores empty input", () => {
    expect(runCommand("   ", ctx).output).toEqual([]);
  });
});
