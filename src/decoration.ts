import * as vscode from "vscode";
import * as util from "./util";
import * as vscodeUtil from "./vscodeUtil";

const EXTENSION_NAME = "DecorateKeyword";

interface DecorationFileData {
  [key: string]: string | boolean | number | object | undefined;
  name: string;
  regex: string;
  regexFlag: string;
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
  decorationRenderOption: DecorationRenderOptions;

  constructor(data: DecorationFileDataChecked) {
    this.name = data.name;
    this.regex = data.regex;
    this.decorationRenderOption = {};
    for (const key of Object.keys(data)) {
      if (key !== "name" && key !== "regex") {
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
  editor: vscode.TextEditor;
  decorationTypes: DecorationType[];
  decorateFlag: boolean;

  constructor(editor: vscode.TextEditor, data: DecorationData[]) {
    this.editor = editor;
    this.decorationTypes = [];
    this.decorateFlag = false;

    for (const d of data) {
      this.decorationTypes.push(new DecorationType(d.regex, d.decorationRenderOption));
    }
  }

  decorate() {
    for (const decorationType of this.decorationTypes) {
      decorationType.decorate(this.editor);
    }
    this.decorateFlag = true;
  }

  undecorate() {
    for (const decorationType of this.decorationTypes) {
      decorationType.undecorate(this.editor);
    }
    this.decorateFlag = false;
  }

  dispose() {
    this.decorationTypes.forEach((decorationType) => {
      decorationType.dispose();
    });
    this.decorateFlag = false;
  }
}

class DecorateManeger {
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
    const re1 = /[^gimsu]+/g;
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
      array[index].regex = new RegExp(array[index].regex, DecorateManeger.checkFlag(array, index));
      delete array[index].regexFlag;
    } catch (error) {
      `${EXTENSION_NAME}: DecorationData[${index}](${array[index].name}) regex is invalid. ${array[index].regex}`;
      return false;
    }
    return true;
  }

  static checkData(data: any) {
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
      if (DecorateManeger.checkRegex(data, i) === false) {
        continue;
      }
      if (DecorateManeger.checkColor(data, i, "color") === false) {
        invalidFlag = true;
      }
      if (DecorateManeger.checkColor(data, i, "backgroundColor") === false) {
        invalidFlag = true;
      }
      if (DecorateManeger.checkColor(data, i, "borderColor") === false) {
        invalidFlag = true;
      }
      if (DecorateManeger.checkColor(data, i, "overviewRulerColor") === false) {
        invalidFlag = true;
      }
      if (DecorateManeger.checkRangeBehavior(data, i) === false) {
        invalidFlag = true;
      }
      if (DecorateManeger.checkOverviewRulerLane(data, i) === false) {
        invalidFlag = true;
      }
      if (invalidFlag === false) {
        result.push(data[i]);
      }
    }
    return result;
  }

  static async read(filePath: string): Promise<DecorationFileDataChecked[]> {
    let statusBar = vscode.window.setStatusBarMessage(DecorateManeger.ReadMessage);
    const text = await util.read(filePath).catch((err) => {
      vscode.window.showWarningMessage(`${EXTENSION_NAME}: ${err}`);
      return "[]";
    });
    let decorationData = util.parseJsonc(text);
    decorationData = DecorateManeger.checkData(decorationData);
    statusBar.dispose();
    vscode.window.setStatusBarMessage(DecorateManeger.ReadEndMessage, DecorateManeger.MessageTimeOut);
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

  add(editor: vscode.TextEditor): void {
    this.decorators.push(new Decorator(editor, this.decorationData));
  }

  delete(editorIndex: number): void {
    this.decorators[editorIndex].dispose();
    this.decorators.splice(editorIndex, 1);
  }

  find(editor: vscode.TextEditor): number {
    for (let i = 0; i < this.decorators.length; ++i) {
      if (this.decorators[i].editor === editor) {
        return i;
      }
    }
    return -1;
  }

  /**
   * 複数のEditorが同じTextDocumentを開いている可能性があるので配列を返す。
   * @param {vscode.TextDocument} document
   */
  findFromDocument(document: vscode.TextDocument): number[] {
    const result = [];
    for (let i = 0; i < this.decorators.length; ++i) {
      if (this.decorators[i].editor.document === document) {
        result.push(i);
      }
    }
    return result;
  }

  toggle(editor: vscode.TextEditor): void {
    let editorIndex = this.find(editor);
    if (editorIndex === -1) {
      this.add(editor);
      editorIndex = this.decorators.length - 1;
    }
    if (this.decorators[editorIndex].decorateFlag === true) {
      this.decorators[editorIndex].undecorate();
    } else {
      this.decorators[editorIndex].decorate();
    }
  }

  decorate(editor: vscode.TextEditor): void {
    let editorIndex = this.find(editor);
    if (editorIndex === -1) {
      this.add(editor);
      editorIndex = this.decorators.length - 1;
    }
    this.decorators[editorIndex].decorate();
  }

  undecorate(editor: vscode.TextEditor): void {
    const editorIndex = this.find(editor);
    if (editorIndex === -1) {
      return;
    }
    this.decorators[editorIndex].undecorate();
  }

  // need fix 全探索なので力任せ
  change(event: vscode.TextDocumentChangeEvent) {
    const editorIndices = this.findFromDocument(event.document);
    if (editorIndices.length === 0) {
      return;
    }
    for (const editorIndex of editorIndices) {
      if (this.decorators[editorIndex].decorateFlag === false && this.autoDecorate === false) {
        return;
      }
      this.decorators[editorIndex].undecorate();
      this.decorators[editorIndex].decorate();
    }
  }

  dispose(editors: vscode.TextEditor[]): void {
    let indices = [];

    for (const editor of editors) {
      const editorIndex = this.find(editor);
      if (editorIndex !== -1) {
        indices.push(editorIndex);
      }
    }
    const work = [];
    for (let i = 0; i < this.decorators.length; ++i) {
      if (indices.includes(i) === true) {
        work.push(this.decorators[i]);
      } else {
        this.decorators[i].dispose();
      }
    }
    this.decorators = work;
  }

  disposeAll(): void {
    this.decorators.forEach((decorator) => {
      decorator.dispose();
    });
    this.decorators = [];
  }

  info(sep = "\n") {
    let result = "";
    for (const decorator of this.decorators) {
      result += `${decorator.decorateFlag}, `;
      result += vscodeUtil.getEditorsInfo([decorator.editor]) + sep;
    }
    const re = new RegExp(`${sep}$`);
    result = result.replace(re, "");
    return result;
  }
}

export { DecorationFileData, DecorationFileDataChecked, DecorationType, Decorator, DecorationData, DecorateManeger };
