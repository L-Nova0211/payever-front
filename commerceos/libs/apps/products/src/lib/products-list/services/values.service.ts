import { Injectable } from '@angular/core';

import { FilterInterface } from '@pe/grid';


@Injectable({
  providedIn:'root',
})

export class ValuesService {
  private values;

  set valuesData(values) {
    this.values = values;
  }

  get filters(): FilterInterface[] {
    return this.values?.filters ?? [];
  }
}
