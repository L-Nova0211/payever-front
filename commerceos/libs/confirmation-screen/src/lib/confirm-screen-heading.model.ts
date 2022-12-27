import { InjectionToken, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum PeConfirmationScreenIconTypesEnum {
  Abbreviation = 'abbreviation',
  Image = 'image',
  MatIcon = 'mat-icon',
  XLink = 'xlink',
}

export interface Headings {
  confirmBtnText: string;
  confirmBtnType?: 'warn'|'confirm';
  confirmLoading$?: BehaviorSubject<boolean>;
  declineBtnText: string;
  icon?: PeConfirmationScreenIconInterface;
  subtitle: string;
  description?: string;
  title: string;
  customBottomTemplate?: TemplateRef<any>;
  customMiddleTemplate?: TemplateRef<any>;
}

export interface PeConfirmationScreenIconInterface {
  iconType: PeConfirmationScreenIconTypesEnum;
  path: string;
}

export const HEADINGS_DATA = new InjectionToken<{ }>('HeadingsData');
