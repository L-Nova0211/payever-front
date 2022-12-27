import { Injectable } from '@angular/core';
import { NgControl } from '@angular/forms';

import { RadioButtonComponent } from './radio';

@Injectable({ providedIn: 'root' })
export class RadioControlRegistry {
  private accessors: any[] = [];

  add(control: NgControl, accessor: RadioButtonComponent) {
    this.accessors.push([control, accessor]);
  }

  remove(accessor: RadioButtonComponent) {
    this.accessors = this.accessors.filter((c) => {
      return c[1] !== accessor;
    });
  }

  select(accessor: RadioButtonComponent) {
    this.accessors.forEach((c) => {
      if (this.isSameGroup(c, accessor) && c[1] !== accessor) {
        c[1].writeValue(accessor.value);
      }
    });
  }

  private isSameGroup(
    controlPair: [NgControl, RadioButtonComponent],
    accessor: RadioButtonComponent,
  ): boolean {
    if (!controlPair[0].control) {
      return false;
    }

    return (
      controlPair[0].control.root === accessor.control.control.root &&
      controlPair[1].name === accessor.name
    );
  }
}
