# decorate-keyword README

This extension decorate(hightlight) registered keywords.  
May be useful if:

- When using VS code as custom file viewer.
- When need temporary syntax highlighting colors.
- When need background colors.
- etc.

![undecorate](https://raw.githubusercontent.com/BlueSilverCat/decorate-keyword/image/image/undecorate.png)
![decorate](https://raw.githubusercontent.com/BlueSilverCat/decorate-keyword/image/image/decorate.png)

## Features

- Decorate registered keywords.

## How to use

1. Set `definitionFilePath`.  
   Specify JSONC file path that defined the keywords.  
   e.g.

```jsonc
[
  {
    "name": "function",
    "regex": "\\bfunction\\b",
    "regexFlag": "g",
    "color": "#ff00ff",
    "backgroundColor": "#ffff00",
    "isWholeLine": true
  },
  {
    "name": "return",
    "regex": "\\breturn\\b",
    "regexFlag": "g",
    "color": "#ff0000",
    "backgroundColor": "#00ffff"
  },
  {
    "name": "blockComment",
    "regex": "/\\*[\\S\\s]+?\\*/",
    "regexFlag": "g",
    "color": "#00ff0055",
    "backgroundColor": "#ff000055"
  },
  {
    "name": "Japanese",
    "regex": "[\\p{scx=Hira}\\p{scx=Kana}\\p{scx=Han}]+",
    "regexFlag": "gu",
    "color": "black",
    "backgroundColor": "black",
    "border": "solid 1px red"
  }
]
```

2. Use `DecorateKeyword: decorate` command.

If you change `definitionFilePath`, it will be detected automatically.  
But you change the contents of `definitionFilePath`, you need to use `DecorateKeyword: read` command.

## About Definition File

```jsonc
[
  {
    "name": "Important Keywords",
    "regex": "\\b[Rr]ed[Cc]at\\b",
    "regexFlag": "g",
    "color": "red",
    "backgroundColor": "black"
  }
]
```

The Definition File is JSONC file format.  
It require one Array.  
The elements of the Array are any number of objects.  
The objects require properties as below.

- `name`: String. Any name.  
  e.g. `"name": "Important Keywords"`
- `regex`: String. It represents JavaScript Regular expressions.  
  More detail see [Regular Expressions Cheatsheet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Cheatsheet)  
  e.g. `"regex": "\\b[Rr]ed[Cc]at\\b"`
- `regexFlag`: String. It represents JavaScript Regular expressions optional flags.  
  More detail see [Advanced searching with flags](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)  
  Always required `g` flag.  
  `y` flag is invalid.  
  e.g. `"regexFlag": "gi"`

The objects can also have properties as below.

These properties represent:  
CSS styling property that will be applied to text enclosed by a decoration.  
More detail see [CSS reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference)

- `color`: String. See [Color formats](#Color_formats) for valid values.
- `backgroundColor`: String. Background color of the decoration. Use rgba() and define transparent background colors to play well with other .decorations.  
  See [Color formats](#Color_formats) for valid values.
- `border`: String. e.g. "solid thin blue"
- `borderColor`: String.  
  See [Color formats](#Color_formats) for valid values.
- `borderRadius`: String. e.g. "50px 50px 50px 50px / 50px 50px 50px 50px"
- `borderSpacing`: String. e.g. "10px".  
  See [CSS values and units](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Values_and_Units)
- `borderStyle`: String. Available value are "none", "hidden", "solid", "double", "groove", "ridge", "inset", "outset", "dashed", "dotted", ...
- `borderWidth`: String. e.g. "10px".
  See [CSS values and units](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Values_and_Units)
- `cursor`: String. See [Cursor](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor)
- `fontStyle`: String. Available values are "normal", "italic", "oblique", ...
- `fontWeight`: String. Available value are "nomal", "bold", "lighter", "bolder" ...
- `letterSpacing`: String. e.g. "10px".  
  See [CSS values and units](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Values_and_Units)
- `opacity`: String. Available value are between "0.0" and "1.0".
- `outline`: String. e.g "solid thick red"
- `outlineColor`: String. See [Color formats](#Color_formats) for valid values.
- `outlineStyle`: String. Available value are "none", "hidden", "solid", "double", "groove", "ridge", "inset", "outset", "dashed", "dotted", ...
- `outlineWidth`: String. Available value are "thin", "medium", "thick" , ...
- `textDecoration`: String. e.g. "underline double red". "none", "underline", "overline", "blinek". "solid", "double", "dotted", "dashed", "wavy".

* `gutterIconPath`: String. An absolute path to an image to be rendered in the gutter
* `gutterIconSize`: String. Specifies the size of the gutter icon.  
  Available values are 'auto', 'contain', 'cover' and any percentage value.
* `isWholeLine`: Boolen. Should the decoration be rendered also on the whitespace after the line text. `true` or `false`
* `overviewRulerColor`: String. The color of the decoration in the overview ruler.  
  See [Color formats](#Color_formats) for valid values.
* `overviewRulerLane`: String or Number. The position in the overview ruler where the decoration should be rendered.  
  Available value are "Center", 2, "Full", 7, "Left", 1, "Right", 4.
* `rangeBehavior`: String or Number. Customize the growing behavior of the decoration when edits occur at the edges of the decoration's range.  
  Available value are "OpenOpen", 0, "ClosedClosed", 1, "OpenClosed", 2, "ClosedOpen", 3.

More detail see [vscode-api#DecorationRenderOption](https://code.visualstudio.com/api/references/vscode-api#DecorationRenderOptions)  
Also `after`, `before`, `dark` and `light` will work.

### Sample

```jsonc
[
  {
    "name": "name",
    "regex": "name",
    "regexFlag": "g", // valid flags are "gimsu"
    "color": "#0000ff", // ColorName, #RGB, #RGBA, #RRGGBB, #RRGGBBAA
    "backgroundColor": "#ff0000", // ColorName, #RGB, #RGBA, #RRGGBB, #RRGGBBAA
    "border": "solid thin blue",
    "borderColor": "#00ff00", // ColorName, #RGB, #RGBA, #RRGGBB, #RRGGBBAA
    "borderRadius": "50px 50px 50px 50px / 50px 50px 50px 50px",
    "borderSpacing": "10px",
    "borderStyle": "solid", // none, hidden, solid, double, groove, ridge, inset, outset, dashed, dotted
    "borderWidth": "10px", // number, thin, medium, thick
    "cursor": "crosshair",
    "fontStyle": "italic", // normal, italic, oblique
    "fontWeight": "400", // normal, bold, lighter, bolder
    "gutterIconPath": "",
    "gutterIconSize": "10px",
    "isWholeLine": true, // true, false
    "letterSpacing": "10px", // normalr
    "opacity": "1.0",
    "outline": "solid thick red", //  [none, hidden, solid, double, groove, ridge, inset, outset, dashed, dotted], [number, thin, medium, thick] [color]
    "outlineColor": "#0000ff", // ColorName, #RGB, #RGBA, #RRGGBB, #RRGGBBAA
    "outlineStyle": "dashed", // none, hidden, solid, double, groove, ridge, inset, outset, dashed, dotted
    "outlineWidth": "5px", // number, thin, medium, thick
    "overviewRulerColor": "#ff00ff", // ColorName, #RGB, #RGBA, #RRGGBB, #RRGGBBAA
    "overviewRulerLane": "Center", // "Center"=2, "Full"=7, "Left"=1, "Right"=4
    "rangeBehavior": "ClosedClosed", // "OpenOpen"=0, "ClosedClosed"=1, "OpenClosed"=2, "ClosedOpen"=3
    "textDecoration": "underline double red" // [none, underline, overline, blinek] [solid, double, dotted, dashed, wavy] [color]
  }
]
```

### About backslash

Backslash must be escaped.
If you want to specify the backslash itself, you specify as below.

```
\\\\
```

If you want to specify the regular expressions special characters(e.g. any digit), you specify as below.

```
\\d
```

From the above if you want to specify a regular expression like `\\\d+\\`, you specify as below.
Matching strings are like this \12345\

```jsonc
{
  "name": "number",
  "regex": "\\\\\\d+\\\\",
  "regexFlag": "g",
  "color": "red"
}
```

### Color formats

You can specify the following for the color.

- ColorName
  e.g. "red", "blue"...
- "#RGB" format
  e.g. "#0f0"
- "#RGBA" format
  e.g. "#f0f9"
- "#RRGGBB" format
  e.g. "#ff1155"
- "#RRGGBBAA" format
  e.g. "#ff115544"

More detail see [Color-formats](https://code.visualstudio.com/api/references/theme-color#color-formats)

Color values can be defined in the RGB color model with an alpha channel for transparency. As format, the following hexadecimal notations are supported: #RGB, #RGBA, #RRGGBB and #RRGGBBAA. R (red), G (green), B (blue), and A (alpha) are hexadecimal characters (0-9, a-f or A-F). The three-digit notation (#RGB) is a shorter version of the six-digit form (#RRGGBB) and the four-digit RGB notation (#RGBA) is a shorter version of the eight-digit form (#RRGGBBAA). For example #e35f is the same color as #ee3355ff.

If no alpha value is defined, it defaults to ff (opaque, no transparency). If alpha is set to 00, the color is fully transparent.

## Commands

| command                     | default keybind | description                                 |
| :-------------------------- | :-------------- | :------------------------------------------ |
| decorate-keyword.read       |                 | Read definition from `denifinitinFilePath`. |
| decorate-keyword.read       |                 | open `denifinitinFilePath`.                 |
| decorate-keyword.toggle     |                 | Decorate or undecorate keywords.            |
| decorate-keyword.decorate   |                 | Decorate keywords or Refresh decoration.    |
| decorate-keyword.undecorate |                 | Undecorate keywords.                        |

## Extension Settings

```jsonc
  // definition file path
  "decorateKeyword.definitionFilePath": "filePath" ,

  // Not recommend. Auto decorate keywords. May uses high cpu resource.
  "decorateKeyword.autoDecorate": false,
```
