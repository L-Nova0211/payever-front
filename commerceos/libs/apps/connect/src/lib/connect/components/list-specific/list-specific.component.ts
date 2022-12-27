import { Component, Injector, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { takeUntil, filter, take } from 'rxjs/operators';

import { MessageBus } from '@pe/common';

import {
  BaseListComponent, IntegrationCategory, IntegrationInfoWithStatusInterface,
} from '../../../shared';

/** @deprecated TODO Remove when CAF-95 and PSF-57 released **/
@Component({
  selector: 'connect-list-specific',
  templateUrl: './list-specific.component.html',
  styleUrls: ['./list-specific.component.scss'],
})
export class ListSpecificComponent extends BaseListComponent implements OnInit {

  micro: string;
  microPath: string;
  selectIntegration: string;
  specificCatrgory: string;
  entityName: string;
  entityUuid: string;

  list$: Observable<IntegrationInfoWithStatusInterface[]> = null;
/*
  modalHeaderControls: any = [
    {
      position: 'center',
      type: 'text',
      iconPrepend: 'icon-apps-app-market',
      iconPrependSize: 16,
      text: this.translateService.translate('list_specific.title')
    },
    {
      position: 'right',
      type: 'link',
      iconPrepend: 'icon-x-16',
      iconPrependSize: 16,
      onClick: () => this.onClose(),
      classes: 'mat-button-no-padding'
    }
  ];
*/
  private installingIntegration: string = null;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.micro = this.clearString(this.activatedRoute.snapshot.params['micro']);
    this.microPath = this.activatedRoute.snapshot.queryParams['microPath'];

    this.microPath = this.microPath ? encodeURIComponent(this.microPath) : this.microPath; // repeat commit missed code
    this.selectIntegration = this.activatedRoute.snapshot.params['selectIntegration'];
    this.specificCatrgory = this.clearString(this.activatedRoute.snapshot.params['specificCatrgory']);
    this.entityName = this.activatedRoute.snapshot.queryParams['entityName'] ||
      this.activatedRoute.snapshot.queryParams['panel'] ||
      'checkout'; // TODO Fix for Checkout app
    this.entityUuid = this.activatedRoute.snapshot.queryParams['entityUuid'] ||
      this.activatedRoute.snapshot.queryParams['terminalId'] ||
      this.activatedRoute.snapshot.queryParams['checkoutUuid'];

    const list$ = this.integrationsStateService.getCategoriesIntegrations(
      false, [this.specificCatrgory] as IntegrationCategory[]).pipe(
      takeUntil(this.destroyed$)
    );

    if (this.selectIntegration) {
      this.integrationsStateService.getIntegration(this.selectIntegration).pipe(
        takeUntil(this.destroyed$),
        filter(d => !!d),
        take(1)
      ).subscribe((item: IntegrationInfoWithStatusInterface) => {
        if (item) {
          this.openIntegration(item);
        } else {
          console.error('Integration not found in list:', this.selectIntegration);
        }
      });
    } else {
      this.list$ = list$.pipe(filter(d => !!d));
    }
  }

  saveReturn(category: IntegrationCategory): void {
    const businessId = this.integrationsStateService.getBusinessId();
    if (this.microPath) {
      this.navigationService.saveReturn(
      `business/${businessId}/connect/back-to-micro/${this.micro}/micro-path/${this.microPath}`);
    } else if (this.entityUuid) {
      this.navigationService.saveReturn(
      `business/${businessId}/connect/back-to-micro/${this.micro}/category/${category}/${this.entityName}/${this.entityUuid}`);
    } else {
      this.navigationService.saveReturn(
      `business/${businessId}/connect/back-to-micro/${this.micro}/category/${category}`);
    }
  }

  onClose(): void {
    let microPath: string;
    if (this.microPath) {
      microPath = decodeURIComponent(this.microPath);
    } else if (this.specificCatrgory && this.entityUuid) {
      microPath = `${this.entityUuid}/panel-${this.specificCatrgory}`;
    }
    /*
    this.platformService.dispatchEvent({
      target: 'dashboard-micro-navigation',
      action: '',
      data: microPath ? `${this.micro}/${microPath}` : this.micro
    });*/

    const messageBus: MessageBus = this.injector.get(MessageBus);
    messageBus.emit('connect.navigate-to-app', microPath ? `${this.micro}/${microPath}` : this.micro);
  }

  installIntegrationDirectly(integration: IntegrationInfoWithStatusInterface): void {
    if (!this.installingIntegration) {
      this.installingIntegration = integration.name;
      this.integrationsStateService.installIntegration(integration.name, true)
        .subscribe(() => {
          const businessId = this.integrationsStateService.getBusinessId();
          if (this.entityUuid) {
            this.navigationService.saveReturn(
            `business/${businessId}/connect/back-to-micro/${this.micro}/category/${integration.category}/${this.entityName}/${this.entityUuid}`);
          } else {
            this.navigationService.saveReturn(
            `business/${businessId}/connect/back-to-micro/${this.micro}/category/${integration.category}`);
          }
          this.router.navigate([`business/${businessId}/connect/${integration.category}/configure/${integration.name}`]);
        });
    }
  }

  isInstalling(integration: IntegrationInfoWithStatusInterface): boolean {
    return this.installingIntegration === integration.name;
  }
}
