import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Select } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { BusinessState, LoadBusinesses, ResetBusinessState } from '@pe/business';
import { AppThemeEnum, MessageBus } from '@pe/common';
import { ConfirmActionDialogComponent } from '@pe/confirm-action-dialog';
import { TranslateService } from '@pe/i18n';
import { MediaService } from '@pe/media';

import { AbstractComponent } from '../../components/abstract';
import { settingsBusinessIdRouteParam } from '../../misc/constants';
import { getUniqueId } from '../../misc/helpers/unique-id-counter.helper';
import { BusinessInterface, ProfileMenuEventInterface } from '../../misc/interfaces';
import { AbbreviationPipe } from '../../misc/pipes/abbreviation.pipe';
import { ApiService, BusinessEnvService, PlatformService } from '../../services';
import { ImagesUploaderService } from '../../services/images-uploader.service';
import { SettingsRoutesEnum } from '../../settings-routes.enum';

@Component({
  selector: 'peb-business-info',
  templateUrl: './business-info.component.html',
  styleUrls: ['./business-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessInfoComponent extends AbstractComponent implements OnInit {
  @Select(BusinessState.businesses) businesses$: Observable<{ businesses: BusinessInterface[], total: number }>;

  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  form: FormGroup;
  businessId: string;
  currentBusiness: BusinessInterface;
  filename: string;

  loading = false;

  readonly uniqueId: string = `settings-edit-business-logo-${getUniqueId()}`;
  private readonly nameMaxLength: number = 40;
  private currentPageLink: string;

  set homeUrl(businessId: string) {
    this.currentPageLink = `business/${businessId}/settings/${SettingsRoutesEnum.Info}`;
  }

  get homeUrl(): string {
    return this.currentPageLink;
  }

  constructor(private activatedRoute: ActivatedRoute,
              private apiService: ApiService,
              private router: Router,
              private abbreviationPipe: AbbreviationPipe,
              private platformService: PlatformService,
              private translateService: TranslateService,
              private formBuilder: FormBuilder,
              private cdr: ChangeDetectorRef,
              private envService: BusinessEnvService,
              private authService: PeAuthService,
              private imageUpload: ImagesUploaderService,
              private mediaService: MediaService,
              private store: Store,
              private messageBus: MessageBus,
              private dialog: MatDialog) {
    super();
  }

  ngOnInit() {
    this.businessId = this.activatedRoute.parent.snapshot.params[settingsBusinessIdRouteParam];
    this.homeUrl = this.businessId;

    this.form = this.formBuilder.group({
      logo: null,
      name: [null, [Validators.maxLength(this.nameMaxLength)]],
    });

    this.activatedRoute.parent.params
      .pipe(takeUntil(this.destroyed$))
      .subscribe((params) => {
        this.businessId = params[settingsBusinessIdRouteParam] || params['slug'];
        this.homeUrl = this.businessId;
      });

    this.currentBusiness = this.envService.businessData;
    this.notifyAboutChanges(this.currentBusiness);

    this.form.valueChanges.pipe(
      debounceTime(1000),
      tap(() => {this.loading = true; this.cdr.detectChanges(); }),
      switchMap(value => this.apiService.updateBusinessData(this.currentBusiness._id, value)),
      catchError(() => of(this.currentBusiness)),
      tap(() => {this.loading = false; this.cdr.detectChanges(); }),
      takeUntil(this.destroyed$),
    ).subscribe((updatedBusiness) => {
      this.currentBusiness = updatedBusiness;
      const activeBusiness = this.authService.refreshLoginData.activeBusiness;
      if (activeBusiness?.name) {
        activeBusiness.name = updatedBusiness.name;
        activeBusiness.placeholderTitle = updatedBusiness.name;
        activeBusiness.logo = [updatedBusiness.logo];
        this.authService.refreshLoginData = {
          activeBusiness,
        };
      }
      this.notifyAboutChanges(updatedBusiness);
    });
  }

  goBack() {
    this.router.navigateByUrl(this.homeUrl);
  }

  onDeleteBusiness() {
    this.showConfirmationDialog();
  }

  uploadImage($event) {
    const [file] = $event.target.files;
    if (!file) {
      return;
    }

    this.imageUpload.uploadImages([file]).subscribe((res: any) => {
      if (res.type === 'data') {
        this.filename = res.data.lastUploadedImage.originalName;
        this.form.controls.logo.patchValue(res.data.uploadedImages[0].url);
        this.messageBus.emit('settings.change.logo', res.data.uploadedImages[0].url);
        this.cdr.detectChanges();
      }
    });
  }

  get previewImageUrl(): string {
    return this.mediaService.getMediaUrl(this.form.controls.logo.value, 'images');
  }

  private notifyAboutChanges(newBusiness: BusinessInterface) {
    const logo = newBusiness?.logo ?? null;
    const name = newBusiness?.name ?? '';
    const currentFormValue = { logo, name } as ProfileMenuEventInterface;

    this.form.patchValue(currentFormValue, { emitEvent: false, onlySelf: true });
    this.platformService.profileMenuChanged = currentFormValue;
    this.cdr.detectChanges();
  }

  private showConfirmationDialog() {
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      panelClass: ['settings-dialog', this.theme],
      data: {
        title: this.translateService.translate('dialogs.business_delete.title'),
        subtitle: this.translateService.translate('dialogs.business_delete.label'),
        cancelButtonTitle: this.translateService.translate('dialogs.business_delete.decline'),
        confirmButtonTitle: this.translateService.translate('dialogs.business_delete.confirm'),
        theme: this.theme,
      },
      hasBackdrop: true,
    });

    dialogRef.afterClosed()
      .pipe(
        take(1),
        switchMap((result) => {
          result
            ? this.router.navigateByUrl('/switcher')
            : this.router.navigate([], { relativeTo: this.activatedRoute });

          return this.businesses$.pipe(
            tap((res) => {
              if (res.total === 0) {
                localStorage.removeItem('pe_active_business');
              } if (res.total === 1 && res.businesses[0]) {
                localStorage.setItem('pe_active_business', JSON.stringify(res.businesses[0]));
              }
              if (result) {
                this.apiService.deleteBusiness(this.businessId).pipe(
                  tap((data) =>{
                    localStorage.removeItem('pe_active_business');
                    this.store.dispatch(new ResetBusinessState());
                    this.store.dispatch(new LoadBusinesses());
                    this.router.navigateByUrl('/switcher');
                  })
                ).subscribe();
              }
            }),
            takeUntil(this.destroyed$));
        })).subscribe();
  }
}
