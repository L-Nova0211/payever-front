import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors } from '@angular/forms';
import { BehaviorSubject, EMPTY, forkJoin, merge, Observable } from 'rxjs';
import { catchError, finalize, skip, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, PeDestroyService } from '@pe/common';
import { LocaleConstantsService, TranslateService } from '@pe/i18n';
import { MediaContainerType } from '@pe/media';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';
import { PePickerDataInterface } from '@pe/ui';

import { BusinessEmployeesGroupInterface, EmployeeStatusEnum, ListOptionInterface } from '../../../../misc/interfaces';
import {
  ApiService,
  BusinessEnvService,
  EnvironmentConfigService,
  FormTranslationsService,
} from '../../../../services';
import { employeePositionsOptions, employeeStatusOptions } from '../../constants';
import { AclsService } from '../../services/acls/acls.service';
import {
  EmployeeFields,
  PebEmployeeDialogFormService,
} from '../../services/employee-dialog-form/peb-employee-dialog-form.service';
import { PebEmployeeDialogService } from '../../services/employee-dialog/peb-employee-dialog.service';

@Component({
  selector: 'peb-new-employee-dialog',
  templateUrl: './new-employee-dialog.component.html',
  styleUrls: ['./new-employee-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AclsService, PebEmployeeDialogFormService, PebEmployeeDialogService, PeDestroyService],
})
export class NewEmployeeDialogComponent implements OnInit {
  theme = this.businessEnvService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.businessEnvService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  readonly defaultLogoUrl =
    `${this.configService.getCustomConfig().translation}/icons-settings/new-employee-logo.svg`;

  private readonly mediaType = MediaContainerType.Images;
  address = '';
  countries = [];
  showImageLoader = false;
  form: FormGroup;

  selectedStatus: ListOptionInterface<EmployeeStatusEnum>;
  selectedPosition: PePickerDataInterface;
  selectedCountry: PePickerDataInterface;
  groups: BusinessEmployeesGroupInterface[] = [];
  currentGroup = null;

  statuses: Array<ListOptionInterface<EmployeeStatusEnum>> = employeeStatusOptions.map(
    (({ value, labelKey }) => ({ value, label: this.translationService.translate(labelKey) })),
  );

  userPositions: PePickerDataInterface[] = employeePositionsOptions
    .map(({ value, labelKey }) => ({
      value,
      label: this.translationService.translate(labelKey),
    }));

  get isCreationMode(): boolean {
    return !this.overlayData.data.employee;
  }

  get employeeLogo(): string {
    const logo = this.form.controls.logo.value;
    const fullUrl = `${this.configService.getCustomConfig().storage}/${this.mediaType}/${logo}`;

    return logo ? fullUrl : this.defaultLogoUrl;
  }

  getFieldValidity(fieldName: EmployeeFields): boolean {
    const field = this.form.get(fieldName);

    return field.dirty && field.invalid;
  }

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    public aclsService: AclsService,
    private dialogRef: PeOverlayRef,
    private fb: FormBuilder,
    private errorsMessagesService: FormTranslationsService,
    private apiService: ApiService,
    private translationService: TranslateService,
    private dialogFormService: PebEmployeeDialogFormService,
    private dialogService: PebEmployeeDialogService,
    private businessEnvService: BusinessEnvService,
    private cdr: ChangeDetectorRef,
    private configService: EnvironmentConfigService,
    private localConstantsService: LocaleConstantsService,
    private destroyed$: PeDestroyService,
    private snackbarService: SnackbarService,
  ) {
  }

  getFieldErrorText(field: EmployeeFields): string {
    const fieldErrors: ValidationErrors = this.form.get(field).errors || {};
    const flattenErrors: ValidationErrors = {};
    const patternError = fieldErrors.pattern;

    Object.entries(fieldErrors || {})
      .filter(([, errorValue]) => typeof errorValue === 'boolean')
      .forEach(([errorName, errorValue]) => flattenErrors[errorName] = errorValue);

    if (patternError) {
      flattenErrors[patternError.requiredPattern] = true;
    }

    const allMessages = this.errorsMessagesService.getAllErrorMessages(flattenErrors);

    return allMessages[0] || '';
  }

  get aclsGroup(): any {
    return this.form.controls.acls;
  }

  ngOnInit(): void {
    this.getCountries();
    this.form = this.dialogFormService.initFormGroup(this.overlayData.data.employee);
    this.currentGroup = this.overlayData.data.groupId || null;
    this.setEmployeesInitialFields();

    merge(
      this.dialogService.getInstalledAppsAndAclsAndPositions$(
        this.businessEnvService.businessUuid,
        this.overlayData.data.employee?._id
      ).pipe(
        tap(([apps, acls, positions]) => {
          const existedStatusValue = this.overlayData.data.employee?.status
            ? Number(this.overlayData.data.employee.status)
            : EmployeeStatusEnum.invited;
          const existedPosition = this.overlayData.data.employee?.positions[
            this.overlayData.data.employee?.positions.length - 1
            ].positionType;

          if (existedStatusValue !== null && existedStatusValue !== undefined) {
            this.selectedStatus = {
              value: existedStatusValue,
              label: this.statuses.find(status => status?.value === existedStatusValue)?.label || '',
            };
          }

          this.selectedPosition = {
            value: existedPosition,
            label: this.userPositions.find(pos => pos?.value === existedPosition)?.label || '',
          };
          this.aclsService.init({
            apps,
            acls,
            appControls: this.aclsGroup,
            destroyed$: this.destroyed$,
          });

          this.cdr.markForCheck();
        }),
      ),
      this.overlaySaveSubject.pipe(
        skip(1),
        tap(() => {
          this.createEmployee();
        }),
      ),
    ).pipe(
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  onFileChange(file: File[]) {
    this.toggleImageLoader();

    this.dialogService.getImageBlobName$(this.overlayData.data.businessId, this.mediaType, file[0]).pipe(
      finalize(() => this.toggleImageLoader()),
      take(1),
      tap((blobName) => {
        this.form.controls.logo.setValue(blobName);
      }),
    ).subscribe();
  }

  logoPickerSelectChanged(status: EmployeeStatusEnum) {
    this.selectedStatus = this.statuses.find(statusOption => statusOption.value === status);
    this.form.controls.status.setValue(status);
  }

  createEmployee() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      Object.keys(this.form.controls).forEach((key) => {
        this.form.controls[key].markAsDirty();
      });
      this.cdr.detectChanges();

      return;
    }

    const value = this.form.getRawValue();
    value.acls = this.aclsService.getAcls();
    value.address = this.form.controls.address.value;

    value.status = value.status || EmployeeStatusEnum.inactive;
    // should be null, cos have another api for add employee into group
    value.groups = null;

    let BEmployee: Observable<Object> = EMPTY;

    if (this.isCreationMode) {
      BEmployee = this.apiService.createBusinessEmployee(this.overlayData.data.businessId, value).pipe(
        switchMap((createdEmployee) => {
          const updateEmployee = {
            status: value.status,
            email: value.email,
            position: value.position,
            groups: value.groups,
            acls: value.acls,
          };

          if (this.currentGroup) {

            return forkJoin([
              this.apiService.createBusinessEmployeeInGroup(
                this.businessEnvService.businessUuid,
                this.currentGroup,
                [createdEmployee._id]
              ),
              this.apiService.postUpdateBusinessEmployee(
                this.overlayData.data.businessId,
                createdEmployee._id,
                updateEmployee
              ),
            ]).pipe(
              tap(([group, updatedEmployee]) => {
                this.dialogRef.close({ createdEmployee: { ...createdEmployee , ...updatedEmployee }, group });
              }),
            );
          } else {
            return this.apiService.postUpdateBusinessEmployee(
              this.overlayData.data.businessId,
              createdEmployee._id,
              updateEmployee,
            ).pipe(
              tap({
                next: updatedEmployee => this.dialogRef.close({
                  createdEmployee: { ...createdEmployee , ...updatedEmployee },
                }),
              }),
            );
          }
        })
      );
    } else {
      BEmployee = this.apiService.updateBusinessEmployee(
        this.overlayData.data.businessId,
        this.overlayData.data.employee._id,
        value
      ).pipe(
        tap((updatedEmployee) => {
          this.dialogRef.close({ updatedEmployee: { ...updatedEmployee, status: value.status } });
        }),
      );
    }

    BEmployee.pipe(
      takeUntil(this.destroyed$),
      catchError((error) => {
        this.snackbarService.toggle(true, {
          content: this.translationService.translate(error.error.translationKey),
        });

        return EMPTY;
      }),
    ).subscribe();
  }

  private toggleImageLoader() {
    this.showImageLoader = !this.showImageLoader;
    this.cdr.markForCheck();
  }

  private setEmployeesInitialFields() {
    if (this.isCreationMode) {
      return;
    }
    const { employee } = this.overlayData.data;

    const existedCountry = employee?.address?.country;

    const selectedCountry = this.countries.find(val => val.value?.toLowerCase() === existedCountry?.toLowerCase());
    this.selectedCountry = {
      value: selectedCountry?.value || '',
      label: selectedCountry?.label || '',
    };

    this.setAddressValue();
  }

  onAutocompleteSelected(places) {
    const addressForm = this.form.controls.address;

    const postCode = places.address_components.find(val => val.types.includes('postal_code'))?.long_name || '';
    const city = places.address_components.find(val => val.types.includes('locality'))?.long_name || '';
    const country = places.address_components.find(val => val.types.includes('country')) || '';
    const streetNumber = places.address_components.find(val => val.types.includes('street_number'))?.long_name || '';
    const streetName = places.address_components.find(val => val.types.includes('route'))?.long_name || '';
    addressForm.get('zipCode').setValue(postCode);
    addressForm.get('city').setValue(city);
    addressForm.get('country').setValue(country?.short_name);
    addressForm.get('street').setValue(`${streetName} ${streetNumber}`);
    this.selectedCountry = this.countries.find(val => val.value?.toLowerCase() === country?.short_name?.toLowerCase());
    this.address = places.formatted_address;
    this.cdr.detectChanges();
  }

  setAddressValue() {
    const addressForm = this.form.controls.address;
    this.selectedCountry = this.selectedCountry
      || this.countries.find(val => val.value?.toLowerCase() === addressForm.get('country').value?.toLowerCase());

    const street = addressForm.get('street').value || '';
    const zipCode = addressForm.get('zipCode').value || '';
    const city = addressForm.get('city').value || '';
    const country = this.selectedCountry?.label || '';

    this.address = `${street}, ${zipCode}, ${city}, ${country}`;
    this.cdr.detectChanges();
  }

  getCountries() {
    const countryList = this.localConstantsService.getCountryList();

    this.countries = [];

    Object.keys(countryList).forEach((countryKey) => {
      this.countries.push({
        value: countryKey,
        label: Array.isArray(countryList[countryKey]) ? countryList[countryKey][0] : countryList[countryKey],
      });
    });
  }
}
