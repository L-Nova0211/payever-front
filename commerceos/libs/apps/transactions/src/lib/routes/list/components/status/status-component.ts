import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, NgZone, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { first, map, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { PeGridItem } from '@pe/grid';

import { TransactionsListService } from '../../../../services/list.service';
import { StatusUpdaterService } from '../../../../services/status-updater.service';
import { StatusType, TransactionInterface } from '../../../../shared';

@Component({
  selector: 'pe-status-name',
  templateUrl: './status-component.html',
  styleUrls: ['./status-component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})

export class StatusComponent implements AfterViewInit {
  @Input() item: PeGridItem<TransactionInterface>;
  @Input() minWidth: 0;

  @ViewChild('statusRef', { static: false }) statusRef: ElementRef<HTMLDivElement>;

  constructor(
    private statusUpdaterService: StatusUpdaterService,
    private transactionsListService: TransactionsListService,
    private destroyed$: PeDestroyService,
    private ngZone: NgZone
  ) {
  }

  ngAfterViewInit(): void {
    this.getStatus$(this.item).pipe(
      tap(() => {
        if (this.statusRef?.nativeElement?.offsetWidth > this.statusUpdaterService.width) {
          this.ngZone.onStable.asObservable().pipe(first(),takeUntil(this.destroyed$)).subscribe(() => {
            this.statusUpdaterService.setWidth(this.statusRef.nativeElement.offsetWidth);
          });
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  getWidth$(): Observable<number> {
    return this.statusUpdaterService.getWidth$();
  }

  getStatusLoading$(item: PeGridItem<TransactionInterface>): Observable<boolean> {
    return this.statusUpdaterService.isLoading$(item.data.uuid);
  }

  getStatus$(item: PeGridItem<TransactionInterface>): Observable<StatusType> {
    return this.statusUpdaterService.getStatus$(item.data.uuid).pipe(
      map(s => s || item.data.status)
    );
  }

  getStatusColor$(item: PeGridItem<TransactionInterface>): Observable<string> {
    return this.getStatus$(item).pipe(map(s => this.transactionsListService.getStatusColor(s)));
  }
}
