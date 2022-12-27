import { Component } from '@angular/core';

import { AbstractWidgetComponent } from '../abstract-widget.component';

@Component({
  selector: 'pe-widget-coupon-code',
  templateUrl: './coupon-code.component.html',
  styleUrls: [
    '../common.widget.scss',
    './coupon-code.component.scss',
  ],
})
export class CouponCodeComponent extends AbstractWidgetComponent {

  constructor() {
    super();
  }
}
