/**
 * Inner component of integration-full-page, displays the app description and carousel
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';

import { IntegrationInfoWithStatusInterface } from '../../../shared';

@Component({
  selector: 'connect-integration-app',
  templateUrl: './integration-app.component.html',
  styleUrls: ['./integration-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntegrationAppComponent {

  @Input() integration: IntegrationInfoWithStatusInterface;

  swiperConfig: SwiperConfigInterface = {
    direction: 'horizontal',
    slidesPerView: 2,
    spaceBetween: 30,
    autoHeight: true,
    centerInsufficientSlides: true,
    freeMode: true,
  };

  /**
   * Open side resource
   * @param link - url
   */
  navigateByLink(link: string) {
    window.open(link, '_blank');
  }
}
