import { PebInteractionType } from '@pe/builder-core';

export enum PebLinkFormPayloadType {
  Input = 'input',
  Select = 'select',
}

export interface PebLinkFormCommon {
  label: string;
  type: PebLinkFormPayloadType | string;
  controlName?: string;
  placeholder?: string;
  valuePrefix?: string;
}

export interface PebLinkFormInput extends PebLinkFormCommon {
  changeType: 'focusout' | 'keyup';
}

export interface PebLinkFormSelect extends PebLinkFormCommon {
  options: string[];
}

export type PebLinkFormField = PebLinkFormInput | PebLinkFormSelect | PebLinkFormCommon;

export interface PebLinkFormOptions {
  name: string;
  value: PebInteractionType | string;
  payload: PebLinkFormField[];
}
