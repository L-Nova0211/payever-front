export enum ExecuteCommands {
  BOLD = 'bold',
  ITALIC = 'italic',
  UNDERLINE = 'underline',
  JUSTIFY_CENTER = 'justifyCenter',
  JUSTIFY_FULL = 'justifyFull',
  JUSTIFY_LEFT = 'justifyLeft',
  JUSTIFY_RIGHT = 'justifyRight',
  LIST_UNORDERED = 'insertUnorderedList',
  LIST_ORDERED = 'insertOrderedList',
  TEXT_COLOR = 'foreColor',
  FONT_SIZE = 'fontSize',
  FONT_FAMILY = 'fontFamily',
  INSERT_LINK = 'insertLink',
  INSERT_INTERNAL_LINK = 'insertInternalLink',
  SELECT_ALL = 'selectAll',
  SET_FOCUS = 'focus',
  SET_CARET = 'caret_to_end',
  PLACEHOLDER = 'placeholder',
}

export type JustifyContent = ExecuteCommands.JUSTIFY_LEFT
  | ExecuteCommands.JUSTIFY_CENTER
  | ExecuteCommands.JUSTIFY_RIGHT
  | ExecuteCommands.JUSTIFY_FULL;

export const SELECT_VALUES: any[] = [
  {
    label: '6px',
    value: '6px',
  },
  {
    label: '8px',
    value: '8px',
  },
  {
    label: '10px',
    value: '10px',
  },
  {
    label: '12px',
    value: '12px',
  },
  {
    label: '14px',
    value: '14px',
  },
  {
    label: '16px',
    value: '16px',
  },
  {
    label: '18px',
    value: '18px',
  },
  {
    label: '20px',
    value: '20px',
  },
  {
    label: '22px',
    value: '22px',
  },
  {
    label: '24px',
    value: '24px',
  },
  {
    label: '26px',
    value: '26px',
  },
  {
    label: '28px',
    value: '28px',
  },
  {
    label: '30px',
    value: '30px',
  },
  {
    label: '36px',
    value: '36px',
  },
  {
    label: '48px',
    value: '48px',
  },
  {
    label: '60px',
    value: '60px',
  },
  {
    label: '72px',
    value: '72px',
  },
  {
    label: '96px',
    value: '96px',
  },
];

export const DEFAULT_FONT_SIZE = 24;
export const DEFAULT_FONT_WEIGHT = 'normal';
export const DEFAULT_FONT_COLOR = '#000000';
export const DEFAULT_ALIGN = 'left';

export const EMPTY_CHAR = '&#8203';
export const ESCAPE_CHAR = '%u200B';
export const EMPTY_TEXT = '<span>&#8203</span>';
export const EMPTY_TEXT_WIDTH_STYLES =
  `<div style="text-align: ${DEFAULT_ALIGN}; font-size: ${DEFAULT_FONT_SIZE}; color: ${DEFAULT_FONT_COLOR}"></div>`;

export enum PriceFormats {
  NET = 'NET',
  GROSS = 'GROSS',
}

export const PaymentTerms: any[] = [
  {
    label: '7 days',
    value: '7 days',
  },
  {
    label: '10 days',
    value: '10 days',
  },
  {
    label: '30 days',
    value: '30 days',
  },
  {
    label: '60 days',
    value: '60 days',
  },
]
