import * as vscode from "vscode";
import * as util from "./util";
import * as vscodeUtil from "./vscodeUtil";

const EXTENSION_NAME = "DecorateKeyword";

interface DecorationFileData {
  [key: string]: string | boolean | number | object | undefined;
  name: string;
  regex: string;
  regexFlag: string;
  languageId?: string[];
  after?: object;
  before?: object;
  dark?: object;
  light?: object;
  color?: string;
  backgroundColor?: string;
  border?: string;
  borderColor?: string;
  borderRadius?: string;
  borderSpacing?: string;
  borderStyle?: string;
  borderWidth?: string;
  cursor?: string;
  fontStyle?: string;
  fontWeight?: string;
  gutterIconPath?: string;
  gutterIconSize?: string;
  isWholeLine?: boolean;
  letterSpacing?: string;
  opacity?: string;
  outline?: string;
  outlineColor?: string;
  outlineStyle?: string;
  outlineWidth?: string;
  overviewRulerColor?: string;
  overviewRulerLane?: string | number; // "Center"=2, "Full"=7, "Left"=1, "Right"=4
  rangeBehavior?: string | number; // "ClosedClosed", "ClosedOpen", "OpenClosed", "OpenOpen"
  textDecoration?: string;
}

interface DecorationFileDataChecked {
  [key: string]: string | RegExp | boolean | number | object | undefined;
  name: string;
  regex: RegExp;
  languageId: string[];
  after?: object;
  before?: object;
  dark?: object;
  light?: object;
  color?: string;
  backgroundColor?: string;
  border?: string;
  borderColor?: string;
  borderRadius?: string;
  borderSpacing?: string;
  borderStyle?: string;
  borderWidth?: string;
  cursor?: string;
  fontStyle?: string;
  fontWeight?: string;
  gutterIconPath?: string;
  gutterIconSize?: string;
  isWholeLine?: boolean;
  letterSpacing?: string;
  opacity?: string;
  outline?: string;
  outlineColor?: string;
  outlineStyle?: string;
  outlineWidth?: string;
  overviewRulerColor?: string;
  overviewRulerLane?: number; // "Center"=2, "Full"=7, "Left"=1, "Right"=4
  rangeBehavior?: number; // "ClosedClosed", "ClosedOpen", "OpenClosed", "OpenOpen"
  textDecoration?: string;
}

interface DecorationRenderOptions extends vscode.DecorationRenderOptions {
  [key: string]: any;
}

class DecorationData {
  name: string;
  regex: RegExp;
  languageId: string[];
  decorationRenderOption: DecorationRenderOptions;

  constructor(data: DecorationFileDataChecked) {
    this.name = data.name;
    this.regex = data.regex;
    this.languageId = data.languageId;
    this.decorationRenderOption = {};
    for (const key of Object.keys(data)) {
      if (key !== "name" && key !== "regex" && key !== "languageId") {
        this.decorationRenderOption[key] = data[key];
      }
    }
  }
}

class DecorationType {
  decorationType: vscode.TextEditorDecorationType;
  regex: RegExp;
  ranges: vscode.Range[];

  constructor(regex: RegExp, data: vscode.DecorationRenderOptions) {
    this.decorationType = vscode.window.createTextEditorDecorationType(data);
    this.regex = regex;
    this.ranges = [];
  }

  setRanges(editor: vscode.TextEditor) {
    const text = editor.document.getText();
    this.regex.lastIndex = 0;
    this.ranges = [];
    let match = this.regex.exec(text);
    while (match !== null) {
      const start = editor.document.positionAt(match.index);
      const end = editor.document.positionAt(this.regex.lastIndex);
      this.ranges.push(new vscode.Range(start, end));
      match = this.regex.exec(text);
    }
  }

  decorate(editor: vscode.TextEditor) {
    this.setRanges(editor);
    editor.setDecorations(this.decorationType, this.ranges);
  }

  undecorate(editor: vscode.TextEditor) {
    this.ranges = [];
    editor.setDecorations(this.decorationType, []);
  }

  dispose() {
    this.ranges = [];
    this.decorationType.dispose();
  }
}

