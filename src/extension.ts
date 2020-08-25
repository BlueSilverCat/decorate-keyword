import * as vscode from "vscode";
import * as vscodeUtil from "./vscodeUtil";
import { DecorateManager } from "./decoration";
import { open } from "fs";

export function activate(context: vscode.ExtensionContext) {
  const dm: DecorateManager = new DecorateManager();

  async function readData() {
    dm.getConfig();
    const data = await DecorateManager.read(dm.definitionFilePath);
    dm.setDecorationData(data);
  }

  function decorate() {
    const editor = vscode.window.activeTextEditor;
    if (typeof editor === "undefined") {
      return;
    }
    dm.undecorate(editor);
    dm.decorate(editor);
  }

  function undecorate() {
    const editor = vscode.window.activeTextEditor;
    if (typeof editor === "undefined") {
      return;
    }
    dm.undecorate(editor);
  }

  function toggle() {
    const editor = vscode.window.activeTextEditor;
    if (typeof editor === "undefined") {
      return;
    }
    dm.toggle(editor);
  }

  async function read() {
    await readData();
    if (dm.autoDecorate === true) {
      for (const editor of vscode.window.visibleTextEditors) {
        dm.undecorate(editor);
        dm.decorate(editor);
      }
    }
  }

  async function open() {
    await dm.open();
  }

  vscodeUtil.registerCommand(context, "decorate-keyword.read", read);
  vscodeUtil.registerCommand(context, "decorate-keyword.open", open);
  vscodeUtil.registerCommand(context, "decorate-keyword.decorate", decorate);
  vscodeUtil.registerCommand(context, "decorate-keyword.undecorate", undecorate);
  vscodeUtil.registerCommand(context, "decorate-keyword.toggle", toggle);

  vscode.workspace.onDidChangeConfiguration(
    (event) => {
      if (event.affectsConfiguration("decorateKeyword") === true) {
        read();
      }
    },
    null,
    context.subscriptions
  );

  // vscode.window.onDidChangeActiveTextEditor(
  //   (editor) => {
  //     if (dm.autoDecorate === false || typeof editor === "undefined") {
  //       return;
  //     }
  //     dm.decorate(editor);
  //   },
  //   null,
  //   context.subscriptions
  // );

  vscode.window.onDidChangeVisibleTextEditors(
    (editors) => {
      dm.dispose(editors);
      if (dm.autoDecorate === false) {
        return;
      }
      for (const editor of editors) {
        dm.decorate(editor);
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (dm.autoDecorate === false) {
        return;
      }
      dm.change(event);
    },
    null,
    context.subscriptions
  );

  read();
}

export function deactivate() {}
