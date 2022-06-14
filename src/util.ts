import * as fs from "fs";
import * as jsonc from "jsonc-parser";

async function read(path: string): Promise<string> {
  let result = {};
  const promise: Promise<string> = new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
  return promise;
}

function parseJsonc(text: string): any {
  const obj: any = jsonc.parse(text);
  return obj;
}

/**
 * 配列から指定したindexを除いた配列を返す
 * @param array
 * @param indices
 */
function deleteIndices(array: any[], indices: number[]): any[] {
  const result = [];
  for (let i = 0; i < array.length; ++i) {
    if (indices.includes(i) === false) {
      result.push(array[i]);
    }
  }
  return result;
}

/**
 * 配列から指定したindexだけの配列を返す
 * @param array
 * @param indices
 */
function leaveIndices(array: any[], indices: number[]): any[] {
  const result = [];
  for (const index of indices) {
    result.push(array[index]);
  }
  return result;
}

/**
 * 重複を取り除くフィルタ
 * @param {any} e
 * @param {number} i
 * @param {any[]} arr
 */
function uniqueFilter(e: any, i: number, arr: any[]) {
  return arr.indexOf(e) === i;
}

/**
 * 正しい色指定かどうか
 * @param {string} string #RGB, #RGBA, #RRGGBB, #RRGGBBAA, colorName //cspell:disable-line
 */
function isColor(string: string): boolean {
  string = string.toLowerCase();
  if (string[0] === "#") {
    const re = /^#(?:(?:[0-9a-fA-F]{2}[0-9a-fA-F]{2}[0-9a-fA-F]{2}(?:[0-9a-fA-F]{2})?)|(?:[0-9a-fA-F][0-9a-fA-F][0-9a-fA-F](?:[0-9a-fA-F])?))$/;
    return re.test(string);
  }
  const colorNamesArray = [
    "AliceBlue",
    "AntiqueWhite",
    "Aqua",
    "Aquamarine",
    "Azure",
    "Beige",
    "Bisque",
    "Black",
    "BlanchedAlmond",
    "Blue",
    "BlueViolet",
    "Brown",
    "BurlyWood",
    "CadetBlue",
    "Chartreuse",
    "Chocolate",
    "Coral",
    "CornflowerBlue",
    "Cornsilk",
    "Crimson",
    "Cyan",
    "DarkBlue",
    "DarkCyan",
    "DarkGoldenRod",
    "DarkGray",
    "DarkGrey",
    "DarkGreen",
    "DarkKhaki",
    "DarkMagenta",
    "DarkOliveGreen",
    "Darkorange",
    "DarkOrchid",
    "DarkRed",
    "DarkSalmon",
    "DarkSeaGreen",
    "DarkSlateBlue",
    "DarkSlateGray",
    "DarkSlateGrey",
    "DarkTurquoise",
    "DarkViolet",
    "DeepPink",
    "DeepSkyBlue",
    "DimGray",
    "DimGrey",
    "DodgerBlue",
    "FireBrick",
    "FloralWhite",
    "ForestGreen",
    "Fuchsia",
    "Gainsboro",
    "GhostWhite",
    "Gold",
    "GoldenRod",
    "Gray",
    "Grey",
    "Green",
    "GreenYellow",
    "HoneyDew",
    "HotPink",
    "IndianRed",
    "Indigo",
    "Ivory",
    "Khaki",
    "Lavender",
    "LavenderBlush",
    "LawnGreen",
    "LemonChiffon",
    "LightBlue",
    "LightCoral",
    "LightCyan",
    "LightGoldenRodYellow",
    "LightGray",
    "LightGrey",
    "LightGreen",
    "LightPink",
    "LightSalmon",
    "LightSeaGreen",
    "LightSkyBlue",
    "LightSlateGray",
    "LightSlateGrey",
    "LightSteelBlue",
    "LightYellow",
    "Lime",
    "LimeGreen",
    "Linen",
    "Magenta",
    "Maroon",
    "MediumAquaMarine",
    "MediumBlue",
    "MediumOrchid",
    "MediumPurple",
    "MediumSeaGreen",
    "MediumSlateBlue",
    "MediumSpringGreen",
    "MediumTurquoise",
    "MediumVioletRed",
    "MidnightBlue",
    "MintCream",
    "MistyRose",
    "Moccasin",
    "NavajoWhite",
    "Navy",
    "OldLace",
    "Olive",
    "OliveDrab",
    "Orange",
    "OrangeRed",
    "Orchid",
    "PaleGoldenRod",
    "PaleGreen",
    "PaleTurquoise",
    "PaleVioletRed",
    "PapayaWhip",
    "PeachPuff",
    "Peru",
    "Pink",
    "Plum",
    "PowderBlue",
    "Purple",
    "Red",
    "RosyBrown",
    "RoyalBlue",
    "SaddleBrown",
    "Salmon",
    "SandyBrown",
    "SeaGreen",
    "SeaShell",
    "Sienna",
    "Silver",
    "SkyBlue",
    "SlateBlue",
    "SlateGray",
    "SlateGrey",
    "Snow",
    "SpringGreen",
    "SteelBlue",
    "Tan",
    "Teal",
    "Thistle",
    "Tomato",
    "Turquoise",
    "Violet",
    "Wheat",
    "White",
    "WhiteSmoke",
    "Yellow",
    "YellowGreen",
  ];
  const colorNames = colorNamesArray.join("|").toLowerCase();
  const re = new RegExp(colorNames);
  return re.test(string);
}

////////////////////////////////////////////////////////////////////////////////
// export
////////////////////////////////////////////////////////////////////////////////

export { read, parseJsonc, uniqueFilter, isColor };
