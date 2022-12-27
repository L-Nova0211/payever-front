import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';

import { TranslateService } from '@pe/i18n-core';

@Pipe({
  name: 'loadTranslate',
})
export class TranslateLoader implements PipeTransform {
  constructor(private translateService: TranslateService){}

  transform(value: string): Observable<string> {
    return this.translateService.getExistTranslate(value);
  }
}