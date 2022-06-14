import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import { getConfig, setConfig, getCommands } from "../../vscodeUtil";

let currentConfig = {};
const NAME = "decorateKeyword";
const CONFIGS = ["definitionFilePath", "autoDecorate"];
const COMMAND_PREFIX = "decorate-keyword";
const COMMANDS = [
  "decorate-keyword.read",
  "decorate-keyword.open",
  "decorate-keyword.decorate",
  "decorate-keyword.undecorate",
  "decorate-keyword.toggle",
  "decorate-keyword.showLanguageIds",
];

const CONFIG_AUTO_ON = {
  autoDecorate: true,
};

const CONFIG_AUTO_OFF = {
  autoDecorate: false,
};

let ROOT_URI = "";
if (typeof vscode.workspace.workspaceFolders !== "undefined") {
  ROOT_URI = vscode.workspace.workspaceFolders[0].uri.fsPath;
}

async function getEditor(fileName: string) {
  const document = await vscode.workspace.openTextDocument(path.join(ROOT_URI, fileName));
  const editor = await vscode.window.showTextDocument(document);
  return editor;
}

// 目視確認が必要
describe("Extension Test Suite", () => {
  let editor: vscode.TextEditor;
  before(async function () {
    currentConfig = getConfig(NAME, CONFIGS);
  });
  after(async function () {
    setConfig(NAME, currentConfig);
  });
  beforeEach(async function () {
    editor = await getEditor("test01.jsonc");
  });
  afterEach(async function () {
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  describe("activate", function () {
    it("commands", async function () {
      const commands = await getCommands(COMMAND_PREFIX);
      assert.deepStrictEqual(commands, COMMANDS);
    });

    it("decorate", async function () {
      this.timeout(0);
      await vscode.commands.executeCommand("decorate-keyword.decorate");
      const input = await vscode.window.showInputBox({ prompt: "decorate" });
      assert.strictEqual(input, "ok");
    });

    it("undecorate", async function () {
      this.timeout(0);
      await vscode.commands.executeCommand("decorate-keyword.undecorate");
      const input = await vscode.window.showInputBox({ prompt: "undecorate" });
      assert.strictEqual(input, "ok");
    });

    it("toggle", async function () {
      this.timeout(0);
      await vscode.commands.executeCommand("decorate-keyword.toggle");
      let input = await vscode.window.showInputBox({ prompt: "toggle(on)" });
      assert.strictEqual(input, "ok");
      await vscode.commands.executeCommand("decorate-keyword.toggle");
      input = await vscode.window.showInputBox({ prompt: "toggle(off)" });
      assert.strictEqual(input, "ok");
    });

    it("read", async function () {
      this.timeout(0);
      await vscode.commands.executeCommand("decorate-keyword.undecorate");
      await setConfig(NAME, CONFIG_AUTO_ON);
      await vscode.commands.executeCommand("decorate-keyword.read");
      let input = await vscode.window.showInputBox({ prompt: "read: autoDecorate=true" });
      assert.strictEqual(input, "ok");
      await setConfig(NAME, CONFIG_AUTO_OFF);
      await vscode.commands.executeCommand("decorate-keyword.read");
      input = await vscode.window.showInputBox({ prompt: "read: autoDecorate=false" });
      assert.strictEqual(input, "ok");
    });

    it("split editor", async function () {
      this.timeout(0);
      await vscode.commands.executeCommand("decorate-keyword.toggle");
      let input = await vscode.window.showInputBox({ prompt: "toggle(on)" });
      assert.strictEqual(input, "ok");
      await vscode.commands.executeCommand("workbench.action.splitEditor");
      input = await vscode.window.showInputBox({ prompt: "split auto decorate" });
      assert.strictEqual(input, "ok");
      await vscode.commands.executeCommand("decorate-keyword.toggle");
      input = await vscode.window.showInputBox({ prompt: "both toggle(off)" });
      assert.strictEqual(input, "ok");
      await vscode.commands.executeCommand("decorate-keyword.toggle");
      input = await vscode.window.showInputBox({ prompt: "both toggle(on)" });
      assert.strictEqual(input, "ok");
      await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
      await vscode.commands.executeCommand("decorate-keyword.toggle");
      input = await vscode.window.showInputBox({ prompt: "toggle(off)" });
      assert.strictEqual(input, "ok");
    });

    it("split editor auto", async function () {
      this.timeout(0);
      await setConfig(NAME, CONFIG_AUTO_ON);
      await vscode.commands.executeCommand("decorate-keyword.read");
      await vscode.commands.executeCommand("workbench.action.splitEditor");
      let input = await vscode.window.showInputBox({ prompt: "auto decorate" });
      assert.strictEqual(input, "ok");
      await vscode.commands.executeCommand("decorate-keyword.toggle");
      input = await vscode.window.showInputBox({ prompt: "toggle(off)" });
      assert.strictEqual(input, "ok");
      await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
      input = await vscode.window.showInputBox({ prompt: "keep decorate" });
      assert.strictEqual(input, "ok");
      await vscode.commands.executeCommand("decorate-keyword.toggle");
      input = await vscode.window.showInputBox({ prompt: "toggle(on)" });
      assert.strictEqual(input, "ok");
      await setConfig(NAME, CONFIG_AUTO_OFF);
    });
  });
});
