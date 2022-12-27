import { SafeStyle } from '@angular/platform-browser';
import moment from 'moment';
import { Subject } from 'rxjs';

import { PopularProductInterface } from '../../../interfaces';


export class ProductItem implements PopularProductInterface {
  _id: string;
  id: string;
  business: string;
  name: string;
  imageSrc: SafeStyle;
  title: string;
  price: number;
  currency: string;
  quantity: number;
  lastSell: Date;
  lastBuy: string;
  uuid: string;
  thumbnailSanitized: SafeStyle;
  loading$: Subject<boolean> = new Subject();
  constructor(item: PopularProductInterface, period?: string) {

    Object.assign(this, item);
    this.title = this.name;
    this.imageSrc = this.thumbnailSanitized;
    this.lastBuy = this.getPeriodDescription(period);

  }

  private getPeriodDescription(period?: string): string {
    let periodDescription: string = period;
    if (!period) {
      const curDate = moment(new Date());
      const sellDate = moment(this.lastSell);
      const duration = moment.duration(curDate.diff(sellDate));

      const minutes = Math.round(duration.asMinutes());
      const hours = Math.round(duration.asHours());

      if (minutes < 60) {
        periodDescription = minutes > 1 ? `${minutes} minutes ago` : `1 minute ago`;
      } else if (hours < 24) {
        periodDescription = hours > 1 ? `${hours} hrs ago` : `1 hour ago`;
      } else {
        const days = Math.round(duration.asDays());
        if (days > 7) {
          periodDescription = sellDate.format('DD.MM.YY');
        } else {
          periodDescription = days > 1 ? `${days} days ago` : `1 day ago`;
        }
      }
    }

    return periodDescription;
  }

  thumbnail: string;
}
