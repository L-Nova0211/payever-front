import { Component, Injector, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { EMPTY } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { CouponsInterface } from '@pe/dashboard-widgets';
import { EditWidgetsService } from '@pe/shared/widget';
import { Widget } from '@pe/widgets';

import { MessageNameEnum } from '../../../services/socket.enum';
import { AbstractWidgetComponent } from '../../abstract-widget.component';

@Component({
  selector: 'coupons-widget',
  templateUrl: './coupons-widget.component.html',
  styleUrls: ['./coupons-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CouponsWidgetComponent extends AbstractWidgetComponent implements OnInit {
  readonly appName: string = 'coupons';
  @Input() widget: Widget;

  constructor(
    injector: Injector,
    private cdr: ChangeDetectorRef,
    private editWidgetsService:EditWidgetsService,

  ) {
    super(injector);

    this.editWidgetsService.emitEventWithInterceptor(MessageNameEnum.BUSINESS_DEFAULT_COUPON_DATA);
  }

  ngOnInit(): void {

    this.editWidgetsService.defaultCouponsSubject$.pipe(
      takeUntil(this.destroyed$),
      tap((data : CouponsInterface) => {
        this.widget = {
          ...this.widget,
          data: [
            {
              title : data?.code,
              subtitle : data?.description,
            },
          ],
          openButtonFn: () => {
            this.onOpenButtonClick();

            return EMPTY;
          },
        };
        this.cdr.detectChanges();
      }),

    ).subscribe();
  }
}
