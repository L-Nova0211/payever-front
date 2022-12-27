import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { LocaleConstantsService } from '@pe/i18n';

declare global {
  interface Window {
    google: any;
    googleMapsOnLoad(): void;
  }
}

@Injectable()
export class GoogleAutocompleteService {

  private onInitSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  private defaultKey = 'AIzaSyDB-7kzuFYxb8resf60yF21TKUkTbGhljc';
  private scriptId = 'peGoogleAutocompleteScript';
  private url = 'https://maps.googleapis.com/maps/api/js?libraries=places&callback=googleMapsOnLoad';

  constructor(
    private localeConstantsService: LocaleConstantsService,
    @Inject('POS_GOOGLE_MAPS_API_KEY') private googleMapsApiKey: string,
  ) {}

  public onInitSubscribe(callback: () => void): void {
    this.triggerLoading();
    this.onInitSubject.pipe(filter(a => a || !a)).subscribe(() => {
      callback();
    });
  }

  private triggerLoading(): void {
    if (document.getElementById(this.scriptId)) {
      this.onInitSubject.next(true);
    } else {
      window.googleMapsOnLoad = () => this.onInitSubject.next(true);
      const localeId: string = this.localeConstantsService.getLocaleId();

      const script: HTMLScriptElement = document.createElement('script');
      script.id = this.scriptId;
      script.src = `${this.url}&key=${this.googleMapsApiKey || this.defaultKey}&language=${localeId}`;
      document.head.appendChild(script);
    }
  }
}
