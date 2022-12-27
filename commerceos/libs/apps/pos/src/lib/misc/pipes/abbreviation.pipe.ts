import { Pipe, PipeTransform } from '@angular/core';
import capitalize  from 'lodash/capitalize';

@Pipe({ name: 'abbreviation' })
export class AbbreviationPipe implements PipeTransform {
  transform(value: string): string {
    const chunks = String(value || '').split(/\s+/);

    return capitalize(chunks.length === 1
      ? chunks[0].slice(0, 1) + chunks[0].slice(-1)
      : chunks[0].slice(0, 1) + chunks[1].slice(0, 1),
    );
  }
}
