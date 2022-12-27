import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { keys } from 'lodash-es';

import { getLangList } from '@pe/i18n-core';


@Injectable()
export class LanguageGuard implements CanActivate {

  defaultLocaleKey = 'pe_current_locale';

  canActivate(): boolean {
    let locale: string = (document.documentElement.lang || 'en').split('-')[0].toLowerCase();
    if (true) {
      let browserLocale: string = (require('locale2') || '').split('-')[0].toLowerCase();
      browserLocale = getLangList()[browserLocale] ? browserLocale : null;
      locale = this.retrieveLocale() || browserLocale || locale;
      this.saveLocale(locale);
    }

    return true;
  }

  saveLocale(locale: string): void {
    const langs = getLangList();
    if (keys(langs).indexOf(locale) < 0) {
      console.error('Locale is not allowed!', locale, langs);
      //console.trace();
      //debugger;
    }
    window[this.defaultLocaleKey] = locale;
    try {
      if (this.isLocalStorage()) {
        localStorage.setItem(this.defaultLocaleKey, locale);
      }
    } catch (e) {}
  }

  retrieveLocale(): string {
    let result = window[this.defaultLocaleKey] || null;
    try {
      result = this.isLocalStorage() ? localStorage.getItem(this.defaultLocaleKey) : result;
    } catch (e) {}

    return result;
  }

  isLocalStorage(): boolean {
    try {
      const data = localStorage && localStorage.getItem('_');

      return true;
    } catch (e) {
      return false;
    }
  }
}
