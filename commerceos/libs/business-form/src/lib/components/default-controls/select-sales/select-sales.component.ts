import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { SALES } from '../../../constants';
import { BaseControlComponent } from '../base-control.component';

@Component({
  selector: 'pe-select-sales',
  templateUrl: './select-sales.component.html',
  styleUrls: ['../control-styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectSalesComponent extends BaseControlComponent implements OnInit {
  salesRangeOptions: any;

  ngOnInit(): void {
    this.salesRangeOptions = this.getFormOptions(SALES, 'sales');
    this.control.setValue(this.salesRangeOptions[0].value);
  }

  private getFormOptions(data: object[], label: string): any {
    return data.map((field: { label: string; min?: number; max?: number }) => {
      const value: { min?: number; max?: number } = {};

      if (field.min !== undefined) {
        value.min = field.min;
      }
      if (field.max !== undefined) {
        value.max = field.max;
      }

      return {
        value,
        label: this.translateService.translate(`assets.${label}.${field.label}`),
      };
    });
  }
}
