import { ScreenTypeEnum, StyleItemTypeEnum } from '../enums';

export interface FormSchemeItemInterface {
  controlName: string;
  labelKey: string;
  type: StyleItemTypeEnum;
  screen?: ScreenTypeEnum[];
  buttonLabelKey?: string;
}

export interface FormSchemeGroupInterface {
  controls?: FormSchemeItemInterface[];
  modals?: FormSchemeModalInterface[],
}

export interface FormSchemeModalInterface {
  titleKey: string;
  controls: FormSchemeItemInterface[];
}

export interface FormSchemeInterface {
  groups?: FormSchemeGroupInterface[],
}
