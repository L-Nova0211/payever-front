import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numeric',
})
export class NumericPipe implements PipeTransform {

  transform(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;

    return !(charCode === 101 || charCode === 69 || charCode === 44 || charCode === 43 || charCode === 45);
  }

}
