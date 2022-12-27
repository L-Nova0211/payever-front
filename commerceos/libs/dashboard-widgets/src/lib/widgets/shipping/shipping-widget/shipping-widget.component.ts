import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, Input, OnInit } from '@angular/core';
import { EMPTY } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { EditWidgetsService, MessageNameEnum } from '@pe/shared/widget';
import { Widget } from '@pe/widgets';


import { ShippingInterface } from '../../../interfaces';
import { AbstractWidgetComponent } from '../../abstract-widget.component';


@Component({
  selector: 'shipping-widget',
  templateUrl: './shipping-widget.component.html',
  styleUrls: ['./shipping-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShippingWidgetComponent extends AbstractWidgetComponent implements OnInit {
  readonly appName: string = 'shipping';
  @Input() widget: Widget;

  constructor(
    injector: Injector,
    private cdr: ChangeDetectorRef,
    private editWidgetsService:EditWidgetsService,

  ) {
    super(injector);

    this.editWidgetsService.emitEventWithInterceptor(MessageNameEnum.BUSINESS_SHIPPING_DATA);
  }

  ngOnInit(): void {
    this.editWidgetsService.defaultShippingSubject$.pipe(
      tap((shipping: ShippingInterface) => {
        this.widget = {
          ...this.widget,
          data: [
            {
              title: 'widgets.shipping.shipping-this-month',
              subtitle: shipping?.shipped?.toString() || '0',
            },
            {
              title: 'widgets.shipping.returned-this-month',
              subtitle: shipping?.return?.toString() || '0',
            },
            {
              title: 'widgets.shipping.cancelled-this-month',
              subtitle: shipping?.cancelled?.toString() || '0',
            },
          ],
          openButtonFn: () => {
            this.onOpenButtonClick();

            return EMPTY;
          },
        };
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }
}
