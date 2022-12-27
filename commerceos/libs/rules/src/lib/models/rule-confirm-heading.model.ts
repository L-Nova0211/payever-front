import { InjectionToken } from '@angular/core';

export class Headings {
  title: string;
  subtitle: string;
  confirmBtnText: string;
  declineBtnText: string
}

export const HEADINGS_DATA = new InjectionToken<{}>('HeadingsData');
