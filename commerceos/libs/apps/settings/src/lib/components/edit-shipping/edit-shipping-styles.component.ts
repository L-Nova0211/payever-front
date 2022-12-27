import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'pe-edit-shipping-styles',
  template: '',
  styles: ['.pac-container { z-index: 200100; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class EditShippingStylesComponent {}
