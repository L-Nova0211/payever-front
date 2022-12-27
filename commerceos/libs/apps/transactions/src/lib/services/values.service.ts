import { Injectable } from '@angular/core';

import { FilterInterface } from '@pe/grid';

import { ChannelsInterface, PaymentsOptionsInterface, ValuesInterface } from '../shared/interfaces/values.interface';


@Injectable({
  providedIn:'root',
})

export class ValuesService {
  private values: ValuesInterface;

  set valuesData(values: ValuesInterface) {
    this.values = values;
  }

  get channels(): ChannelsInterface {
    return this.values?.channels ?? {};
  }

  get payments(): PaymentsOptionsInterface {
    return this.values?.paymentOptions ?? {};
  }

  get filters(): FilterInterface[] {
    return this.values?.filters ?? [];
  }
}
