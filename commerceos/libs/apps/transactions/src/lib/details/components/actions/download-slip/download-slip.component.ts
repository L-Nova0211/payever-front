import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { BusinessInterface, PeDestroyService } from '@pe/common';

import { ApiService } from '../../../../services/api.service';
import { AbstractAction } from '../../../../shared/abstractions/action.abstract';
import { ShippingSlipInterface } from '../../../../shared/interfaces/shipping-slip.interface';

@Component({
  selector: 'pe-download-slip-action',
  templateUrl: './download-slip.component.html',
  providers: [
    PeDestroyService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ActionDownloadSlipComponent extends AbstractAction {
  data: ShippingSlipInterface = null;

  get business(): BusinessInterface {
    return this.envService.businessData;
  }

  constructor(
    public injector: Injector,
    private apiService: ApiService
  ) {
    super(injector);
  }

  getData() {
    this.apiService.getShippingSlip(this.envService.businessId, this.orderId).pipe(
      takeUntil(this.destroy$)
    ).subscribe(
      res => {
        this.data = res;
      },
      err => {
        this.showError(err.error);
      }
    );
  }

  createForm() {}
}
