import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'abbreviation',
})
export class AbbreviationPipe implements PipeTransform {

  transform(value: string): string {
    const chunks: string[] = String(value || '').split(/\s+/);
    let abbreviation = '';
    if (chunks.length === 1) {
      abbreviation = `${chunks[0].charAt(0).toUpperCase()}${chunks[0].charAt(chunks[0].length - 1).toUpperCase()}`;
    } else {
      abbreviation = `${chunks[0].charAt(0).toUpperCase()}${chunks[1].charAt(0).toUpperCase()}`;
    }

    return abbreviation;
  }

}
