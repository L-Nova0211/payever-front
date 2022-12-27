import { Component, Injector, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { EditWidgetsService, MessageNameEnum } from '@pe/shared/widget';
import { Widget } from '@pe/widgets';

import { ShopInterface } from '../../../interfaces';
import { AbstractWidgetComponent } from '../../abstract-widget.component';


@Component({
  selector: 'store-widget',
  templateUrl: './store-widget.component.html',
  styleUrls: ['./store-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreWidgetComponent extends AbstractWidgetComponent implements OnInit {
  readonly appName: string = 'shop';
  @Input() widget: Widget;

  constructor(
    injector: Injector,
    private cdr: ChangeDetectorRef,
    private editWidgetsService:EditWidgetsService,

  ) {
    super(injector);

    this.editWidgetsService.emitEventWithInterceptor(MessageNameEnum.BUSINESS_DEFAULT_SHOP_DATA);
  }

  ngOnInit(): void {
    this.editWidgetsService.defaultShopSubject$.pipe(
      tap((shop: ShopInterface) => {

        this.widget = {
          ...this.widget,
          data: [
            {
              title: shop?.shopName,
              isButton: false,
              imgSrc: shop?.shopLogo,
            },
            {
              title: 'widgets.store.actions.edit-store',
              isButton: true,
              onSelect: () => this.openShop(shop?.shopId),
            },
          ],
          openButtonFn: () => {
            this.onOpenButtonClick();

            return EMPTY;
          },
        };

        this.appUrlPath = `${this.appName}/${shop?.shopId}/dashboard`;
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroyed$),
    ).subscribe()
  }

  openShop(shopId: string): Observable<any> {
    this.router.navigate(['business', this.businessData._id, 'shop', shopId, 'edit']);

    // this.envService.shopId = shopId;
    return EMPTY;
  }
}
