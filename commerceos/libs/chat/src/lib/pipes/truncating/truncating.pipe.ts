import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncating',
})
export class PeTruncatingPipe implements PipeTransform {

  transform(value: string, truncateLength: number): string {
    if (!value) {
      return value;
    }

    return (truncateLength > 0) 
      ? (value.length > truncateLength 
          ? value.slice(0, truncateLength - 2) + '...'
          : value)
      : value;
  }
}