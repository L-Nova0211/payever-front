import { Pipe, PipeTransform } from '@angular/core';
import cloneDeep from 'lodash/cloneDeep';
import { Observable } from 'rxjs';
@Pipe({
  name: 'clone',
})
export class ClonePipe implements PipeTransform {
  transform(value: any, args?: any): Observable<any> {
    return cloneDeep(value);
  }
}
