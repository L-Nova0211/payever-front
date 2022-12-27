import { HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { catchError, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeAlertDialogService } from '@pe/alert-dialog';
import { PebEditorApi } from '@pe/builder-api';
import { PebShopContainer } from '@pe/builder-core';
import { PeDestroyService } from '@pe/common';
import { EnvService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { DOMAIN_REGX } from '../../constants';
import { SiteEnvService } from '../../services/site-env.service';
import { PebSitesApi } from '../../services/site/abstract.sites.api';

@Component({
  selector: 'peb-create-app',
  templateUrl: './create-app.component.html',
  styleUrls: ['./create-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeSettingsCreateAppComponent {
  siteId: string;
  errorMsg: string;
  isImageLoading: boolean;

  siteConfig: FormGroup;
  errors = {
    siteName: {
      hasError: false,
      errorMessage: '',
    },
    siteImage: {
      hasError: false,
      errorMessage: '',
    },
  };


  constructor(
    private destroy$: PeDestroyService,
    private apiSite: PebSitesApi,
    @Inject(PE_OVERLAY_DATA) public appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    @Inject(EnvService) protected envService: SiteEnvService,
    private cdr: ChangeDetectorRef,
    private api: PebEditorApi,
    private alertDialog: PeAlertDialogService,
    private translateService: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private ref: ChangeDetectorRef
  ) {

    this.siteConfig = this.formBuilder.group({
      siteName: ['', [Validators.required, Validators.pattern(DOMAIN_REGX)]],
      siteImage: [''],
    });

    if (this.appData.id) {
      this.config.doneBtnTitle = 'Open';
      this.config.title = this.appData.name;

      this.siteConfig.patchValue({
        siteName: this.appData.name,
        siteImage: this.appData.picture,
      });
      this.siteId = appData.id;
      this.config.doneBtnCallback = () => {
        const paylod: {
          name?: string,
          picture?: string,
        } = {};
        if (this.siteConfig.controls.siteName.value !== this.appData.name) {
          paylod.name = this.siteConfig.controls.siteName.value;
        }
        if (this.siteConfig.controls.siteImage.value !== this.appData.picture) {
          paylod.picture = this.siteConfig.controls.siteImage.value;
        }
        if (!this.errorMsg) {
          if (!paylod.picture && !paylod.name) {
            this.appData.isDefault ?
              this.openDashboard(this.appData) :
              this.apiSite.markSiteAsDefault(this.appData.id).subscribe((data) => {
                this.openDashboard(data);
              });
          }
          else {
            this.apiSite.updateSite(this.appData.id, paylod).pipe(
              switchMap((site) => {
                return this.appData.isDefault ?
                  of(this.openDashboard(site)) :
                  this.apiSite.markSiteAsDefault(this.appData.id)
                    .pipe(tap(data => this.openDashboard(data)));
              }),
            ).subscribe((data) => { }, (error) => {
              this.errorMsg = error.error.errors;
              this.cdr.markForCheck();
            });
          }
        }
      };

      return;
    }
    this.config.doneBtnTitle = this.translateService.translate('site-app.actions.create');
    this.config.doneBtnCallback = () => {
      this.config.isLoading = true;
      this.config.doneBtnTitle = this.translateService.translate('site-app.actions.loading');
      const payload: { name: string, picture?: string } = {
        name: this.siteConfig.controls.siteName.value,
      };
      if (this.siteConfig.controls.siteImage.value) {
        payload.picture = this.siteConfig.controls.siteImage.value;
      }
      if (!this.errorMsg) {
        this.apiSite.createSite(payload).pipe(
          switchMap((data) => {
            this.appData.id = data.id;

            return this.apiSite.markSiteAsDefault(data.id);
          }),
          tap((data) => {
            this.openDashboard(data);
         }),
         finalize(() => {
          this.config.isLoading = false;
          this.config.doneBtnTitle = this.translateService.translate('site-app.actions.create');
          this.ref.markForCheck();
         })
        ).subscribe();
      }
    };
  }

  checkErrors(field) {
    const form = this.siteConfig.get(field);
    if (form.invalid) {
      this.errors[field].hasError = true;
      if (form.errors.required) {
        this.errors[field].errorMessage = this.translateService.translate('forms.error.validator.required');
      }

      if (form.errors.pattern){
        this.errors[field].errorMessage = this.translateService.translate('forms.error.validator.website.pattern');
      }

      this.changeDetectorRef.detectChanges();
    }
  }

  resetErrors(field) {
    this.errors[field].hasError = false;
  }

  openDashboard(site) {
    this.envService.applicationId = this.appData.id;
    this.appData.onSaved$.next({ openSite: true, site });
    this.overlay.close();
  }

  removeSite() {
    this.alertDialog.open({
      data: {
        title: this.translateService.translate('site-app.dialogs.window_exit.title'),
        subtitle: this.translateService.translate('site-app.dialogs.delete_site.label'),
        actions: [
          {
            label: this.translateService.translate('site-app.dialogs.window_exit.confirm'),
            bgColor: '#eb4653',
            callback: () => this.apiSite.deleteSite(this.appData.id).pipe(
              tap(() => this.appData.onSaved$.next({ updateSiteList: true })),
              catchError(() => of(undefined)),
              finalize(() => this.overlay.close()),
            ).toPromise(),
          },
          {
            label: this.translateService.translate('site-app.dialogs.window_exit.decline'),
            callback: () => Promise.resolve(),
          },
        ],
      },
    });
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
                this.siteConfig.controls.siteImage.patchValue( (event?.body?.blobName || reader.result as string));
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