class Decorator {
  documentUri: vscode.Uri;
  languageId: string;
  decorationTypes: DecorationType[];
  decorateFlag: number;

  constructor(documentUri: vscode.Uri, languageId: string, data: DecorationData[]) {
    this.documentUri = documentUri;
    this.languageId = languageId;
    this.decorationTypes = [];
    this.decorateFlag = -1;

    for (const d of data) {
      if (d.languageId.includes("*") === true || d.languageId.includes(languageId) === true) {
        this.decorationTypes.push(new DecorationType(d.regex, d.decorationRenderOption));
      }
    }
  }

  decorate(editors: vscode.TextEditor[]) {
    for (const editor of editors) {
      for (const decorationType of this.decorationTypes) {
        decorationType.decorate(editor);
      }
    }
    this.decorateFlag = 1;
  }

  undecorate(editors: vscode.TextEditor[]) {
    for (const editor of editors) {
      for (const decorationType of this.decorationTypes) {
        decorationType.undecorate(editor);
      }
    }
    this.decorateFlag = 0;
  }

  dispose() {
    this.decorationTypes.forEach((decorationType) => {
      decorationType.dispose();
    });
    this.decorateFlag = -1;
  }
}

class DecorateManager {
  static readonly ReadMessage = "DecorateKeyword: Loading...";
  static readonly ReadEndMessage = "DecorateKeyword: Finish loading.";
  static readonly MessageTimeOut = 3000;

  decorationData: DecorationData[];
  decorators: Decorator[];
  definitionFilePath: string;
  autoDecorate: boolean;

  constructor() {
    this.decorationData = [];
    this.decorators = [];
    this.definitionFilePath = "";
    this.autoDecorate = false;
  }

  static checkColor(array: any[], index: number, property: string) {
    if (array[index].hasOwnProperty(property) === false) {
      return true;
    }
    if (util.isColor(array[index][property]) === false) {
      vscode.window.showWarningMessage(
        `${EXTENSION_NAME}: DecorationData[${index}](${array[index].name}) ${property} is invalid. ${array[index][property]}`
      );
      return false;
    }
    return true;
  }

  static checkRangeBehavior(array: any[], index: number) {
    if (array[index].hasOwnProperty("rangeBehavior") === false) {
      return true;
    }
    switch (array[index].rangeBehavior) {
      case 0:
      case 1:
      case 2:
      case 3:
        break;
      case "OpenOpen":
        array[index].rangeBehavior = 0;
        break;
      case "ClosedClosed":
        array[index].rangeBehavior = 1;
        break;
      case "OpenClosed":
        array[index].rangeBehavior = 2;
        break;
      case "ClosedOpen":
        array[index].rangeBehavior = 3;
        break;
      default:
        vscode.window.showWarningMessage(
          `${EXTENSION_NAME}: DecorationData[${index}](${array[index].name}) rangeBehavior is invalid. ${array[index].rangeBehavior}`
        );
        return false;
    }
    return true;
  }

  static checkOverviewRulerLane(array: any[], index: number) {
    if (array[index].hasOwnProperty("overviewRulerLane") === false) {
      return true;
    }
    switch (array[index].overviewRulerLane) {
      case 1:
      case 2:
      case 4:
      case 7:
        break;
      case "Left":
        array[index].overviewRulerLane = 1;
        break;
      case "Center":
        array[index].overviewRulerLane = 2;
        break;
      case "Right":
        array[index].overviewRulerLane = 4;
        break;
      case "Full":
        array[index].overviewRulerLane = 7;
        break;
      default:
        vscode.window.showWarningMessage(
          `${EXTENSION_NAME}: DecorationData[${index}](${array[index].name}) overviewRulerLane is invalid. ${array[index].overviewRulerLane}`
        );
        return false;
    }
    return true;
  }

