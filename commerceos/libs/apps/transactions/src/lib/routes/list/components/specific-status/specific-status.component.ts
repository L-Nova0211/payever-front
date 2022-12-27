import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PeGridItem } from '@pe/grid';

import { StatusUpdaterService } from '../../../../services/status-updater.service';
import { paymentsHaveNoSpecificStatus, PaymentType, TransactionInterface } from '../../../../shared';

@Component({
  selector: 'pe-specific-status-field',
  template: `<span *ngIf="(getSpecificStatus$() | async) as ss">{{ ss }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecificStatusFieldComponent implements AfterViewInit {
  @Input() item: PeGridItem<TransactionInterface>;

  get specificStatus(): string {
    return this.item.data.specific_status;
  }

  constructor(
    private statusUpdaterService: StatusUpdaterService,
    private cdr: ChangeDetectorRef
  ) {
  }

  getSpecificStatus$(): Observable<string> {
    return this.statusUpdaterService.getSpecificStatus$(this.item.data.serviceEntityId).pipe(
      map(s => s || this.specificStatus),
      map(s => this.isHideSpecificStatus(this.item.data.type) ? '-' : s)
    );
  }

  ngAfterViewInit() {
    this.cdr.detach();
  }

  private isHideSpecificStatus(payment: PaymentType): boolean {
    return paymentsHaveNoSpecificStatus.indexOf(payment) >= 0;
  }
}
