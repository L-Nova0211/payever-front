import { Headings } from '@pe/confirmation-screen';

import { ActionTypeUIEnum } from '../enums/action-type.enum';

import { ActionRequestInterface } from './detail.interface';

export interface VerifyPayloadInterface {
  data: ActionRequestInterface,
  dataKey: string,
}

export interface UIActionInterface {
  type: ActionTypeUIEnum;
  icon: string;
  class?: string;
  onClick?: () => void;
  label?: string;
  labelTranslated?: string;
  href?: string;
  confirmHeadings?: Headings,
  showConfirm?: boolean
  errorMessage?: string;
}

export interface BodyDataInterface {
  [key: string]: string | number | boolean | Date;
}
