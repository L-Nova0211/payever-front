import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { CustomChannelTypeEnum, IntegrationCategory, IntegrationInfoInterface } from '../../interfaces';

@Component({
  selector: 'checkout-expansion-menu-list',
  templateUrl: './expansion-menu-list.component.html',
  styleUrls: ['./expansion-menu-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ExpansionMenuListComponent {

  @Input() category: IntegrationCategory;
  @Input() integrations: IntegrationInfoInterface[] = [];
  @Input() enabledIntegrations: string[] = null;
  @Input() noActionsIntegrations: string[] = null;
  @Input() isShowAddButton = true;
  @Input() isShowToggleButton = false;
  @Input() noPaddingLeft = false;
  @Input() sizeMd = false;

  @Output() clickedToggleButton = new EventEmitter<IntegrationInfoInterface>();
  @Output() clickedIntegrationButton = new EventEmitter<IntegrationInfoInterface>();
  @Output() clickedAddButton = new EventEmitter<IntegrationCategory>();

  openingIntegration$: BehaviorSubject<IntegrationInfoInterface> = new BehaviorSubject(null);

  readonly channelsModals: CustomChannelTypeEnum[] = [
    CustomChannelTypeEnum.QR,
  ];

  toggleClick(integration: IntegrationInfoInterface) {
    this.clickedToggleButton.emit(integration);
  }

  onOpen(integration: IntegrationInfoInterface) {
    this.openingIntegration$.next(integration);
    this.clickedIntegrationButton.emit(integration);
  }

  isLoading(integration: IntegrationInfoInterface) {
    return this.openingIntegration$?.value?.integration?.name === integration?.integration.name
      && this.channelsModals.indexOf(integration.integration.name as CustomChannelTypeEnum) < 0;
  }
}
