import * as vscode from "vscode";
import * as vscodeUtil from "./vscodeUtil";
import { DecorateManager } from "./decoration";

export function activate(context: vscode.ExtensionContext) {
  const channel = vscode.window.createOutputChannel("DecorateKeyword");
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
    for (const editor of vscode.window.visibleTextEditors) {
      dm.keep(editor.document);
    }
  }

  async function open() {
    await dm.open();
  }

  async function showLanguageIds() {
    const languages = await vscode.languages.getLanguages();
    for (const language of languages) {
      channel.appendLine(language);
    }
    channel.show();
  }

  vscodeUtil.registerCommand(context, "decorate-keyword.read", read);
  vscodeUtil.registerCommand(context, "decorate-keyword.open", open);
  vscodeUtil.registerCommand(context, "decorate-keyword.decorate", decorate);
  vscodeUtil.registerCommand(context, "decorate-keyword.undecorate", undecorate);
  vscodeUtil.registerCommand(context, "decorate-keyword.toggle", toggle);
  vscodeUtil.registerCommand(context, "decorate-keyword.showLanguageIds", showLanguageIds);
  // vscodeUtil.registerCommand(context, "decorate-keyword.info", () => {
  //   console.log(dm.info());
  // });

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
        dm.keep(editor.document);
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidSaveTextDocument(
    (document) => {
      dm.keep(document);
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
