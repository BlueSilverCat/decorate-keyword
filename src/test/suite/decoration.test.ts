import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import { getConfig, setConfig, vsDeleteLine, vsInsertLine } from "../../vscodeUtil";

import {
  DecorationFileData,
  DecorationFileDataChecked,
  DecorationType,
  DecorationData,
  Decorator,
  DecorateManager,
} from "../../decoration";

const NAME = "decorateKeyword";
const CONFIGS = ["definitionFilePath", "autoDecorate"];
let ROOT_URI = "";
if (typeof vscode.workspace.workspaceFolders !== "undefined") {
  ROOT_URI = vscode.workspace.workspaceFolders[0].uri.fsPath;
}

const TEST_CONFIG = {
  definitionFilePath: path.join(ROOT_URI, "test01.jsonc"),
  autoDecorate: false,
};

const DATA01: DecorationFileData = {
  name: "test01",
  regex: "test01",
  regexFlag: "g",
  color: "#ff0000",
  backgroundColor: "#0000ff",
};

const DATA01_CHECKED: DecorationFileDataChecked = {
  name: "test01",
  regex: /test01/g,
  languageId: ["*"],
  color: "#ff0000",
  backgroundColor: "#0000ff",
};

const DATA01_OPTION: vscode.DecorationRenderOptions = {
  color: "#ff0000",
  backgroundColor: "#0000ff",
};

const DATA02: DecorationFileData = {
  name: "test02",
  regex: "test02",
  regexFlag: "g",
  color: "red",
  backgroundColor: "blue",
  borderColor: "green",
  outlineColor: "yellow",
};

const DATA02_CHECKED: DecorationFileDataChecked = {
  name: "test02",
  regex: /test02/g,
  languageId: ["*"],
  color: "red",
  backgroundColor: "blue",
  borderColor: "green",
  outlineColor: "yellow",
};

const DATA02_OPTION: vscode.DecorationRenderOptions = {
  color: "red",
  backgroundColor: "blue",
  borderColor: "green",
  outlineColor: "yellow",
};

const TEST01 = [
  {
    name: "test01",
    regex: /function/g,
    languageId: ["*"],
    color: "#ff0000",
    backgroundColor: "#00ffff",
  },
  {
    name: "test02",
    regex: /return/g,
    languageId: ["*"],
    color: "#00ff00",
    backgroundColor: "#ff00ff",
  },
];

const TEST01_DECORATION_DATA: DecorationData[] = [new DecorationData(TEST01[0]), new DecorationData(TEST01[1])];

const TEST05 = [
  {
    name: "name",
    regex: /name/g,
    languageId: ["*"],
    color: "#0000ff", // ColorName, #RGB, #RGBA, #RRGGBB, #RRGGBBAA
    backgroundColor: "#ff0000", // ColorName, #RGB, #RGBA, #RRGGBB, #RRGGBBAA
    border: "solid thin blue",
    borderColor: "#00ff00", // ColorName, #RGB, #RGBA, #RRGGBB, #RRGGBBAA
    borderRadius: "50px 50px 50px 50px / 50px 50px 50px 50px",
    borderSpacing: "100px",
    borderStyle: "solid", // none, hidden, solid, double, groove, ridge, inset, outset, dashed, dotted
    borderWidth: "1px", // number, thin, medium, thick
    cursor: "crosshair",
    fontStyle: "italic", // normal, italic, oblique
    fontWeight: "400", // normal, bold, lighter, bolder
    gutterIconPath: "C:\\Users\\blues\\Documents\\test.png",
    gutterIconSize: "auto",
    isWholeLine: true, // true, false
    letterSpacing: "10px", // normal
    opacity: "1.0",
    outline: "solid thick red", //  [none, hidden, solid, double, groove, ridge, inset, outset, dashed, dotted], [number, thin, medium, thick] [color]
    outlineColor: "#0000ff", // ColorName, #RGB, #RGBA, #RRGGBB, #RRGGBBAA
    outlineStyle: "dashed", // none, hidden, solid, double, groove, ridge, inset, outset, dashed, dotted
    outlineWidth: "5px", // number, thin, medium, thick
    overviewRulerColor: "red", // ColorName, #RGB, #RGBA, #RRGGBB, #RRGGBBAA
    overviewRulerLane: 1,
    rangeBehavior: 1, // "ClosedClosed", "ClosedOpen", "OpenClosed", "OpenOpen"
    textDecoration: "underline double red", // [none, underline, overline, blink] [solid, double, dotted, dashed, wavy] [color]
  },
];

