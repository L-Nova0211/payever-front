import { HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import { PeDestroyService } from '@pe/common';
import { Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import { PeMediaFileTypeEnum, PeMediaService } from '@pe/media';
import { PE_OVERLAY_CONFIG, OverlayHeaderConfig, PeOverlayWidgetService, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeCustomValidators } from '@pe/shared/custom-validators';
import { SnackbarService } from '@pe/snackbar';

import { PE_AFFILIATES_FIRST_PROGRAM } from '../../constants';
import { PeAffiliatesNetworkAccessInterface } from '../../interfaces';
import {
  PeAffiliatesAccessApiService,
  PeAffiliatesApiService,
  PeAffiliatesGridService,
} from '../../services';

@Component({
  selector: 'pe-affiliates-network-editor',
  templateUrl: './network-editor.component.html',
  styleUrls: ['../form-preloader.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeAffiliatesNetworkEditorComponent implements OnInit {
  private readonly cancelBtn = this.translateService.translate('affiliates-app.actions.cancel');
  private readonly closeBtn = this.translateService.translate('affiliates-app.actions.close');
  private readonly createBtn = this.translateService.translate('affiliates-app.actions.create');
  private readonly deleteBtn = this.translateService.translate('affiliates-app.actions.delete');
  private readonly loadingBtn = this.translateService.translate('affiliates-app.actions.loading');
  private readonly openBtn = this.translateService.translate('affiliates-app.actions.open');
  private readonly saveBtn = this.translateService.translate('affiliates-app.actions.save');

  public readonly theme = this.peOverlayConfig.theme;
  
  public changed = false;
  public isUnique = true;
  public imageLoading = false;
  public loading = false;
  public networkForm: FormGroup = this.formBuilder.group({
    _id: [null],
    favicon: [''],
    logo: [''],
    name: [],
  });

  constructor(
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,

    private pebEnvService: PebEnvService,
    private peMediaService: PeMediaService,
    @Inject(PE_OVERLAY_CONFIG) private peOverlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,
    
    private peAffiliatesApiService: PeAffiliatesApiService,
    private peAffiliatesAccessApiService: PeAffiliatesAccessApiService,
    private peAffiliatesGridService: PeAffiliatesGridService,
  ) {
    const { _id, title } = this.peOverlayData;
    const formConfig = this.peOverlayConfig;
    formConfig.backBtnCallback = this.closeEditor;
    formConfig.backBtnTitle = this.cancelBtn;
    formConfig.doneBtnCallback = () => {
      !this.loading && this.save();
    };
    formConfig.doneBtnTitle = _id ? this.openBtn : this.createBtn;
    formConfig.title = _id ? title : this.translateService.translate(title);
    this.peAffiliatesGridService.backdropClick = this.closeEditor;
  }

  ngOnInit(): void {
    if (this.peOverlayData._id) {
      const { _id, logo, name } = this.networkForm.controls;
      _id.patchValue(this.peOverlayData._id);
      logo.patchValue(this.peOverlayData.icon);
      name.patchValue(this.peOverlayData.title);
      this.networkForm.markAsPristine();
    }

    this.peOverlayData._id && this.networkForm
      .valueChanges
      .pipe(
        filter(() => this.networkForm.dirty),
        tap(() => {
          this.peOverlayConfig.doneBtnTitle = this.saveBtn;
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }
  
  private get errorMessage(): string {
    const { errors } = this.networkForm.controls.name;
    if (errors?.required) {
      return 'affiliates-app.network_editor.network_name.error.required';
    } else if (errors?.incorrectDomainName) {
      return 'affiliates-app.network_editor.network_name.error.incorrect';
    } else if (errors?.minLengthDomainName) {
      return 'affiliates-app.network_editor.network_name.error.min_name_length';
    } else if (!this.isUnique) {
      return 'affiliates-app.network_editor.network_name.error.not_unique';
    } else {
      return 'affiliates-app.network_editor.network_name.error.incorrect';
    }
  }

  public get getErrorMessage(): string {
    const { name } = this.networkForm.controls;
    const message = this.translateService.translate(this.errorMessage);
    
    return message.replace('{networkName}', name.value);
  }

  private closeEditor = () => {
    if (this.networkForm.dirty && !this.loading) {
      this.peAffiliatesGridService.confirmation$
        .pipe(
          take(1),
          filter(Boolean),
          tap(() => {
            this.peOverlayWidgetService.close();
          }),
          takeUntil(this.destroy$))
        .subscribe();

      const isEditing = !!this.peOverlayData?._id;
      const headingTitle = isEditing
        ? 'affiliates-app.confirm_dialog.cancel.network_editor.editing.title'
        : 'affiliates-app.confirm_dialog.cancel.network_editor.creating.title';
      const headingSubtitle = isEditing
        ? 'affiliates-app.confirm_dialog.cancel.network_editor.editing.subtitle'
        : 'affiliates-app.confirm_dialog.cancel.network_editor.creating.subtitle';
      const config: Headings = {
        title: this.translateService.translate(headingTitle),
        subtitle: this.translateService.translate(headingSubtitle),
        confirmBtnText: this.closeBtn,
        declineBtnText: this.cancelBtn,
      };
      this.peAffiliatesGridService.openConfirmDialog(config);
    } else if (!this.loading) {
      this.peOverlayWidgetService.close();
    }
  }

  public removeImage(): void {
    const { logo } = this.networkForm.controls;
    if (logo.value !== '') {
      logo.patchValue('');
      logo.markAsDirty();
    }
  }

  public removeNetwork(networkId: string): void {
    this.peAffiliatesGridService.confirmation$
      .pipe(
        take(1),
        filter(Boolean),
        switchMap(() => {
          this.loading = true;
          this.cdr.detectChanges();

          return this.peAffiliatesApiService
            .deleteNetwork(networkId);
        }),
        tap(() => {
          this.loading = false;
          this.cdr.detectChanges();
          const notify = this.translateService
            .translate('affiliates-app.notify.network_deleted')
            .replace('{networkName}', this.peOverlayData.title);
          this.showSnackbar(notify);
          this.peOverlayConfig.onSaveSubject$.next({ networkRemoved: true });
        }),
        takeUntil(this.destroy$))
      .subscribe();

    const headingTitle = 'affiliates-app.confirm_dialog.delete.network.title';
    const headingSubtitle = 'affiliates-app.confirm_dialog.delete.network.subtitle';
    const config: Headings = {
      title: this.translateService.translate(headingTitle),
      subtitle: this.translateService.translate(headingSubtitle),
      confirmBtnText: this.deleteBtn,
      declineBtnText: this.cancelBtn,
    };
    this.peAffiliatesGridService.openConfirmDialog(config);
  }

  public setImage(fileList: FileList, control?: AbstractControl): void {
    const file = fileList[0];
    const uploadFinished$ = new Subject();
    const destroy = () => {
      uploadFinished$.next();
      uploadFinished$.complete();
    }

    this.peMediaService
      .postMediaBlob(file, PeMediaFileTypeEnum.Image, this.pebEnvService.businessId)
      .pipe(
        tap(event => {
          switch (event.type) {
            case HttpEventType.Response:
              const resp = event.body as any;
              const url = this.peMediaService.getMediaUrl(resp.blobName);
              control.patchValue(url);
              control.markAsDirty();
              this.imageLoading = false;
              this.cdr.detectChanges();
              destroy();
              break;
            case HttpEventType.ResponseHeader:
              event.status < 200 && event.status > 299 && destroy();
              break;
            case HttpEventType.UploadProgress:
              this.imageLoading = true;
              this.cdr.detectChanges();
              break;
          }
        }),
        takeUntil(uploadFinished$))
      .subscribe();
  }

  private save(): void {
    const { _id, favicon, logo, name } = this.networkForm.controls;
    name.setValidators([Validators.required]);
    name.updateValueAndValidity();
    const { dirty, invalid, valid } = this.networkForm;
    
    if (dirty && valid && this.isUnique) {
      favicon.patchValue(logo.value);
      of(_id.value)
        .pipe(
          switchMap(networkId => {
            const network = this.networkForm.value;
            delete network._id;
            this.loading = true;
            this.peOverlayConfig.isLoading = true;
            this.peOverlayConfig.doneBtnTitle = this.loadingBtn;
            this.cdr.detectChanges();

            return networkId
              ? this.peAffiliatesApiService.updateNetwork(networkId, network)
              : this.peAffiliatesApiService.createNetwork(network);
          }),
          switchMap(network => {
            const isNewNetwork = network.createdAt === network.updatedAt;
            this.pebEnvService.applicationId = network._id;
            this.pebEnvService.shopId = network._id;
            PE_AFFILIATES_FIRST_PROGRAM.affiliateBranding = network._id;
            const createFirstProgram$ = isNewNetwork
              ? this.peAffiliatesApiService.createProgram(PE_AFFILIATES_FIRST_PROGRAM)
              : of(null);
            const setNetworkAsDefault$ = !network.isDefault
              ? this.peAffiliatesApiService.setNetworkAsDefault(network._id)
              : of({ _id: network._id });

            return forkJoin([
              setNetworkAsDefault$,
              createFirstProgram$,
            ]);
          }),
          switchMap(([{ _id }, program]) => this.peAffiliatesAccessApiService.getAccessConfig(_id)),
          switchMap((accessConfig: PeAffiliatesNetworkAccessInterface) => {
            const { affiliateBranding, _id, createdAt, updatedAt } = accessConfig;
            const condition = createdAt === updatedAt
              ? 'affiliates-app.notify.network_created'
              : 'affiliates-app.notify.network_updated';
            const notify = this.translateService
              .translate(condition)
              .replace('{networkName}', name.value);
            this.showSnackbar(notify);

            return this.peAffiliatesAccessApiService
              .updateAccessConfig(affiliateBranding, _id, { internalDomain: name.value });
          }),
          tap(() => {
            this.peOverlayConfig.onSaveSubject$.next({ network: true });
          }),
          catchError(error => {
            this.loading = false;
            this.peOverlayConfig.isLoading = false;
            this.peOverlayConfig.doneBtnTitle = this.saveBtn;
            this.cdr.detectChanges();

            return of(error);
          }),
          takeUntil(this.destroy$))
        .subscribe();
    } else if (dirty || invalid || !this.isUnique) {
      this.cdr.detectChanges();
    } else if (this.pebEnvService.applicationId !== _id.value) {
      this.loading = true;
      this.cdr.detectChanges();
      this.peAffiliatesApiService
        .setNetworkAsDefault(_id.value)
        .pipe(
          tap(network => {
            this.pebEnvService.applicationId = network._id;
            this.pebEnvService.shopId = network._id;
            this.peOverlayConfig.onSaveSubject$.next({ network: true });
          }),
          takeUntil(this.destroy$))
        .subscribe();
    } else {
      this.peOverlayConfig.onSaveSubject$.next({ network: true });
    }
  }

  public validateName(event): void {
    const enteredName = event.target.value;
    const { name } = this.networkForm.controls;
    if (!this.changed) {
      this.changed = true;
      name.setValidators([PeCustomValidators.DomainName()]);
      name.updateValueAndValidity();
    }
    const { errors } = name;
    const invalid = errors?.incorrectDomainName || errors?.minLengthDomainName;
    !invalid && enteredName.length > 2 && this.peAffiliatesApiService
      .validateNetworkName(enteredName)
      .pipe(
        tap(({ result }) => {
          this.isUnique = result || enteredName === this.peOverlayData.title;
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  private showSnackbar(notify: string): void {
    this.snackbarService.toggle(true, {
      content: notify,
      duration: 5000,
      iconColor: '#00B640',
      iconId: 'icon-commerceos-success',
      iconSize: 24,
    });
  }
}
