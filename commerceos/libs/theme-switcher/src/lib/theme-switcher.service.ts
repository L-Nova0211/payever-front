import { Injectable } from '@angular/core';
import cssVars from 'css-vars-ponyfill';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';

import { PeThemePalette } from './theme.constants';
import { PeThemeEnum } from './theme.interface';

@Injectable({
  providedIn: 'platform',
})
export class ThemeSwitcherService {
  defaultTheme: PeThemeEnum = JSON.parse(localStorage.getItem('pe_active_business'))?.themeSettings?.theme
    ?? PeThemeEnum.DARK;

  themeSubject$: BehaviorSubject<PeThemeEnum> = new BehaviorSubject(this.defaultTheme);
  theme$: Observable<PeThemeEnum> = this.themeSubject$.asObservable().pipe(distinctUntilChanged());
  autoMode$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  autoTheme$: BehaviorSubject<PeThemeEnum> = new BehaviorSubject<PeThemeEnum>(null);

  constructor() {
    this.autoMode$
    .pipe(
      switchMap(auto => (auto ? this.autoTheme$ : this.theme$)),
      filter(theme => !!theme),
      tap((theme: PeThemeEnum) => this.changeTheme(theme)),
    )
    .subscribe();
  }

  set theme(theme: PeThemeEnum) {
    this.themeSubject$.next(theme);
  }

  get theme(): PeThemeEnum {
    return this.themeSubject$.value;
  }

  resetThemeToDefault(): void {
    this.themeSubject$.next(this.defaultTheme);
  }

  changeTheme(theme: PeThemeEnum) {
    const storageBusiness = localStorage.getItem('pe_active_business');
    const business = storageBusiness ? JSON.parse(storageBusiness) : null;
    if (business && business.themeSettings && business.themeSettings.theme) {
      business.themeSettings.theme = theme;
      localStorage.setItem('pe_active_business', JSON.stringify(business));
    }
    if (theme) {
      this.themeSubject$.next(theme);
      this.applyTheme(theme, []);
    } else {
      this.resetThemeToDefault();
    }
  }

  applyTheme(theme: PeThemeEnum, elementSelectors: string | string[]): void {
    // Apply theme via CSS3 vars
    const palette = PeThemePalette[theme];
    this.updateThemePalette(palette);
  }

  /**
   * Update the css variables value of document root as per palette
   * @param palette the palette containing colors and its values
   *
   */
  private updateThemePalette(palette: { [key: string]: string }): void {
    cssVars({
      variables: palette,
    });
  }
}


