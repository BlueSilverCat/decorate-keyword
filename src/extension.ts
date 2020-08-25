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
    dm.undecorate(editor.document);
    dm.decorate(editor.document);
  }

  function undecorate() {
    const editor = vscode.window.activeTextEditor;
    if (typeof editor === "undefined") {
      return;
    }
    dm.undecorate(editor.document);
  }

  function toggle() {
    const editor = vscode.window.activeTextEditor;
    if (typeof editor === "undefined") {
      return;
    }
    dm.toggle(editor.document);
  }

  async function read() {
    await readData();
    if (dm.autoDecorate === true) {
      for (const editor of vscode.window.visibleTextEditors) {
        dm.undecorate(editor.document);
        dm.decorate(editor.document);
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
  vscodeUtil.registerCommand(context, "decorate-keyword.info", () => {
    console.log(dm.info());
  });

  vscode.workspace.onDidChangeConfiguration(
    (event) => {
      if (event.affectsConfiguration("decorateKeyword") === true) {
        read();
      }
    },
    null,
    context.subscriptions
  );

  // vscode.window.onDidChangeActiveTextEditor( // editorを分割した場合、切り替わる毎に呼ばれるのでこれは使わない
  //   (editor) => {
  //   },
  //   null,
  //   context.subscriptions
  // );

  // vscode.workspace.onDidOpenTextDocument

  vscode.workspace.onDidCloseTextDocument(
    (document) => {
      dm.dispose(document);
    },
    null,
    context.subscriptions
  );

  vscode.window.onDidChangeVisibleTextEditors(
    (editors) => {
      if (editors.length === 0) {
        return;
      }
      for (const editor of editors) {
        const redecorate = dm.redecorate(editor.document);
        if (redecorate === false && dm.autoDecorate === true) {
          dm.undecorate(editor.document);
          dm.decorate(editor.document);
        }
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidSaveTextDocument(
    (document) => {
      const redecorate = dm.redecorate(document);
      if (redecorate === false && dm.autoDecorate === true) {
        dm.undecorate(document);
        dm.decorate(document);
      }
    },
    null,
    context.subscriptions
  );

  // vscode.workspace.onDidChangeTextDocument(
  //   (event) => {
  //     if (dm.autoDecorate === false) {
  //       return;
  //     }
  //     dm.change(event);
  //   },
  //   null,
  //   context.subscriptions
  // );

  read();
}

export function deactivate() {}
