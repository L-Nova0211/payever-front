import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  IntegrationCategory,
  IntegrationInfoInterface,
  CheckoutConnectionInterface,
  IntegrationWithConnectionInterface,
  InstalledConnectionInterface,
} from '../../interfaces';

@Component({
  selector: 'checkout-expansion-conn-menu-list',
  templateUrl: './expansion-conn-menu-list.component.html',
  styleUrls: ['./expansion-conn-menu-list.component.scss'],
})
export class ExpansionConnMenuListComponent {

  @Input() category: IntegrationCategory;
  @Input() integrations: IntegrationInfoInterface[] = null;
  @Input() connections: CheckoutConnectionInterface[] = null;
  @Input() installedConnections: InstalledConnectionInterface[] = null;

  @Input() isShowAddButton = true;
  @Input() isShowToggleButton = false;
  @Input() noPaddingLeft = false;
  @Input() sizeMd = false;

  @Output() clickedToggleButton = new EventEmitter<IntegrationWithConnectionInterface>();
  @Output() clickedOpenButton = new EventEmitter<IntegrationInfoInterface>();
  @Output() clickedAddButton = new EventEmitter<IntegrationCategory>();

  openingIntegration$: BehaviorSubject<IntegrationInfoInterface> = new BehaviorSubject(null);

  getIntegrationConnections(integration: IntegrationInfoInterface): CheckoutConnectionInterface[] {
    const result = (this.connections || []).filter(conn => conn.integration === integration.integration.name);

    return result;
  }

  toggleClick(integration: IntegrationInfoInterface, connection: CheckoutConnectionInterface) {
    this.clickedToggleButton.emit({ integration, connection });
  }

  onOpen(integration: IntegrationInfoInterface) {
    if (!this.openingIntegration$.getValue()) {
      this.openingIntegration$.next(integration);
      this.clickedOpenButton.emit(integration);
    }
  }

  isConnectionInstalled(connection: CheckoutConnectionInterface): boolean {
    return this.installedConnections.map(conn => conn._id).indexOf(connection._id) >= 0;
  }
}
