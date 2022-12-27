import {
  PebInteractionWithPayload,
  PebTextJustify,
  PebTextVerticalAlign,
  PEB_DEFAULT_FONT_COLOR,
  PEB_DEFAULT_FONT_FAMILY,
  PEB_DEFAULT_FONT_SIZE,
} from '@pe/builder-core';

/** Text styles domain model */
export interface PebTextStyles {
  link: PebInteractionWithPayload<string> | null;
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

export const PEB_DEFAULT_TEXT_STYLE: PebTextStyles = {
  link: null,
  fontFamily: PEB_DEFAULT_FONT_FAMILY,
  fontWeight: 400,
  italic: false,
  fontSize: PEB_DEFAULT_FONT_SIZE,
  underline: false,
  strike: false,
  color: PEB_DEFAULT_FONT_COLOR,
  textJustify: PebTextJustify.Left,
  verticalAlign: PebTextVerticalAlign.Top,
};

/** If there are different values in selection range, an array with all values will be reported. */
export type PebTextSelectionStyles =  {
  [P in keyof PebTextStyles]: PebTextStyles[P] | Array<PebTextStyles[P]>
};

export enum TextEditorCommand {
  link = 'link',
  fontFamily = 'fontFamily',
  color = 'color',
  fontWeight = 'fontWeight',
  italic = 'italic',
  underline = 'underline',
  strike = 'strike',
  fontSize = 'fontSize',
  justify = 'align',
  undo = 'undo',
  redo = 'redo',
  clearHistory = 'clearHistory',
}
