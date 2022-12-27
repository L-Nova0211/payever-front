import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { BrowserDetectService } from '@pe/browser';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { MediaContainerType, MediaUrlPipe } from '@pe/media';

@Injectable({
  providedIn: 'root',
})
export class WallpaperService {
  private _backgroundImage$: BehaviorSubject<string> = new BehaviorSubject(this._defaultBackgroundImage);
  private _blurredBackgroundImage$: BehaviorSubject<string> = new BehaviorSubject(this._defaultBlurredBackgroundImage);

  private _showDashboardBackground$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  backgroundImage$: Observable<string> = this._backgroundImage$.asObservable();
  blurredBackgroundImage$: Observable<string> = this._blurredBackgroundImage$.asObservable();
  lastDashboardBackground = '';
  animation = true;

  constructor(
    private mediaUrlPipe: MediaUrlPipe,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private browser: BrowserDetectService,
  ) {}

  get _defaultBackgroundImage(): string {
    const industry = this.getUrlPart();
    if (this.isRegistrationOrLogin && industry) {
      return `${this.env.custom.cdn}/images/commerceos-industry-background-${industry}.${this.browser.isSafari ? 'jpg' : 'webp'}`;
    }

    return `${this.env.custom.cdn}/images/commerceos-background.${this.browser.isSafari ? 'jpg' : 'webp'}`;
  }

  get _defaultBlurredBackgroundImage(): string {
    const industry = this.getUrlPart();
    if (this.isRegistrationOrLogin && industry) {
      return `${this.env.custom.cdn}/images/commerceos-industry-background-${industry}-blurred.${this.browser.isSafari ? 'jpg' : 'webp'}`;
    }

    return `${this.env.custom.cdn}/images/commerceos-background-blurred.${this.browser.isSafari ? 'jpg' : 'webp'}`;
  }

  set backgroundImage(image: string) {
    this._backgroundImage$.next(image);
  }

  get backgroundImage(): string {
    return this._backgroundImage$.value;
  }

  get defaultBackgroundImage(): string {
    return this._defaultBackgroundImage;
  }

  set blurredBackgroundImage(image: string) {
    this._blurredBackgroundImage$.next(image);
  }

  get blurredBackgroundImage(): string {
    return this._blurredBackgroundImage$.value;
  }

  get defaultBlurredBackgroundImage(): string {
    return this._defaultBlurredBackgroundImage;
  }

  get showDashboardBackground$(): Observable<boolean> {
    return this._showDashboardBackground$.asObservable();
  }

  showDashboardBackground(showDashboardBackground: boolean): void {
    this._showDashboardBackground$.next(showDashboardBackground);
  }

  setBackgrounds(wallpaper: string) {
    this._backgroundImage$.next(this.mediaUrlPipe.transform(`${wallpaper}`, MediaContainerType.Wallpapers));
    this._blurredBackgroundImage$.next(
      this.mediaUrlPipe.transform(`${wallpaper}-blurred`, MediaContainerType.Wallpapers),
    );
    this.saveCurrentDefaultBackground();
    this.lastDashboardBackground = this._blurredBackgroundImage$.getValue();
    localStorage.setItem('lastBusinessWallpaper', this._blurredBackgroundImage$.getValue());
  }

  resetBackgroundsToDefault(noBackgroundBlur: boolean = false): void {
    this._backgroundImage$.next(this._defaultBackgroundImage);
    if (noBackgroundBlur) {
      this._blurredBackgroundImage$.next(this._defaultBackgroundImage);
    } else {
      this._blurredBackgroundImage$.next(this._defaultBlurredBackgroundImage);
    }
  }

  saveCurrentDefaultBackground(): void {
    localStorage.setItem('pe-default-background', this._defaultBackgroundImage);
    localStorage.setItem('pe-default-background-blurred', this._defaultBlurredBackgroundImage);
  }

  private get isRegistrationOrLogin(): boolean {
    const parts = String(window.location.pathname)
      .split('/')
      .filter(d => d !== '');

    return parts[0] === 'registration' || parts[0] === 'login';
  }

  private getUrlPart(): string {
    const parts = String(window.location.pathname)
      .split('/')
      .filter(d => d !== '');
    // TODO Remove copypaste
    const ignore = ['personal', 'business', 'refresh'];

    return parts[3] && ignore.indexOf(parts[3]) < 0
      ? parts[3]
      : ignore.indexOf(parts[1]) < 0
        ? parts[1]
        : null;
  }
}
