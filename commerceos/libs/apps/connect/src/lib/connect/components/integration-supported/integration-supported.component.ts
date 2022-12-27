import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { IntegrationInfoWithStatusInterface } from '../../../shared';

@Component({
  selector: 'connect-integration-supported',
  templateUrl: './integration-supported.component.html',
  styleUrls: ['./integration-supported.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntegrationSupportedComponent {

  @Input() integration: IntegrationInfoWithStatusInterface;

}
