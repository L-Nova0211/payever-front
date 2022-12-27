/**
 * Component for rating lines display
 */

import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { AbstractComponent } from '../../../shared';

/**
 * Component accepts array of ratings.
 * ratingsArray[0] - how much ★ is in rating
 * ratingsArray[1] - how much ★★
 * ratingsArray[2] - how much ★★★ etc.
 */
@Component({
  selector: 'connect-integration-rating-lines',
  templateUrl: './integration-rating-lines.component.html',
  styleUrls: ['./integration-rating-lines.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntegrationRatingLinesComponent extends AbstractComponent {

  FILLED_STAR = '★';

  @Input() ratingsArray = [];
  totalCount = 0;

  constructor(public sanitizer: DomSanitizer) {
    super();
   }

   /**
    * get percent value to pass it to css width of filled hr
    * @param value - rating value
    */
   getPercentFromTotal(value: number): string {
     if (!this.totalCount) {
       this.totalCount = this.getTotalStarsCount();
     }

     return (value / this.totalCount * 100).toFixed(0) + '%';
   }

   /**
    * Calculate total count of stars in rating
    */
   getTotalStarsCount(): number {
     let total = 0;
     this.ratingsArray.map((count) => {
       total += count;
     });

     return total;
   }
}
