import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseSectionClass } from '../../../../classes/base-section.class';
import { TransactionsListService } from '../../../../services/list.service';
import { StatusUpdaterService } from '../../../../services/status-updater.service';
import { StatusType } from '../../../../shared/interfaces/status.type';

@Component({
  selector: 'pe-general-section',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class GeneralSectionComponent extends BaseSectionClass {

  get quantity(): number {
    return this.detailService.quantity;
  }

  constructor(
    public injector: Injector,
    public listService: TransactionsListService,
    private statusUpdaterService: StatusUpdaterService,
  ) {
    super(injector);
  }

  getStatus$(): Observable<StatusType> {
    return this.statusUpdaterService.getStatus$(this.order.transaction.uuid).pipe(map(s => s || this.order.status.general));
  }
}
