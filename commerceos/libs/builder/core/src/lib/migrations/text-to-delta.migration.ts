import Delta from 'quill-delta';

import {
  PebScreen,
  PebTextAlignType,
  PebTextJustify,
  PebTextVerticalAlign,
  PEB_DEFAULT_FONT_COLOR,
  PEB_DEFAULT_FONT_FAMILY,
  PEB_DEFAULT_FONT_SIZE,
} from '../constants';
import {
  pebFontFamilies,
} from '../fonts';
import { PebElementStyles, PebLanguage } from '../models/client';
import { PebThemePageInterface } from '../models/database';
import { PebElementDef, PebElementType } from '../models/element';
import { PebInteractionWithPayload } from '../utils';

import { htmlColors } from './colors';
import { PebMigration } from './migrations.interface';


export class RGBA {
  constructor(
    public r: number,
    public g: number,
    public b: number,
    public a: number,
  ) {
  }
}

export function rgbaToHex(rgba: RGBA): string {
  return `#${((1 << 24) | (rgba.r << 16) | (rgba.g << 8) | rgba.b).toString(16).substr(1)}`;
}

export function stringToRgba(value: string): RGBA {
  const parsers = [
    {
      re: /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])$/,
      parse: (matches: string[] | null) => matches
        ? new RGBA(
          parseInt(matches[1] + matches[1], 16),
          parseInt(matches[2] + matches[2], 16),
          parseInt(matches[3] + matches[3], 16),
          1)
        : null,
    },
    {
      re: /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$/,
      parse: (matches: string[] | null) => matches
        ? new RGBA(
          parseInt(matches[1], 16),
          parseInt(matches[2], 16),
          parseInt(matches[3], 16),
          1)
        : null,
    },
    {
      re: /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})?$/,
      parse: (matches: any) => matches
        ? new RGBA(
          parseInt(matches[1], 16),
          parseInt(matches[2], 16),
          parseInt(matches[3], 16),
          parseInt(matches[4] || 'FF', 16) / 255)
        : null,
    },
    {
      re: /(rgb)a?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*%?,\s*(\d{1,3})\s*%?(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
      parse: (matches: any) => matches
        ? new RGBA(
          parseInt(matches[2], 10),
          parseInt(matches[3], 10),
          parseInt(matches[4], 10),
          isNaN(parseFloat(matches[5])) ? 1 : parseFloat(matches[5]))
        : null,
    },
  ];

  for (const parser of parsers) {
    const matches = parser.re.exec(value);
    if (matches) {
      return parser.parse(matches);
    }
  }

  console.warn(`Invalid color: ${value}. Supported formats are: hex, hex8, rgb, rgba`);

  return new RGBA(0, 0, 0, 1);
}

export interface PebTextStyles {
  link: PebInteractionWithPayload<string>;
  fontFamily: string;
  color: string;
  fontWeight: number;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  fontSize: number;
  textJustify: PebTextJustify;
  verticalAlign: PebTextVerticalAlign;
}

export function toVerticalAlign(alignItems: PebTextAlignType): PebTextVerticalAlign {
  switch (alignItems) {
    case PebTextAlignType.FlexStart:
      return PebTextVerticalAlign.Top;
    case PebTextAlignType.Center:
      return PebTextVerticalAlign.Center;
    case PebTextAlignType.FlexEnd:
      return PebTextVerticalAlign.Bottom;
    default:
      return undefined;
  }
}

export function toTextJustify(justifyContent: PebTextAlignType): PebTextJustify {
  switch (justifyContent) {
    case PebTextAlignType.FlexStart:
      return PebTextJustify.Left;
    case PebTextAlignType.Center:
      return PebTextJustify.Center;
    case PebTextAlignType.FlexEnd:
      return PebTextJustify.Right;
    default:
      return undefined;
  }
}

export function cleanUpAttributes(delta: Delta): Delta {
  const ops = delta.ops.map((op) => {
    const { textDecoration, ...attributes } = op?.attributes ?? {};

    if (attributes.underline === undefined && textDecoration && textDecoration.indexOf('underline') !== -1) {
      attributes.underline = true;
    }

    if (attributes.strike === undefined && textDecoration && textDecoration.indexOf('line-through') !== -1) {
      attributes.strike = true;
    }

    if (typeof attributes.italic === 'string') {
      attributes.italic = attributes.italic === 'italic';
    }

    if (typeof attributes.fontWeight === 'string') {
      if (attributes.fontWeight === 'bold') {
        attributes.fontWeight = 700;
      } else {
        const fontWeight = parseInt(attributes.fontWeight, 10);
        if (isNaN(fontWeight)) {
          delete attributes.fontWeight;
        } else {
          attributes.fontWeight = fontWeight;
        }
      }
    }

    if (!attributes.fontWeight && attributes.bold) {
      if (typeof attributes.bold === 'string' && attributes.bold === 'bold' || attributes.bold === true) {
        attributes.fontWeight = 700;
      }
      delete attributes.bold;
    }

    if (attributes.link) {
      const { type, payload } = attributes.link;
      if (type && payload) {
        attributes.link = { type, payload };
      } else {
        delete attributes.link;
      }
    }

    if (Object.keys(attributes).length > 0) {
      op.attributes = attributes;
    }

    return op;
  });

  return new Delta({ ops });
}

