import { HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { EMPTY, of } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeAlertDialogService } from '@pe/alert-dialog';
import { PebEditorApi } from '@pe/builder-api';
import { PebShopContainer } from '@pe/builder-core';
import { EnvService, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PebShopsApi } from '../../services/abstract.shops.api';
import { ShopEnvService } from '../../services/shop-env.service';


@Component({
  selector: 'peb-create-app',
  templateUrl: './create-app.component.html',
  styleUrls: ['./create-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeSettingsCreateAppComponent {
  shopId: string;
  errorMsg: string;
  isImageLoading: boolean;

  shopConfig = {
    shopName: '',
    shopImage: '',
  }

  constructor(
    private destroy$: PeDestroyService,
    private apiShop: PebShopsApi,
    @Inject(PE_OVERLAY_DATA) public appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    @Inject(EnvService) private shopEnv: ShopEnvService,
    private overlay: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    private api: PebEditorApi,
    private alertDialog: PeAlertDialogService,
    private translateService: TranslateService,
  ) {

    if (this.appData.id) {
      this.config.doneBtnTitle = 'Open';
      this.config.title = this.appData.name;
      this.shopConfig.shopName = this.appData.name;
      this.shopConfig.shopImage = this.appData.picture;
      this.shopId = this.appData.id;
      this.config.doneBtnCallback = () => {
        const paylod: {
          id: string,
          name?: string,
          picture?: string,
        } = {
          id: this.appData.id,
        }
        if (this.shopConfig.shopName !== this.appData.name) {
          paylod.name = this.shopConfig.shopName;
        }
        if (this.shopConfig.shopImage !== this.appData.picture) {
          paylod.picture = this.shopConfig.shopImage;
        }
        if (!this.errorMsg) {
          if (!paylod.picture && !paylod.name) {
            this.appData.isDefault ?
              this.openDashboard(this.appData) :
              this.apiShop.markShopAsDefault(this.appData.id).subscribe((data) => {
                this.openDashboard(data);
              });
          }
          else {
            this.apiShop.updateShop(paylod).pipe(
              switchMap((shop) => {
                return this.appData.isDefault ?
                  of(this.openDashboard(shop)) :
                  this.apiShop.markShopAsDefault(this.appData.id).pipe(tap(data => this.openDashboard(data)));
              }),
            ).subscribe((data) => { }, (error) => {
              this.errorMsg = error.error.errors;
              this.cdr.markForCheck();
            })
          }
        }
      }

      return;
    }
    this.config.doneBtnTitle = 'Create';
    this.config.doneBtnCallback = () => {
      const payload: { name: string, picture?: string } = {
        name: this.shopConfig.shopName,
      }
      if (this.shopConfig.shopImage) {
        payload.picture = this.shopConfig.shopImage;
      }
      if (!this.errorMsg) {
        this.apiShop.createShop(payload).pipe(
          switchMap((data) => {
            this.appData.id = data.id;

            return this.apiShop.markShopAsDefault(data.id);
          }),
          tap((data) => {
            this.openDashboard(data);
          }),
        ).subscribe()
      }
    }
  }

  openDashboard(shop) {
    this.shopEnv.shopId = this.appData.id;
    this.appData.onSaved$.next({ openShop: true, shop });
    this.overlay.close();
  }

  validateShop(event) {
    const value = event.target.value;
    this.shopConfig.shopName = value;
    if (!this.validateName(value)) {
      this.errorMsg = value.length < 3 ? 'Name should have at least 3 characters' : 'Name is not correct';
      this.cdr.markForCheck();

      return;
    }
    this.apiShop.validateShopName(value).subscribe((data) => {
      this.errorMsg = data.message && value != this.appData.name ? data.message : null;
      this.cdr.markForCheck();
    })
  }

  validateName(name: string) {
    return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]$/.test(name);
  }

  removeShop() {
    const dialog = this.alertDialog.open({
      data: {
        title: this.translateService.translate('shop-app.dialogs.window_exit.title'),
        subtitle: this.translateService.translate('shop-app.dialogs.delete-shop.label'),
        actions: [
          {
            label: this.translateService.translate('shop-app.dialogs.window_exit.confirm'),
            bgColor: '#eb4653',
            callback: () => Promise.resolve({ exit: true }),
          },
          {
            label: this.translateService.translate('shop-app.dialogs.window_exit.decline'),
            callback: () => Promise.resolve({ exit: false }),
          },
        ],
      },
    });
    dialog.afterClosed().pipe(
      switchMap((result) => {
        if (result.exit) {
          return this.apiShop.deleteShop(this.appData.id).pipe(
            tap((data) => {
              this.appData.onSaved$.next({ updateShopList: true });
              this.overlay.close();
            }),
          );
        }

        return EMPTY;
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onLogoUpload($event: any) {
    this.isImageLoading = true;
    const files = $event;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.api.uploadImageWithProgress(PebShopContainer.Images, file).pipe(
          takeUntil(this.destroy$),
          tap((event) => {
            switch (event.type) {
              case HttpEventType.UploadProgress: {
                this.cdr.detectChanges();
                break;
              }
              case HttpEventType.Response: {
                this.shopConfig.shopImage = (event?.body?.blobName || reader.result as string);
                this.isImageLoading = false;
                this.cdr.detectChanges();
                break;
              }
              default:
                break;
            }
          }),
        ).subscribe();
      };
    }
  }

}
