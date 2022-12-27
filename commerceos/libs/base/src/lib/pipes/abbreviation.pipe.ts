import { Pipe, PipeTransform } from '@angular/core';

import { getAbbreviation } from '@pe/common';

@Pipe({ name: 'abbreviation' })
export class AbbreviationPipe implements PipeTransform {
  transform(value: string): string {
    return getAbbreviation(value);
  }
}
