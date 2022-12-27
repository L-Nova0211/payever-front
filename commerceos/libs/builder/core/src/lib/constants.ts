import { PebMotionType } from './models/motion';

export enum PebScreen {
  Desktop = 'desktop',
  Tablet = 'tablet',
  Mobile = 'mobile',
}

export enum PebTextJustify {
  Left = 'left',
  Center = 'center',
  Right = 'right',
  Justify = 'justify',
}

export enum PebTextVerticalAlign {
  Top = 'top',
  Center = 'center',
  Bottom = 'bottom',
}

export enum PebTextAlignType {
  FlexStart = 'flex-start',
  Center = 'center',
  FlexEnd = 'flex-end',
}

export const PEB_DESKTOP_CONTENT_WIDTH = 1024;

export const PEB_DEFAULT_FONT_SIZE = 15;
export const PEB_DEFAULT_BACKGROUND_COLOR = '#d4d4d4';
export const PEB_DEFAULT_FONT_COLOR = '#000000';
export const PEB_DEFAULT_LINK_COLOR = '#067af1';
export const PEB_DEFAULT_FONT_FAMILY = 'Roboto';

export const pebLinkDatasetLink = {
  type: 'peb-link-action',
  payload: 'peb-link-payload',
};

export const pebScreenDocumentWidthList = {
  [PebScreen.Desktop]: 1200,
  [PebScreen.Tablet]: 768,
  [PebScreen.Mobile]: 360,
};

export const pebScreenContentWidthList = {
  [PebScreen.Desktop]: PEB_DESKTOP_CONTENT_WIDTH,
  [PebScreen.Tablet]: 768,
  [PebScreen.Mobile]: 360,
};

export const MOTION_TYPE = {
  buildIn: PebMotionType.BuildIn,
  action: PebMotionType.Action,
  buildOut: PebMotionType.BuildOut,
};

export enum PebScriptTrigger {
  PageView = 'PageView',
  DOMReady = 'DOMReady',
  WindowLoaded = 'WindowLoaded',
}

export const DEFAULT_TRIGGER_POINT = PebScriptTrigger.PageView;

export function textAlignToJustifyContent(textAlign: PebTextVerticalAlign): PebTextAlignType {
  switch (textAlign) {
    case PebTextVerticalAlign.Top:
      return PebTextAlignType.FlexStart;
    case PebTextVerticalAlign.Center:
      return PebTextAlignType.Center;
    case PebTextVerticalAlign.Bottom:
      return PebTextAlignType.FlexEnd;
  }
}

export interface PebEditorCommand<T = any> {
  type: string;
  params?: T;
}
