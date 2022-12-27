import { Component, Injector, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { first, takeUntil, tap } from 'rxjs/operators';

import { CheckoutSharedService } from '@pe/common';
import { EditWidgetsService, MessageNameEnum } from '@pe/shared/widget';
import { SnackbarService } from '@pe/snackbar';
import { WallpaperService } from '@pe/wallpaper';
import { Widget } from '@pe/widgets';

import { CheckoutInterface } from '../../../interfaces';
import { AbstractWidgetComponent } from '../../abstract-widget.component';

@Component({
  selector: 'checkout-widget',
  templateUrl: './checkout-widget.component.html',
  styleUrls: ['./checkout-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutWidgetComponent extends AbstractWidgetComponent implements OnInit {
  @Input() widget: Widget;

  readonly appName: string = 'checkout';
  iconUrl: string;

  loadingCheckoutDirectLink$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  loadingCheckoutEdit$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    injector: Injector,
    private cdr: ChangeDetectorRef,
    protected snackbarService: SnackbarService,
    protected wallpaperService: WallpaperService,
    private editWidgetsService:EditWidgetsService,
    private checkoutSharedService: CheckoutSharedService,
  ) {
    super(injector);

    this.editWidgetsService.emitEventWithInterceptor(MessageNameEnum.BUSINESS_DEFAULT_CHECKOUT_DATA);
  }

  ngOnInit() {
    this.editWidgetsService.defaultCheckoutSubject$.pipe(
      tap((payment) => {
        this.widget = {
          ...this.widget,
          data: [
            {
              title: 'widgets.checkout.actions.open-direct-link',
              isButton: true,
              // icon: '#icon-apps-cart',
              notProcessLoading: true,
              onSelect: (data) => {
                this.onDirectLinkClick(data);

                return EMPTY;
              },
              onSelectData: payment,
            },
            {
              title: 'widgets.checkout.actions.edit-checkout',
              isButton: true,
              // icon: '#icon-edit-pencil-24',
              onSelect: (data) => {
                this.onEditCheckout(data);

                return EMPTY;
              },
              onSelectData: payment,
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

    ).subscribe()
  }

  onDirectLinkClick(checkout: CheckoutInterface): void {
    this.checkoutSharedService.locale$.pipe(
      first(),
      tap((locale) => {
        const link = this.widgetsApiService.makeCheckoutDirectLink(checkout.linkChannelSetId, locale);
        const win = window.open(link, '_blank');
        win.focus();
      }),
    ).subscribe();
  }

  onEditCheckout(checkout: CheckoutInterface): void {
    this.loadingCheckoutEdit$.next(true);
    this.router
    .navigate(['business', this.businessData._id, this.appName, checkout.checkoutId, 'panel-edit'])
    .then(() => {
      this.showButtonSpinner$.next(false);
      this.wallpaperService.showDashboardBackground(false);
    });
  }

  protected showError(error: string): void {
    this.snackbarService.toggle(true, {
      content: 'Unknown_error',
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24,
    });
  }
}
