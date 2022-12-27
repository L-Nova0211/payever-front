import { Observable } from 'rxjs';

import { FormSchemeField } from '@pe/forms';

import { ActionButtonInterface } from './action-button.interface';
import { PeListInterface } from './pe-list.interface';

export interface InfoBoxActionInterface extends ActionButtonInterface {
  align: 'right' | 'left';
  hasPaddings?: boolean;
  color?: string;
  apiUrl?: string;
  classes?: string;
  small?: boolean;
}

export interface FieldsetData {
  [formControlName: string]: any;
}

export interface HtmlInterface {
  innerHtml: string;
  icon: string;
}

interface InfoBoxSettingsBase {
  title: string;
  closeUrl?: string;
}

// for type==='info-box'
export interface InfoBoxSettingsContentInterface {
  accordion?: AccordionPanelInterface[];
  html?: HtmlInterface; // if exist show it. All others ignore
  fieldset?: FormSchemeField[]; // show it on the top of content container
  fieldsetData?: FieldsetData;
  data?: PeListInterface; // collection of rows
}
export interface InfoBoxSettingsInfoBoxTypeInterface extends InfoBoxSettingsBase {
  type: 'info-box';
  contentType: 'accordion' | 'none';
  actions?: InfoBoxActionInterface[];
  content: InfoBoxSettingsContentInterface;
}

export interface AccordionPanelInterface {
  action?: InfoBoxActionInterface;
  title?: string;
  icon?: string;
  html?: HtmlInterface; // if exist show it. All others ignore
  fieldset?: FormSchemeField[]; // show it on the top of content container
  fieldsetCaption?: InfoBoxFieldsetCaptionInterface; // small description on top of a form
  fieldsetData?: FieldsetData;
  data?: PeListInterface; // collection of rows
  disabled?: boolean;
  hideToggle?: boolean;
  nestedElements?: InfoBoxNestedElementsInterface;
  headerButton?: ActionButtonInterface;
}

export interface InfoBoxFieldsetCaptionInterface {
  classes?: string;
  text: string;
}

export interface InfoBoxNestedElementsInterface {
  accordion?: Array<AccordionPanelInterface>;
}

// for type==='confirm'
export interface InfoBoxSettingsConfirmContent {
  icon?: string;
  title: string;
  text: string;
  actions: ActionButtonInterface[];
}
export interface InfoBoxSettingsConfirmTypeInterface extends InfoBoxSettingsBase {
  type: 'confirm';
  confirmContent?: InfoBoxSettingsConfirmContent;
}
export interface InfoBoxSettingsRedirectTypeInterface extends InfoBoxSettingsBase {
  type: 'redirect';
  url: string;
}

export type InfoBoxSettingsInterface = InfoBoxSettingsInfoBoxTypeInterface |
InfoBoxSettingsConfirmTypeInterface | InfoBoxSettingsRedirectTypeInterface;

export type HandlePayeverFieldsSaveCallback = (data: {[key: string]: any}) => Observable<void>;
