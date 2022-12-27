import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { LocaleConstantsService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { PeCouponCountryInterface } from '../interfaces';

@Injectable()
export class PeCouponsEnvService {

  constructor(
    // Pe services
    private localeConstantsService: LocaleConstantsService,
    private snackbarService: SnackbarService,
  ) { }

  public generateCode(): string {
    const codeLength = 12;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < codeLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
  }

  public getCountries(): Observable<PeCouponCountryInterface[]> {
    return of(this.localeConstantsService.getCountryList())
      .pipe(
        switchMap(countryList => {
          const countries$ = Object.entries(countryList)
            .map(([countryKey, title]) => of({
              _id: countryKey,
              title: Array.isArray(title) ? title[0] : title,
            }));

          return forkJoin(countries$);
        }));
  }

  public showWarning(notification: string): void {
    this.snackbarService.toggle(
      true,
      {
        content: notification,
        duration: 5000,
        iconId: 'icon-alert-24',
        iconSize: 24,
      }
    );
  }
}
