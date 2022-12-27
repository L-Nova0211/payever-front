/**
 * Inner component of integration-full-page, displays the app news
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

import { IntegrationsStateService, IntegrationInfoWithStatusInterface } from '../../../shared';

@Component({
  selector: 'connect-integration-news',
  templateUrl: './integration-news.component.html',
  styleUrls: ['./integration-news.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntegrationNewsComponent {

  @Input() integration: IntegrationInfoWithStatusInterface;

  constructor(
    private router: Router,
    private integrationsStateService: IntegrationsStateService
  ) {}

  /**
   * Navigate to other page
   * @param route - navigation url
   */
  navigate(route: string) {
    const businessId = this.integrationsStateService.getBusinessId();
    this.router.navigate([`business/${businessId}/connect/${this.integration.category}/integrations/${this.integration.name}/${route}`]);
  }
}