export function linkAttributesToText(elm: PebElementDef, screen: PebScreen = PebScreen.Desktop) {
  const { linkAttributes } = elm.data?.linkTo ?? {};
  if (linkAttributes) {
    const text = cleanUpAttributes(new Delta({ ops: [{ attributes: linkAttributes }] }));
    elm.data.text = { [screen]: { [PebLanguage.Generic]: text } };

    delete elm.data.linkTo.linkAttributes;
  }
}

export function getTextStyles(page: PebThemePageInterface, elm: PebElementDef, screen: PebScreen) {
  const textStyle: Partial<PebTextStyles> = {};

  if (!page.stylesheets[screen]?.[elm.id]) {
    return textStyle;
  }

  const stylesheet = page.stylesheets[screen][elm.id];
  const {
    fontFamily,
    fontWeight,
    fontSize,
    fontStyle,
    textAlign,
    textDecoration,
    color,
    alignItems,
    ...styles
  } = stylesheet;

  if (fontFamily) {
    const fontFamilies = fontFamily.split(',').map(ff => ff.trim());
    const validFontFamilies = fontFamilies.filter(ff => pebFontFamilies.some((font) => {
      const fontName = font.name.toLowerCase();

      return fontName === ff.toLowerCase() && fontName !== PEB_DEFAULT_FONT_FAMILY.toLowerCase();
    }));

    if (validFontFamilies.length) {
      textStyle.fontFamily = validFontFamilies[0];
    }
  }

  if (fontWeight) {
    if (typeof fontWeight === 'string') {
      if (fontWeight === 'bold') {
        textStyle.fontWeight = 700;
      }
    } else if (!isNaN(fontWeight)) {
      const ff = textStyle.fontFamily || PEB_DEFAULT_FONT_FAMILY;
      const font = pebFontFamilies.find(f => f.name === ff);
      if (font?.weights.includes(fontWeight)) {
        textStyle.fontWeight = fontWeight;
      } else if (fontWeight > 400) {
        textStyle.fontWeight = 700;
      }
    }
  }

  if (textDecoration && textDecoration.indexOf('underline') !== -1) {
    textStyle.underline = true;
  }

  if (textDecoration && textDecoration.indexOf('line-through') !== -1) {
    textStyle.strike = true;
  }

  if (fontStyle === 'italic') {
    textStyle.italic = true;
  }

  if (fontSize) {
    const fs = typeof fontSize === 'string' ? parseFloat(fontSize) : fontSize;
    if (!isNaN(fs) && fs !== PEB_DEFAULT_FONT_SIZE) {
      textStyle.fontSize = fs;
    }
  }

  if (textAlign) {
    const align = elm.type === PebElementType.Text && (textAlign as unknown as PebTextJustify) === PebTextJustify.Left
      ? null
      : textAlign;
    if (align) {
      textStyle.textJustify = textAlign as unknown as PebTextJustify;
    }
  } else if (elm.type === PebElementType.Shape) {
    textStyle.textJustify = PebTextJustify.Center;
  }

  if (color) {
    const c = color.split(' ').join('').toLowerCase();
    const name = Object.keys(htmlColors).find(key => key.toLowerCase() === c);
    const hex = name ? htmlColors[name] : rgbaToHex(stringToRgba(color));
    if (hex !== PEB_DEFAULT_FONT_COLOR) {
      textStyle.color = hex;
    }
  }

  /** Vertical alignment */
  if (!styles.verticalAlign) {
    if (alignItems) {
      const align = toVerticalAlign(alignItems as PebTextAlignType);
      if (align && align !== PebTextVerticalAlign.Top) {
        (styles as Partial<PebElementStyles>).verticalAlign = align;
      }
    } else if (elm.type === PebElementType.Shape) {
      (styles as Partial<PebElementStyles>).verticalAlign = PebTextVerticalAlign.Center;
    }
  }

  /** Cleanup styles */
  page.stylesheets[screen][elm.id] = styles;

  return textStyle;
}