  static checkFlag(array: any[], index: number) {
    let result = array[index].regexFlag;
    const re1 = /[^gimsu]+/g; //cspell: disable-line
    const re2 = /g/;
    if (re1.test(result) === true) {
      vscode.window.showWarningMessage(
        `${EXTENSION_NAME}: DecorationData[${index}](${array[index].name}) ignore invalid flags. ${array[index].regexFlag}`
      );
      result = result.replace(re1, "");
    }
    if (re2.test(result) === false) {
      vscode.window.showWarningMessage(
        `${EXTENSION_NAME}: DecorationData[${index}](${array[index].name}) regexFlag must contain "g" flag. ${array[index].regexFlag}`
      );
      result += "g";
    }
    return result.split("").filter(util.uniqueFilter).join("");
  }

  static checkRegex(array: any[], index: number) {
    if (array[index].hasOwnProperty("regex") === false || array[index].hasOwnProperty("regexFlag") === false) {
      vscode.window.showWarningMessage(
        `${EXTENSION_NAME}: DecorationData[${index}](${array[index].name}) must have regex and regexFlag property .`
      );
      return false;
    }

    try {
      array[index].regex = new RegExp(array[index].regex, DecorateManager.checkFlag(array, index));
      delete array[index].regexFlag;
    } catch (error) {
      vscode.window.showWarningMessage(
        `${EXTENSION_NAME}: DecorationData[${index}](${array[index].name}) regex is invalid. ${array[index].regex}`
      );
      return false;
    }
    return true;
  }

  static async checkLanguageId(array: any[], index: number) {
    if (array[index].hasOwnProperty("languageId") === false) {
      array[index].languageId = ["*"];
      return true;
    }
    const languages = await vscode.languages.getLanguages();
    let count = 0;
    for (const language of array[index].languageId) {
      if (languages.includes(language.toLowerCase())) {
        count++;
      }
    }
    if (count === array[index].languageId.length) {
      return true;
    }
    vscode.window.showWarningMessage(
      `${EXTENSION_NAME}: DecorationData[${index}](${array[index].name}) languageId is invalid. ${array[index].languageId}`
    );
    return false;
  }

  static async checkData(data: any) {
    if (Array.isArray(data) === false) {
      vscode.window.showWarningMessage(`${EXTENSION_NAME}: DecorationData must be Array.`);
      return [];
    }
    const result = [];
    let invalidFlag = false;
    for (let i = 0; i < data.length; ++i) {
      invalidFlag = false;
      if (data[i].hasOwnProperty("name") === false) {
        vscode.window.showWarningMessage(`${EXTENSION_NAME}: DecorationData[${i}] must have name property.`);
        continue;
      }
      if (DecorateManager.checkRegex(data, i) === false) {
        continue;
      }
      if ((await DecorateManager.checkLanguageId(data, i)) === false) {
        invalidFlag = true;
      }
      if (DecorateManager.checkColor(data, i, "color") === false) {
        invalidFlag = true;
      }
      if (DecorateManager.checkColor(data, i, "backgroundColor") === false) {
        invalidFlag = true;
      }
      if (DecorateManager.checkColor(data, i, "borderColor") === false) {
        invalidFlag = true;
      }
      if (DecorateManager.checkColor(data, i, "overviewRulerColor") === false) {
        invalidFlag = true;
      }
      if (DecorateManager.checkRangeBehavior(data, i) === false) {
        invalidFlag = true;
      }
      if (DecorateManager.checkOverviewRulerLane(data, i) === false) {
        invalidFlag = true;
      }
      if (invalidFlag === false) {
        result.push(data[i]);
      }
    }
    return result;
  }

  static async read(filePath: string): Promise<DecorationFileDataChecked[]> {
    let statusBar = vscode.window.setStatusBarMessage(DecorateManager.ReadMessage);
    const text = await util.read(filePath).catch((err) => {
      vscode.window.showWarningMessage(`${EXTENSION_NAME}: ${err}`);
      return "[]";
    });
    let decorationData = util.parseJsonc(text);
    decorationData = await DecorateManager.checkData(decorationData);
    statusBar.dispose();
    vscode.window.setStatusBarMessage(DecorateManager.ReadEndMessage, DecorateManager.MessageTimeOut);
    return decorationData;
  }

  getConfig() {
    const config = vscode.workspace.getConfiguration("decorateKeyword");
    this.definitionFilePath = config.get("definitionFilePath", "");
    this.autoDecorate = config.get("autoDecorate", false);
  }

