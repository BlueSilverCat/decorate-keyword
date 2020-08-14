import * as vscode from "vscode";

////////////////////////////////////////////////////////////////////////////////
// command
////////////////////////////////////////////////////////////////////////////////

function registerCommand(context: vscode.ExtensionContext, command: string, callback: (args: any) => any): void {
  context.subscriptions.push(vscode.commands.registerCommand(command, callback));
}

async function getCommands(prefix: string) {
  const re = new RegExp(prefix);
  const allCommands = await vscode.commands.getCommands(true);
  const commands = allCommands.filter((command) => {
    return re.test(command);
  });
  return commands;
}

////////////////////////////////////////////////////////////////////////////////
// configuration
////////////////////////////////////////////////////////////////////////////////

function getConfig(name: string, configs: string[]) {
  const result: { [key: string]: any } = {};
  const wsConfig = vscode.workspace.getConfiguration(name);
  for (const config of configs) {
    result[config] = wsConfig.get(config);
  }
  return result;
}

async function setConfig(name: string, config: { [key: string]: any }) {
  const wsConfig = vscode.workspace.getConfiguration(name);
  for (const key of Object.keys(config)) {
    await wsConfig.update(key, config[key]);
  }
}

////////////////////////////////////////////////////////////////////////////////
// editor or document
////////////////////////////////////////////////////////////////////////////////

/**
 * 
 * @param {number} num 
 */
function getEol(num: number){
  let eol = "\n";
  if (num === vscode.EndOfLine.CRLF) {
    eol = "\r\n";
  }
  return eol;
}

/**
 * @param {vscode.TextDocument} document
 * @param {number} lineIndex
 */
async function vsDeleteLine(document: vscode.TextDocument, lineIndex: number) {
  if (lineIndex < 0 || lineIndex > document.lineCount) {
    return;
  }
  const workspaceEdit = new vscode.WorkspaceEdit();
  workspaceEdit.delete(document.uri, new vscode.Range(lineIndex, 0, lineIndex + 1, 0));
  await vscode.workspace.applyEdit(workspaceEdit);
}

/**
 * @param {vscode.TextDocument} document
 * @param {number} lineIndex
 * @param {string} string
 */
async function vsInsertLine(document: vscode.TextDocument, lineIndex: number, string: string) {
  if (lineIndex < 0 || lineIndex > document.lineCount) {
    return;
  }

  const eol = getEol(document.eol);
  const workspaceEdit = new vscode.WorkspaceEdit();
  workspaceEdit.insert(document.uri, new vscode.Position(lineIndex, 0), string + eol);
  await vscode.workspace.applyEdit(workspaceEdit);
}

/**
 * @param {vscode.TextDocument} document
 * @param {number} lineIndex
 * @param {string} string
 */
async function vsReplaceLine(document: vscode.TextDocument, lineIndex: number, string: string) {
  if (lineIndex < 0 || lineIndex > document.lineCount) {
    return;
  }

  const eol = getEol(document.eol);
  const workspaceEdit = new vscode.WorkspaceEdit();
  workspaceEdit.replace(document.uri, new vscode.Range(lineIndex, 0, lineIndex + 1, 0), string + eol);
  await vscode.workspace.applyEdit(workspaceEdit);
}

////////////////////////////////////////////////////////////////////////////////
// debug
////////////////////////////////////////////////////////////////////////////////

function getEditorsInfo(editors: vscode.TextEditor[], sep = ", ") {
  let result = "";
  for (const editor of editors) {
    //@ts-ignore
    result += `${editor.id}${sep}`;
    result += `${editor.viewColumn}${sep}`;
  }
  const re = new RegExp(`${sep}$`);
  result = result.replace(re, "");
  return result;
}

function getRangeInfo(range: vscode.Range, separator = "\n") {
  let result = "";
  result += `start: ${getPositionInfo(range.start, ", ")}${separator}`;
  result += `end: ${getPositionInfo(range.end, ", ")}${separator}`;
  result += `isEmpty: ${range.isEmpty}${separator}`;
  result += `isSingleLine: ${range.isSingleLine}`;
  return result;
}

function getPositionInfo(position: vscode.Position, separator = "\n") {
  let result = "";
  result += `line: ${position.line}${separator}`;
  result += `character: ${position.character}`;
  return result;
}

////////////////////////////////////////////////////////////////////////////////
// export
////////////////////////////////////////////////////////////////////////////////

export {
  registerCommand,
  getCommands,

  getConfig,
  setConfig,

  vsDeleteLine,
  vsInsertLine,
  vsReplaceLine,

  getEditorsInfo,
  getRangeInfo,
  getPositionInfo,

};
