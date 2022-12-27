
import { Pipe, PipeTransform } from '@angular/core';
import { sortBy } from 'lodash-es';

import { PeGridTableDisplayedColumns } from '../interfaces/grid.interface';

@Pipe({
  name: 'columnsSort',
})
export class PeDisplayColumnsSortPipe implements PipeTransform {

  transform(array: PeGridTableDisplayedColumns[], sort = true): PeGridTableDisplayedColumns[] {
    if (sort) {
      return sortBy(array, ['positionForMobile']);
    }

    return array;
  }
}
