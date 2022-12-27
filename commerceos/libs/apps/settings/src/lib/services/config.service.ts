import { Injectable } from '@angular/core';

import * as settings from '../misc/constants/settings';
import { RestUrlInterface } from '../misc/interfaces';

@Injectable()
export class CoreConfigService {

  get CURRENCIES(): string[] {
    return settings.CURRENCIES;
  }

  get INDUSTRY_SECTORS(): string[] {
    return settings.INDUSTRY_SECTORS;
  }

  get LEGAL_FORMS(): string[] {
    return settings.LEGAL_FORMS;
  }

  get BUSINESS_STATUS(): string[] {
    return settings.BUSINESS_STATUS;
  }

  get STATUS(): string[] {
    return settings.STATUS;
  }

  get EMPLOYEES(): object[] {
    return settings.EMPLOYEES;
  }

  get SALES(): object[] {
    return settings.SALES;
  }

  get externalLinks(): RestUrlInterface {
    return settings.externalLinks;
  }

  getHelpLink(language: string): string {
    return settings.helpLink(language);
  }

  get EMAIL_NOTIFICATIONS_PERIODS(): string[] {
    return settings.EMAIL_NOTIFICATIONS_PERIODS;
  }

  get APPS_NOTIFICATIONS_OPTIONS(): string[] {
    return settings.APPS_NOTIFICATIONS_OPTIONS;
  }

  get PRODUCTS(): string[] {
    return settings.PRODUCTS;
  }
}
