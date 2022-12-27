import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, Input, OnInit } from '@angular/core';
import { EMPTY } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { EditWidgetsService, MessageNameEnum } from '@pe/shared/widget';
import { Widget } from '@pe/widgets';


import { SubscriptionInterface } from '../../../interfaces';
import { AbstractWidgetComponent } from '../../abstract-widget.component';


@Component({
  selector: 'subscriptions-widget',
  templateUrl: './subscriptions-widget.component.html',
  styleUrls: ['./subscriptions-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionsWidgetComponent extends AbstractWidgetComponent implements OnInit {
  readonly appName: string = 'subscriptions';
  @Input() widget: Widget;

  constructor(
    injector: Injector,
    private cdr: ChangeDetectorRef,
    private editWidgetsService:EditWidgetsService,

  ) {
    super(injector);

    this.editWidgetsService.emitEventWithInterceptor(MessageNameEnum.BUSINESS_DEFAULT_SUBSCRIPTION_DATA);
  }

  ngOnInit(): void {
    this.editWidgetsService.defaultSubscriptionSubject$.pipe(
      tap((subscription: SubscriptionInterface) => {
        this.widget = {
          ...this.widget,
          data: [
            {
              title: 'widgets.subscription.subscribed-total',
              subtitle: subscription?.total?.toString() || '0',
            },
            {
              title: 'widgets.subscription.subscribed-this-month',
              subtitle: subscription?.subscribed?.toString() || '0',
            },
            {
              title: 'widgets.subscription.unsubscribed-this-month',
              subtitle: subscription?.unsubscribed?.toString() || '0',
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
