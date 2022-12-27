import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export const ShortPhoneFieldName = '_phone';

@Injectable()
export class DynamicFormService {
  countryPhoneCode$ = new BehaviorSubject<string>(null);
  isSelectPhoneCode$ = new BehaviorSubject<boolean>(false);

  phoneFieldName: string;



  get useShortNumber(): boolean {
    return this.isSelectPhoneCode$.value && !!this.phoneFieldName;
  }
}