const INVALID_DATA01: DecorationFileData = {
  name: "invalidData01",
  regex: "invalidData01",
  regexFlag: "g",
  languageId: ["*"],
  color: "cat",
  backgroundColor: "#ggg",
  borderColor: "123",
  outlineColor: "#1234567890",
};

async function getEditor(fileName: string) {
  const document = await vscode.workspace.openTextDocument(path.join(ROOT_URI, fileName));
  const editor = await vscode.window.showTextDocument(document);
  return editor;
}

describe("decoration Test Suite", () => {
  let editor: vscode.TextEditor;
  let currentConfig: any;
  before(async function () {
    currentConfig = getConfig(NAME, CONFIGS);
    await setConfig(NAME, TEST_CONFIG);
  });
  after(async function () {
    await setConfig(NAME, currentConfig);
  });

  beforeEach(async function () {
    editor = await getEditor("test01.jsonc");
  });
  afterEach(async function () {
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  describe("DecorationData", function () {
    describe("constructor", function () {
      it("test01", function () {
        const rd = new DecorationData(DATA01_CHECKED);
        assert.strictEqual(rd.name, "test01");
        assert.deepStrictEqual(rd.regex, /test01/g);
        assert.deepStrictEqual(rd.decorationRenderOption, DATA01_OPTION);
      });
      it("test02", function () {
        const rd = new DecorationData(DATA02_CHECKED);
        assert.strictEqual(rd.name, "test02");
        assert.deepStrictEqual(rd.regex, /test02/g);
        assert.deepStrictEqual(rd.decorationRenderOption, DATA02_OPTION);
      });
    });
  });

  describe("DecorationType", function () {
    describe("constructor", function () {
      it("test01", function () {
        const regex = DATA01_CHECKED.regex;
        //const decorationType = vscode.window.createTextEditorDecorationType(DATA01_OPTION);
        const rdt = new DecorationType(regex, DATA01_OPTION);
        assert.deepStrictEqual(rdt.regex, regex);
        //assert.deepStrictEqual(rdt.decorationType, decorationType);
        assert.deepStrictEqual(rdt.ranges, []);
      });
    });

    describe("setRanges", function () {
      it("test", function () {
        const regex = DATA01_CHECKED.regex;
        const range = new vscode.Range(2, 13, 2, 19);
        //const decorationType = vscode.window.createTextEditorDecorationType(DATA01_OPTION);
        const rdt = new DecorationType(regex, DATA01_OPTION);
        if (typeof editor === "undefined") {
          assert.fail();
        }
        rdt.setRanges(editor);
        assert.deepStrictEqual(rdt.regex, regex);
        //assert.deepStrictEqual(rdt.decorationType, decorationType);
        assert.deepStrictEqual(rdt.ranges, [range]);
      });
    });

    describe("decorate 目視確認", function () {
      it("test", async function () {
        this.timeout(0);
        const regex = DATA01_CHECKED.regex;
        const range = new vscode.Range(2, 13, 2, 19);
        const rdt = new DecorationType(regex, DATA01_OPTION);
        if (typeof editor === "undefined") {
          assert.fail();
        }
        rdt.decorate(editor);
        assert.deepStrictEqual(rdt.regex, regex);
        assert.deepStrictEqual(rdt.ranges, [range]);
        const input = await vscode.window.showInputBox({ prompt: "decorate" });
        assert.strictEqual(input, "ok");
      });
    });

    describe("undecorate 目視確認", function () {
      it("test", async function () {
        this.timeout(0);
        const regex = DATA01_CHECKED.regex;
        const range = new vscode.Range(2, 13, 2, 19);
        const rdt = new DecorationType(regex, DATA01_OPTION);
        if (typeof editor === "undefined") {
          assert.fail();
        }
        rdt.decorate(editor);
        let input = await vscode.window.showInputBox({ prompt: "decorate" });
        assert.strictEqual(input, "ok");
        rdt.undecorate(editor);
        input = await vscode.window.showInputBox({ prompt: "undecorate" });
        assert.strictEqual(input, "ok");
        assert.deepStrictEqual(rdt.regex, regex);
        assert.deepStrictEqual(rdt.ranges, []);
      });
    });

    describe("dispose 目視確認", function () {
      it("test", async function () {
        this.timeout(0);
        const regex = DATA01_CHECKED.regex;
        const range = new vscode.Range(2, 13, 2, 19);
        const rdt = new DecorationType(regex, DATA01_OPTION);
        if (typeof editor === "undefined") {
          assert.fail();
        }
        rdt.decorate(editor);
        let input = await vscode.window.showInputBox({ prompt: "decorate" });
        assert.strictEqual(input, "ok");
        rdt.dispose();
        input = await vscode.window.showInputBox({ prompt: "dispose" });
        assert.strictEqual(input, "ok");
        assert.deepStrictEqual(rdt.regex, regex);
        assert.deepStrictEqual(rdt.ranges, []);
      });
    });
  });

  describe("Decorator", function () {
    let rd: DecorationData[];
    beforeEach(function () {
      rd = [new DecorationData(DATA01_CHECKED), new DecorationData(DATA02_CHECKED)];
    });

    describe("constructor", function () {
      it("test", function () {
        if (typeof editor === "undefined") {
          assert.fail();
        }
        const d = new Decorator(editor.document.uri, editor.document.languageId, rd);
        assert.deepStrictEqual(d.documentUri, editor.document.uri);
        assert.deepStrictEqual(d.languageId, editor.document.languageId);
        assert.strictEqual(d.decorationTypes.length, 2);
        assert.strictEqual(d.decorateFlag, -1);
      });
    });

    describe("decorate 目視確認", function () {
      it("test", async function () {
        if (typeof editor === "undefined") {
          assert.fail();
        }
        this.timeout(0);
        const d = new Decorator(editor.document.uri, editor.document.languageId, rd);
        d.decorate([editor]);
        assert.strictEqual(d.decorateFlag, 1);
        let input = await vscode.window.showInputBox({ prompt: "decorate" });
        assert.strictEqual(input, "ok");
      });
    });

    describe("undecorate 目視確認", function () {
      it("test", async function () {
        if (typeof editor === "undefined") {
          assert.fail();
        }
        this.timeout(0);
        const d = new Decorator(editor.document.uri, editor.document.languageId, rd);
        d.decorate([editor]);
        assert.strictEqual(d.decorateFlag, 1);
        let input = await vscode.window.showInputBox({ prompt: "decorate" });
        assert.strictEqual(input, "ok");
        d.undecorate([editor]);
        assert.strictEqual(d.decorateFlag, 0);
        input = await vscode.window.showInputBox({ prompt: "undecorate" });
        assert.strictEqual(input, "ok");
      });
    });

    describe("dispose 目視確認", function () {
      it("test", async function () {
        if (typeof editor === "undefined") {
          assert.fail();
        }
        this.timeout(0);
        const d = new Decorator(editor.document.uri, editor.document.languageId, rd);
        d.decorate([editor]);
        assert.strictEqual(d.decorateFlag, 1);
        let input = await vscode.window.showInputBox({ prompt: "decorate" });
        assert.strictEqual(input, "ok");
        d.dispose();
        assert.strictEqual(d.decorateFlag, -1);
        input = await vscode.window.showInputBox({ prompt: "dispose" });
        assert.strictEqual(input, "ok");
      });
    });
  });

  describe("DecorateManager", function () {
    describe("constructor", function () {
      it("test", function () {
        const dm = new DecorateManager();
        assert.strictEqual(dm.decorationData.length, 0);
        assert.strictEqual(dm.decorators.length, 0);
        assert.strictEqual(dm.definitionFilePath, "");
        assert.strictEqual(dm.autoDecorate, false);
      });
    });

    describe("checkColor", function () {
      it("true", function () {
        const data = [DATA01, DATA02];
        let actual = DecorateManager.checkColor(data, 0, "color");
        assert.strictEqual(actual, true);
        actual = DecorateManager.checkColor(data, 0, "backgroundColor");
        assert.strictEqual(actual, true);
        actual = DecorateManager.checkColor(data, 0, "caaat"); // 無い場合はtrueを返す
        assert.strictEqual(actual, true);

        actual = DecorateManager.checkColor(data, 1, "color");
        assert.strictEqual(actual, true);
        actual = DecorateManager.checkColor(data, 1, "backgroundColor");
        assert.strictEqual(actual, true);
        actual = DecorateManager.checkColor(data, 1, "borderColor");
        assert.strictEqual(actual, true);
        actual = DecorateManager.checkColor(data, 1, "outlineColor");
        assert.strictEqual(actual, true);
      });

      it("false", function () {
        const data = [INVALID_DATA01];
        assert.strictEqual(DecorateManager.checkColor(data, 0, "color"), false);
        assert.strictEqual(DecorateManager.checkColor(data, 0, "backgroundColor"), false);
        assert.strictEqual(DecorateManager.checkColor(data, 0, "borderColor"), false);
        assert.strictEqual(DecorateManager.checkColor(data, 0, "outlineColor"), false);
      });
    });

    describe("checkRangeBehavior", function () {
      it("test", function () {
        const data = [
          { rangeBehavior: 0 },
          { rangeBehavior: 1 },
          { rangeBehavior: 2 },
          { rangeBehavior: 3 },
          { rangeBehavior: 4 },
          { rangeBehavior: "OpenOpen" },
          { rangeBehavior: "OpenClosed" },
          { rangeBehavior: "ClosedOpen" },
          { rangeBehavior: "ClosedClosed" },
          { rangeBehavior: "cat" },
        ];
        const checked = [
          { rangeBehavior: 0 },
          { rangeBehavior: 1 },
          { rangeBehavior: 2 },
          { rangeBehavior: 3 },
          { rangeBehavior: 4 },
          { rangeBehavior: 0 },
          { rangeBehavior: 2 },
          { rangeBehavior: 3 },
          { rangeBehavior: 1 },
          { rangeBehavior: "cat" },
        ];
        assert.strictEqual(DecorateManager.checkRangeBehavior(data, 0), true);
        assert.strictEqual(DecorateManager.checkRangeBehavior(data, 1), true);
        assert.strictEqual(DecorateManager.checkRangeBehavior(data, 2), true);
        assert.strictEqual(DecorateManager.checkRangeBehavior(data, 3), true);
        assert.strictEqual(DecorateManager.checkRangeBehavior(data, 4), false);
        assert.strictEqual(DecorateManager.checkRangeBehavior(data, 5), true);
        assert.strictEqual(DecorateManager.checkRangeBehavior(data, 6), true);
        assert.strictEqual(DecorateManager.checkRangeBehavior(data, 7), true);
        assert.strictEqual(DecorateManager.checkRangeBehavior(data, 8), true);
        assert.strictEqual(DecorateManager.checkRangeBehavior(data, 9), false);
        assert.deepStrictEqual(data, checked);
      });
    });

    describe("checkOverviewRulerLane", function () {
      it("test", function () {
        const data = [
          { overviewRulerLane: 1 },
          { overviewRulerLane: 2 },
          { overviewRulerLane: 4 },
          { overviewRulerLane: 7 },
          { overviewRulerLane: 0 },
          { overviewRulerLane: "Left" },
          { overviewRulerLane: "Center" },
          { overviewRulerLane: "Right" },
          { overviewRulerLane: "Full" },
          { overviewRulerLane: "cat" },
        ];
        const checked = [
          { overviewRulerLane: 1 },
          { overviewRulerLane: 2 },
          { overviewRulerLane: 4 },
          { overviewRulerLane: 7 },
          { overviewRulerLane: 0 },
          { overviewRulerLane: 1 },
          { overviewRulerLane: 2 },
          { overviewRulerLane: 4 },
          { overviewRulerLane: 7 },
          { overviewRulerLane: "cat" },
        ];
        assert.strictEqual(DecorateManager.checkOverviewRulerLane(data, 0), true);
        assert.strictEqual(DecorateManager.checkOverviewRulerLane(data, 1), true);
        assert.strictEqual(DecorateManager.checkOverviewRulerLane(data, 2), true);
        assert.strictEqual(DecorateManager.checkOverviewRulerLane(data, 3), true);
        assert.strictEqual(DecorateManager.checkOverviewRulerLane(data, 4), false);
        assert.strictEqual(DecorateManager.checkOverviewRulerLane(data, 5), true);
        assert.strictEqual(DecorateManager.checkOverviewRulerLane(data, 6), true);
        assert.strictEqual(DecorateManager.checkOverviewRulerLane(data, 7), true);
        assert.strictEqual(DecorateManager.checkOverviewRulerLane(data, 8), true);
        assert.strictEqual(DecorateManager.checkOverviewRulerLane(data, 9), false);
        assert.deepStrictEqual(data, checked);
      });
    });

    describe("checkFlag", function () {
      it("test", function () {
        const data = [
          { regexFlag: "g" },
          { regexFlag: "gimsu" },
          { regexFlag: "gimsuy" },
          { regexFlag: "cat" },
          { regexFlag: "" },
        ];
        const checked = ["g", "gimsu", "gimsu", "g", "g"];
        assert.strictEqual(DecorateManager.checkFlag(data, 0), checked[0]);
        assert.strictEqual(DecorateManager.checkFlag(data, 1), checked[1]);
        assert.strictEqual(DecorateManager.checkFlag(data, 2), checked[2]);
        assert.strictEqual(DecorateManager.checkFlag(data, 3), checked[3]);
        assert.strictEqual(DecorateManager.checkFlag(data, 4), checked[4]);
      });
    });

    describe("checkRegex", function () {
      it("test", function () {
        const data = [
          {
            regex: "test01",
            regexFlag: "g",
          },
          {
            regex: "[0-9]+",
            regexFlag: "g",
          },
          {
            regex: "\\d+",
            regexFlag: "g",
          },
          {
            regex: "\\[0-9\\+",
            regexFlag: "g",
          },
          {
            regex: "[0-9+",
            regexFlag: "g",
          },
        ];
        const checked = [
          {
            regex: /test01/g,
          },
          {
            regex: /[0-9]+/g,
          },
          {
            regex: /\d+/g,
          },
          {
            regex: /\[0-9\+/g,
          },
          {
            regex: "[0-9+",
            regexFlag: "g",
          },
        ];
        assert.strictEqual(DecorateManager.checkRegex(data, 0), true);
        assert.strictEqual(DecorateManager.checkRegex(data, 1), true);
        assert.strictEqual(DecorateManager.checkRegex(data, 2), true);
        assert.strictEqual(DecorateManager.checkRegex(data, 3), true);
        assert.strictEqual(DecorateManager.checkRegex(data, 4), false);
        assert.deepStrictEqual(data, checked);
      });
    });

    describe("checkData", function () {
      it("ok", async function () {
        const data = [Object.assign({}, DATA01), Object.assign({}, DATA02)];
        const checked = [DATA01_CHECKED, DATA02_CHECKED];
        const actual = await DecorateManager.checkData(data);
        assert.deepStrictEqual(actual, checked);
      });

      it("fail01", async function () {
        const data = {};
        const checked: any[] = [];
        const actual = await DecorateManager.checkData(data);
        assert.deepStrictEqual(actual, checked);
      });
      it("fail02", async function () {
        const data = [Object.assign({}, DATA01), Object.assign({}, INVALID_DATA01)];
        const checked = [DATA01_CHECKED];
        const actual = await DecorateManager.checkData(data);
        assert.deepStrictEqual(actual, checked);
      });
    });

    describe("read", function () {
      it("test01", async function () {
        const data = await DecorateManager.read(path.join(ROOT_URI, "test01.jsonc"));
        assert.strictEqual(data.length, 2);
        assert.deepStrictEqual(data, TEST01);
      });
      it("test02", async function () {
        const data = await DecorateManager.read(path.join(ROOT_URI, "test05.jsonc"));
        assert.strictEqual(data.length, 1);
        assert.deepStrictEqual(data, TEST05);
      });
    });

    describe("getConfig", function () {
      it("test", function () {
        const dm = new DecorateManager();
        dm.getConfig();
        assert.strictEqual(dm.definitionFilePath, path.join(ROOT_URI, "test01.jsonc"));
        assert.strictEqual(dm.autoDecorate, false);
      });
    });

    describe("setDecorationData", function () {
      it("test", function () {
        const dm = new DecorateManager();
        dm.setDecorationData(TEST01);
        for (let i = 0; i < dm.decorationData.length; ++i) {
          assert.deepStrictEqual(dm.decorationData[i], TEST01_DECORATION_DATA[i]);
        }
      });
    });

    describe("add", function () {
      it("test", function () {
        const dm = new DecorateManager();
        dm.setDecorationData(TEST01);
        dm.add(editor.document);
        assert.strictEqual(dm.decorators.length, 1);
        assert.deepStrictEqual(dm.decorators[0].decorateFlag, -1);
        assert.deepStrictEqual(dm.decorators[0].decorationTypes.length, 2);
      });
    });

    describe("delete", function () {
      it("test", function () {
        const dm = new DecorateManager();
        dm.setDecorationData(TEST01);
        dm.add(editor.document);
        dm.delete(0);
        assert.strictEqual(dm.decorators.length, 0);
      });
    });

    describe("findFromDocument", function () {
      it("test", function () {
        const dm = new DecorateManager();
        dm.setDecorationData(TEST01);
        dm.add(editor.document);
        assert.deepStrictEqual(dm.findFromDocument(editor.document), [0]);
      });
    });

    describe("toggle 目視確認", function () {
      it("test", async function () {
        this.timeout(0);
        const dm = new DecorateManager();
        dm.setDecorationData(TEST01);
        dm.add(editor.document);
        dm.toggle(editor.document);
        let input = await vscode.window.showInputBox({ prompt: "toggle(decorate)" });
        assert.strictEqual(input, "ok");
        dm.toggle(editor.document);
        input = await vscode.window.showInputBox({ prompt: "toggle(undecorate)" });
        assert.strictEqual(input, "ok");
      });
    });

    describe("decorate 目視確認", function () {
      it("test", async function () {
        this.timeout(0);
        const dm = new DecorateManager();
        dm.setDecorationData(TEST01);
        dm.add(editor.document);
        dm.decorate(editor.document);
        let input = await vscode.window.showInputBox({ prompt: "decorate" });
        assert.strictEqual(input, "ok");
      });
    });

    describe("undecorate 目視確認", function () {
      it("test", async function () {
        this.timeout(0);
        const dm = new DecorateManager();
        dm.setDecorationData(TEST01);
        dm.add(editor.document);
        dm.decorate(editor.document);
        let input = await vscode.window.showInputBox({ prompt: "decorate" });
        assert.strictEqual(input, "ok");
        dm.undecorate(editor.document);
        input = await vscode.window.showInputBox({ prompt: "undecorate" });
        assert.strictEqual(input, "ok");
      });
    });

    describe("change 目視確認", function () {
      it("auto off", async function () {
        this.timeout(0);
        const dm = new DecorateManager();
        dm.setDecorationData(TEST01);
        dm.add(editor.document);
        dm.decorate(editor.document);
        let input = await vscode.window.showInputBox({ prompt: "decorate" });
        assert.strictEqual(input, "ok");

        await vsInsertLine(editor.document, 0, "function");
        // await vscode.commands.executeCommand("workbench.action.files.save");
        dm.keep(editor.document);
        input = await vscode.window.showInputBox({ prompt: "keep decorate" });
        assert.strictEqual(input, "ok");

        // await vsDeleteLine(editor.document, 0);
        // await vscode.commands.executeCommand("workbench.action.files.save");
      });

      it("auto on decorate", async function () {
        this.timeout(0);
        // await setConfig(NAME, { autoDecorate: true });
        const dm = new DecorateManager();
        dm.getConfig();
        dm.autoDecorate = true;
        dm.setDecorationData(TEST01);
        dm.add(editor.document);
        dm.keep(editor.document);

        let input = await vscode.window.showInputBox({ prompt: "auto decorate" });
        assert.strictEqual(input, "ok");

        await vsInsertLine(editor.document, 0, "function");
        dm.keep(editor.document);
        // await vscode.commands.executeCommand("workbench.action.files.save");
        input = await vscode.window.showInputBox({ prompt: "keep decorate" });
        assert.strictEqual(input, "ok");

        await vsDeleteLine(editor.document, 0);
        dm.keep(editor.document);
        // await vscode.commands.executeCommand("workbench.action.files.save");

        // await setConfig(NAME, { autoDecorate: false });
      });

      it("auto on undecorate", async function () {
        this.timeout(0);
        // await setConfig(NAME, { autoDecorate: true });
        const dm = new DecorateManager();
        dm.getConfig();
        dm.autoDecorate = true;
        dm.setDecorationData(TEST01);
        dm.add(editor.document);
        dm.keep(editor.document);

        let input = await vscode.window.showInputBox({ prompt: "auto decorate" });
        assert.strictEqual(input, "ok");

        dm.undecorate(editor.document);
        input = await vscode.window.showInputBox({ prompt: "undecorate" });
        assert.strictEqual(input, "ok");

        await vsInsertLine(editor.document, 0, "function");
        dm.keep(editor.document);
        // await vscode.commands.executeCommand("workbench.action.files.save");
        input = await vscode.window.showInputBox({ prompt: "keep decorate" });
        assert.strictEqual(input, "ok");

        // await vsDeleteLine(editor.document, 0);
        // await vscode.commands.executeCommand("workbench.action.files.save");

        // await setConfig(NAME, { autoDecorate: false });
      });
    });

    describe("dispose", function () {
      it("test", async function () {
        this.timeout(0);
        const dm = new DecorateManager();
        dm.getConfig();
        dm.setDecorationData(TEST01);
        dm.add(editor.document);
        dm.decorate(editor.document);
        let input = await vscode.window.showInputBox({ prompt: "decorate" });
        assert.strictEqual(input, "ok");
        dm.dispose(editor.document);
        input = await vscode.window.showInputBox({ prompt: "undecorate" });
        assert.strictEqual(input, "ok");
        assert.strictEqual(dm.decorators.length, 0);
      });
    });

    describe("disposeAll", function () {
      it("test", async function () {
        this.timeout(0);
        const dm = new DecorateManager();
        dm.getConfig();
        dm.setDecorationData(TEST01);
        dm.add(editor.document);
        dm.decorate(editor.document);
        let input = await vscode.window.showInputBox({ prompt: "decorate" });
        assert.strictEqual(input, "ok");
        dm.disposeAll();
        input = await vscode.window.showInputBox({ prompt: "undecorate" });
        assert.strictEqual(input, "ok");
        assert.strictEqual(dm.decorators.length, 0);
      });
    });
  });
});