import { Injectable } from '@angular/core';

import { PebSelectComponent } from './select';

@Injectable({ providedIn: 'root' })
export class SelectService {
  private select: PebSelectComponent;

  public register(selectIn: PebSelectComponent) {
    this.select = selectIn;
  }

  public getSelect(): PebSelectComponent {
    return this.select;
  }
}
