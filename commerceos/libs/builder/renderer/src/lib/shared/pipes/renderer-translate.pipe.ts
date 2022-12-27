import { Pipe, PipeTransform } from '@angular/core';

import {  TranslateService } from '@pe/i18n-core';

import { PebEditorOptions } from '../../state';
import { rendererTranslate } from '../../utils';

@Pipe({
  name: 'rendererTranslate',
})
export class PebRendererTranslatePipe implements PipeTransform {

  constructor(
    private translateService: TranslateService,
  ) {
  }

  transform(value: string, options: PebEditorOptions): string {
    return rendererTranslate(value, options, this.translateService);
  }

}