export const textToDelta: PebMigration = (page: PebThemePageInterface, elm: PebElementDef) => {
  if ([PebElementType.Text, PebElementType.Shape].includes(elm.type)) {
    if (elm.data?.text !== undefined) {
      if (typeof elm.data.text === 'string') {
        const screen =
          Object.values(PebScreen).find(s => page.stylesheets[s]?.[elm.id]?.display !== 'none') ??
          PebScreen.Desktop;
        const styles = getTextStyles(page, elm, screen);
        const { textJustify, verticalAlign, ...attributes } = styles;
        const text = new Delta([
          {
            attributes,
            insert: (elm.data.text as string).replace(/<br\s*\/?>/ig, '\n')
              .replace(/<\/?('[^']*'|[^>])*(>|$)/ig, ''),
          },
          ...[textJustify ? { insert: '\n', attributes: { align: textJustify } } : { insert: '\n' }],
        ]);

        elm.data.text = { [screen]: { [PebLanguage.Generic]: text } };
      } else {
        /** just clean up styles */
        Object.values(PebScreen).forEach((screen) => {
          if (!page.stylesheets[screen]?.[elm.id]) {
            return;
          }

          const {
            fontFamily,
            fontWeight,
            fontSize,
            fontStyle,
            textAlign,
            textDecoration,
            color,
            alignItems,
            ...styles
          } = page.stylesheets[screen][elm.id];

          /** Vertical alignment */
          if (!styles.verticalAlign) {
            if (alignItems) {
              const align = toVerticalAlign(alignItems as PebTextAlignType);
              if (align && align !== PebTextVerticalAlign.Top) {
                (styles as Partial<PebElementStyles>).verticalAlign = align;
              }
            } else if (elm.type === PebElementType.Shape) {
              (styles as Partial<PebElementStyles>).verticalAlign = PebTextVerticalAlign.Center;
            }
          }

          page.stylesheets[screen][elm.id] = styles;
        });

        Object.values(PebScreen).forEach((screen) => {
          Object.values(PebLanguage).forEach((language) => {
            if (!elm.data.text?.[screen]?.[language]) {
              if (elm.data.text?.[language]) {
                elm.data = {
                  ...elm.data,
                  text: {
                    ...elm.data.text,
                    [PebScreen.Desktop]: { [language]: cleanUpAttributes(new Delta(elm.data.text[language])) },
                  },
                };
              }
            } else {
              elm.data = {
                ...elm.data,
                text: {
                  ...elm.data.text,
                  [screen]: {
                    ...elm.data.text?.[screen],
                    [language]: cleanUpAttributes(new Delta(elm.data.text[screen][language])),
                  },
                },
              };
            }

            delete elm.data.text?.[language];
          });

          delete page.stylesheets[screen]?.[elm.id]?.content;
        });

        /** Create text content for generic language */
        Object.values(PebScreen).forEach((screen) => {
          if (!elm.data?.text?.[screen]?.[PebLanguage.Generic] && elm.data.text?.[screen]?.[PebLanguage.English]) {
            elm.data.text = {
              ...elm.data.text,
              ...{ [screen]: { [PebLanguage.Generic]: elm.data.text[screen][PebLanguage.English] } },
            };

            delete elm.data?.text?.[screen][PebLanguage.English];
          }
        });
      }
    } else if (elm.data?.linkTo) {
      linkAttributesToText(elm);
    }
  }

  if (elm.type === PebElementType.Grid) {
    if (elm.data?.childrenStyles) {
      const screen =
        Object.values(PebScreen).find(s => page.stylesheets[s]?.[elm.id]?.display !== 'none') ??
        PebScreen.Desktop;
      const styles = elm.data.childrenStyles;

      Object.entries(styles).forEach(([key, value]) => {
        if (key === 'alignItems') {
          const verticalAlign = toVerticalAlign(value);
          page.stylesheets[screen][elm.id] = {
            ...page.stylesheets[screen][elm.id],
            ...{ verticalAlign },
          };
          delete styles[key];
        }

        if (key === 'justifyContent') {
          styles['textJustify'] = toTextJustify(value);
          delete styles[key];
        }
      });

      const text = { ...elm.data.text };

      text[screen] = {
        ...(text[screen] ?? {}),
        [PebLanguage.Generic]: new Delta({
          ops: [
            { attributes: { ...styles } },
          ],
        }),
      };

      elm.data = { ...elm.data, text };

      delete elm.data.childrenStyles;
    }
  }

  return elm;
};
