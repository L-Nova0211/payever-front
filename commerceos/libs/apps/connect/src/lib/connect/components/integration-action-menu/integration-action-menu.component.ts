import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { IntegrationsStateService, IntegrationCategory, IntegrationInfoWithStatusInterface } from '../../../shared';
import { PaymentsStateService } from '../../../shared';


@Component({
  selector: 'integration-action-menu',
  templateUrl: './integration-action-menu.component.html',
  styleUrls: ['./integration-action-menu.component.scss'],
})
export class IntegrationActionMenuComponent  {

  @Input() integration: IntegrationInfoWithStatusInterface;
  @Output() saveReturn: EventEmitter<IntegrationCategory> = new EventEmitter();
  isInstallingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private integrationsStateService: IntegrationsStateService,
    private router: Router,
    private paymentsStateService: PaymentsStateService,
  ) { }

  get name(): string {
    return this.integration && this.integration.name;
  }

  uninstallIntegration(): void {
    if (!this.isInstallingSubject.getValue()) {
      this.isInstallingSubject.next(true);
      this.integrationsStateService.installIntegration(
        this.name, false).subscribe((integration) => {
        this.saveReturn.emit(this.integration.category);
        const businessId = this.integrationsStateService.getBusinessId();
        this.router.navigate([
          `business/${businessId}/connect/${this.integration.category}/integrations/${this.integration.name}/done`,
        ]);
      }, (error) => {
        console.error('Cant install/uninstall', error);
        this.paymentsStateService.handleError(error, true);
        this.isInstallingSubject.next(false);
      });
    }
  }
}
