import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IntegrationCategory } from '../../interfaces';
import { StorageService } from '../../services/storage.service';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'connect-app-edit',
  templateUrl: './connect-app-edit.component.html',
})
export class ConnectAppEditComponent  {

  constructor(private storageService: StorageService,
              private activatedRoute: ActivatedRoute
  ) {
  }


  get checkoutUuid(): string {
    return this.activatedRoute.snapshot.params['checkoutUuid']
    || this.activatedRoute.parent.snapshot.params['checkoutUuid'];
  }

  get category(): IntegrationCategory {
    return this.activatedRoute.snapshot.params['category'];
  }

  get integrationName(): string {
    return this.activatedRoute.snapshot.params['integrationName'];
  }

  get backPath(): string {
    return `/business/${this.storageService.businessUuid}/checkout/${this.checkoutUuid}/panel-${this.category}`;
  }
}
