import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, EMPTY, merge } from 'rxjs';
import { catchError, skip, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';

import { EmployeeStatusEnum, ListOptionInterface } from '../../../../misc/interfaces';
import { ApiService, BusinessEnvService, FormTranslationsService } from '../../../../services';
import { employeeStatusOptions } from '../../constants';
import { AclsService } from '../../services/acls/acls.service';
import {
  PebBusinessEmployeesStorageService,
} from '../../services/business-employees-storage/business-employees-storage.service';
import { PebEmployeeDialogFormService } from '../../services/employee-dialog-form/peb-employee-dialog-form.service';
import { PebEmployeeDialogService } from '../../services/employee-dialog/peb-employee-dialog.service';

@Component({
  selector: 'peb-new-employee-group',
  templateUrl: './new-employee-group.component.html',
  styleUrls: ['./new-employee-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AclsService, PebEmployeeDialogFormService, PebEmployeeDialogService, PeDestroyService],
})
export class NewEmployeeGroupComponent implements OnInit {
  theme = this.businessEnvService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.businessEnvService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  showImageLoader = false;
  form: FormGroup;

  group = null;

  statuses: Array<ListOptionInterface<EmployeeStatusEnum>> = employeeStatusOptions.map(
    ({ labelKey, value }) => ({ value, label: this.translationService.translate(labelKey) }),
  );

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    public aclsService: AclsService,
    protected employeesStorage: PebBusinessEmployeesStorageService,
    private dialogRef: PeOverlayRef,
    private fb: FormBuilder,
    private errorsMessagesService: FormTranslationsService,
    private apiService: ApiService,
    private translationService: TranslateService,
    private dialogFormService: PebEmployeeDialogFormService,
    private dialogService: PebEmployeeDialogService,
    private businessEnvService: BusinessEnvService,
    private snackbarService: SnackbarService,
    private cdr: ChangeDetectorRef,
    private destroyed$: PeDestroyService,
  ) {
  }

  get aclsGroup(): any {
    return this.form.controls.acls;
  }

  ngOnInit(): void {
    this.form = this.initFormGroup();

    merge(
      this.dialogService.getInstalledAppsAndAclsGroups$(
        this.businessEnvService.businessUuid,
        this.overlayData.data?.groupId
      ).pipe(
        tap(([apps, acls]) => {
          this.aclsService.init({
            apps,
            acls,
            appControls: this.aclsGroup,
            destroyed$: this.destroyed$,
          });

          this.cdr.detectChanges();
        }),
      ),
      this.overlaySaveSubject.pipe(
        skip(1),
        tap((dialogRef) => {
          this.createEmployeeGroup();
        }),
      ),
    ).pipe(
      takeUntil(this.destroyed$),
    ).subscribe();

    if (this.overlayData.data.groupId) {
      this.form.controls.name.setValue(this.overlayData.data.group.name);
      this.form.controls.name.disable();
    }
  }

  getMessage(name): string {
    return this.translationService.translate('pages.employees.sidebar.groups.duplicate_message_1')
    + name
    + this.translationService.translate('pages.employees.sidebar.groups.duplicate_message_2');
  }

  createEmployeeGroup() {
    this.form.controls.name.setValidators([Validators.required, Validators.pattern(/\S+/)]);
    this.form.controls.name.updateValueAndValidity();

    if (!this.form.valid) {
      this.cdr.detectChanges();

      return;
    }

    const value = this.form.value;
    value.acls = this.aclsService.getAcls();
    const exisitngGroup = this.employeesStorage.groups.data.find(
      group => group.name === value.name &&
      group._id !== this.overlayData.data.group._id
    );
    if (exisitngGroup) {
      this.snackbarService.toggle(true, {
        content: this.getMessage(exisitngGroup.name),
        duration: 2500,
        iconId: 'icon-alert-24',
        iconSize: 24,
      });

      return;
    }

    let employeeGroup: any = this.apiService.createBusinessEmployeeGroup(this.overlayData.data.businessId, value).pipe(
      tap((createdEmployeeGroup) => {
        this.dialogRef.close(createdEmployeeGroup);
      }),
    );

    if (this.overlayData.data?.groupId) {
      employeeGroup = this.apiService.updateBusinessEmployeeGroup(
        this.overlayData.data.businessId,
        value,
        this.overlayData.data.groupId,
      ).pipe(
        tap((updatedEmployeeGroup) => {
          this.dialogRef.close(updatedEmployeeGroup);
        }),
      );
    }

    employeeGroup.pipe(
      takeUntil(this.destroyed$),
      catchError((error) => {
        this.cdr.detectChanges();

        return EMPTY;
      }),
    ).subscribe();
  }

  private toggleImageLoader() {
    this.showImageLoader = !this.showImageLoader;
    this.cdr.markForCheck();
  }

  initFormGroup(): FormGroup {
    let form: FormGroup;
    const formObj = {
      name: [null],
      acls: [null],
    };

    form = this.fb.group(formObj);

    form.controls.acls = this.fb.group({});

    return form;
  }
}
