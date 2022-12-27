import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { PopularProductByChannelSetInterface } from '../../../interfaces';

@Component({
  selector: 'store-stats',
  styleUrls: ['./store-stats.component.scss'],
  templateUrl: './store-stats.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreStatsComponent {
  @Input() statsTitle: string;
  @Input() statsCounter: string;
  @Input() productsTitle: string;
  @Input() products: PopularProductByChannelSetInterface[];
  @Input() statsCounterSmaller: boolean;
}

