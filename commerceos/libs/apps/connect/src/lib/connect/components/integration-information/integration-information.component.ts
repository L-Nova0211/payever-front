/**
 * Inner component of integration-full-page, displays the app information
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { IntegrationInfoWithStatusInterface } from '../../../shared';

@Component({
  selector: 'connect-integration-information',
  templateUrl: './integration-information.component.html',
  styleUrls: ['./integration-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntegrationInformationComponent {

  @Input() integration: IntegrationInfoWithStatusInterface;

    /**
   * Open side resource
   * @param url - url
   */
  openLink(url: string) {
    if (url === 'policy' || url === 'agreement') {
      return;
    }

    window.open(url, '_blank');
  }
}
