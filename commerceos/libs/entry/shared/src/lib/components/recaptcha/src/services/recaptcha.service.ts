import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { LocaleConstantsService } from '@pe/i18n';
import { API_URL, SCRIPT_ID } from '../settings';

declare global {
  interface Window {
    google: any;
    peReCaptchaOnLoad(): void;
  }
}

@Injectable()
export class ReCaptchaService {

  private readySubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private url: string = API_URL;
  private scriptId: string = SCRIPT_ID;

  constructor(private localeConstantsService: LocaleConstantsService) {
    if (document.getElementById(this.scriptId)) {
      this.readySubject.next(true);
    }
    else {
      window.peReCaptchaOnLoad = () => {
        this.readySubject.next(true);
      };
      const localeId: string = localeConstantsService.getLocaleId();
      
      const script: HTMLScriptElement = document.createElement('script');
      script.id = this.scriptId;
      script.src = `${this.url}&hl=${localeId}`;
      document.head.appendChild(script);
    }
  }

  initialized$(): Observable<boolean> {
    return this.readySubject.asObservable().pipe(
      filter(d => d),
      take(1)
    );
  }

}
