import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], filter: Record<string, any>): any {
    const key = Object.keys(filter)[0];
    const value = filter[key];

    return value ? items.filter(e => e[key].indexOf(value) !== -1 || value === null) : items;
  }
}
