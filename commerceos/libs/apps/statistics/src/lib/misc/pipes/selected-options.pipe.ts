import { Pipe, PipeTransform } from '@angular/core';

import { TranslateService } from '@pe/i18n-core';

import { ucfirst } from '../../infrastructure';

@Pipe({
  name: 'selectedOptions',
})
export class SelectedOptionsPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(options: any) {
    if (!options) {
      return '';
    }
    let optionsText = '';
    Object.keys(options).forEach((element, index) => {
      if (options[element] === null) {
        return;
      }
      if (options[element] === 'all') {
        return;
      }
      if (options[element] instanceof Array) {
        let arrayText = `${ucfirst(element)}:`;
        options[element].forEach((item, index) => {
          if (index === 0) {
            arrayText = arrayText + ` ${ucfirst(item)}`;

            return;
          }
          arrayText = arrayText + `, ${ucfirst(item)}`;
        });
        optionsText = `${optionsText} ${arrayText}`;

        return;
      }
      if (index === 0) {
        optionsText = optionsText + ucfirst(element) + `: ${options[element]},`;
      } else {
        optionsText = optionsText + ' ' + ucfirst(element) + `: ${options[element]},`;
      }
    });
    if (optionsText.length > 0) {
      return `(${optionsText})`;
    }

    return;
  }
}
