import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';


import { EnvService, MessageBus, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';

import { BaseComponent } from '../../../misc/base.component';
import { PebShippingSettingsService } from '../../../services/shipping-settings.service';
import { ConfirmDialogService } from '../browse-products/dialogs/dialog-data.service';
import { ProductsDialogService } from '../browse-products/products/products-dialog.service';

import { PebShippingProfileFormComponent } from './profiles-dialog.component';

@Component({
  selector: 'pe-profile-wrap',
  template: '<router-outlet></router-outlet>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileWrapComponent extends BaseComponent implements OnInit {
  theme = 'dark';
  productRef: PeOverlayRef;
  dialogRef: PeOverlayRef;
  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();

  constructor(
    private overlayService: PeOverlayWidgetService,
    private settingsService: PebShippingSettingsService,
    public confirmDialog: ConfirmDialogService,
    public router: Router,
    public messageBus: MessageBus,
    public route: ActivatedRoute,
    private envService: EnvService,
    private destroyed$: PeDestroyService,
    private productDialogService: ProductsDialogService,
    protected translateService: TranslateService,
  ) {
    super(translateService);
  }

  ngOnInit() {
    if (this.route.snapshot.params['mode'] === 'editing' && !this.settingsService?.profilesHelpData?.data) {
      this.router.navigate([`business/${this.envService.businessId}/shipping/profiles`]);
    }
    this.openProfileDialog(this.settingsService.profilesHelpData, this.route.snapshot.params['mode']);
  }

  openProfileDialog(data, mode) {
    const config: PeOverlayConfig = {
      data,
      headerConfig: {
        title: this.translateService.translate(
          mode === 'editing' ? data?.data?.name : 'shipping-app.modal_header.title.new_shipping'
        ),
        backBtnTitle: this.translateService.translate('shipping-app.actions.cancel'),
        backBtnCallback: () => {
          this.showConfirmationWindow(this.getConfirmationContent('profile', mode));
        },
        doneBtnTitle: this.translateService.translate('shipping-app.actions.done'),
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.dialogRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
        theme: this.theme,
      },
      backdropClick: () => {
        this.showConfirmationWindow(this.getConfirmationContent('profile', mode));
      },
      component: PebShippingProfileFormComponent,
    };
    this.dialogRef = this.overlayService.open(config);
    this.dialogRef.afterClosed
      .pipe(
        tap((data) => {
          if (data) {
            this.settingsService.saveProfile({ data, isEdit: mode === 'editing' });
          }
          this.productDialogService.selectedProducts = [];
          this.messageBus.emit('products.clear.selectedItems', true);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  showConfirmationWindow(dialogContent) {
    this.confirmDialog.open({
      cancelButtonTitle: this.translateService.translate('shipping-app.actions.no'),
      confirmButtonTitle: this.translateService.translate('shipping-app.actions.yes'),
      ...dialogContent,
    });

    this.confirmDialog.onConfirmClick().pipe(
      take(1),
    ).subscribe(() => {
      this.router.navigate([`business/${this.envService.businessId}/shipping/profiles`]);
      this.settingsService.profilesHelpData = [];
      this.dialogRef.close();
    });
  }
}