  setDecorationData(decorationData: DecorationFileDataChecked[]) {
    this.decorationData = [];
    for (const data of decorationData) {
      this.decorationData.push(new DecorationData(data));
    }
    this.disposeAll();
  }

  add(document: vscode.TextDocument): void {
    this.decorators.push(new Decorator(document.uri, document.languageId, this.decorationData));
  }

  delete(documentIndex: number): void {
    this.decorators[documentIndex].dispose();
    this.decorators.splice(documentIndex, 1);
  }

  /**
   * 複数のEditorが同じTextDocumentを開いている可能性があるので配列を返す。
   * @param {vscode.TextDocument} document
   */
  findFromDocument(document: vscode.TextDocument): number[] {
    const result = [];
    for (let i = 0; i < this.decorators.length; ++i) {
      if (this.decorators[i].documentUri === document.uri) {
        result.push(i);
      }
    }
    return result;
  }

  toggle(document: vscode.TextDocument): void {
    let indices = this.findFromDocument(document);
    if (indices.length === 0) {
      this.add(document);
      indices = [this.decorators.length - 1];
    }
    const editors = vscodeUtil.getEditorFromDocument(document);
    for (const i of indices) {
      if (this.decorators[i].decorateFlag === 1) {
        this.decorators[i].undecorate(editors);
      } else {
        this.decorators[i].decorate(editors);
      }
    }
  }

  decorate(document: vscode.TextDocument): void {
    let indices = this.findFromDocument(document);
    if (indices.length === 0) {
      this.add(document);
      indices = [this.decorators.length - 1];
    }
    const editors = vscodeUtil.getEditorFromDocument(document);
    for (const i of indices) {
      this.decorators[i].decorate(editors);
    }
  }

  keep(document: vscode.TextDocument): void {
    let indices = this.findFromDocument(document);
    if (indices.length === 0) {
      if (this.autoDecorate === true) {
        this.decorate(document);
      }
      return;
    }

    const editors = vscodeUtil.getEditorFromDocument(document);
    for (const i of indices) {
      if (this.decorators[i].decorateFlag === 1) {
        this.decorators[i].undecorate(editors);
        this.decorators[i].decorate(editors);
      } else if (this.decorators[i].decorateFlag === 0) {
        this.decorators[i].undecorate(editors);
      } else if (this.autoDecorate === true) {
        this.decorators[i].undecorate(editors);
        this.decorators[i].decorate(editors);
      }
    }
  }

  undecorate(document: vscode.TextDocument): void {
    let indices = this.findFromDocument(document);
    if (indices.length === 0) {
      return;
    }
    const editors = vscodeUtil.getEditorFromDocument(document);
    for (const i of indices) {
      this.decorators[i].undecorate(editors);
    }
  }

  async open() {
    const document = await vscode.workspace.openTextDocument(this.definitionFilePath);
    const editor = await vscode.window.showTextDocument(document);
  }

  dispose(document: vscode.TextDocument): void {
    const indices = this.findFromDocument(document);
    if (indices.length === 0) {
      return;
    }
    indices.sort();
    let deleteCount = 0;
    for (const i of indices) {
      this.delete(i - deleteCount++);
    }
  }

  disposeAll(): void {
    this.decorators.forEach((decorator) => {
      decorator.dispose();
    });
    this.decorators = [];
  }

  info(sep = "\n") {
    let result = `decorators.length=${this.decorators.length}${sep}`;
    for (const decorator of this.decorators) {
      result += `decorator.decorateFlag=${decorator.decorateFlag}${sep}`;
      // result += `${decorator.editorId}${sep}`;
      result += `decorator.languageId=${decorator.languageId}${sep}`;
      result += `decorator.documentUri=${decorator.documentUri}${sep}`;
      result += `decorator.decorationTypes.length=${decorator.decorationTypes.length}${sep}`;
    }
    const re = new RegExp(`${sep}$`);
    result = result.replace(re, "");
    return result;
  }
}

export { DecorationFileData, DecorationFileDataChecked, DecorationType, Decorator, DecorationData, DecorateManager };
