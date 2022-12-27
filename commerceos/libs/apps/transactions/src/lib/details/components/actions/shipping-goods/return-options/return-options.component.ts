import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BaseShippingOptionsComponent } from '../base-options.component';


@Component({
  selector: 'pe-return-options',
  templateUrl: './return-options.component.html',
  styles: [`
    .form-background {
      display: block;
      margin-top: 12px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReturnOptionsComponent extends BaseShippingOptionsComponent {

}
