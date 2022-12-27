import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Injector,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { countries, Country } from 'countries-list';
import forEach from 'lodash/forEach';
import { ClipboardService } from 'ngx-clipboard';
import { BehaviorSubject, concat, forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { PebEnvService } from '@pe/builder-core';
import { AppThemeEnum, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import {
  OverlayHeaderConfig,
  PeOverlayConfig,
  PeOverlayRef,
  PeOverlayWidgetService,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
} from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';
import { PeCutomFieldComponent } from '@pe/ui';


import { PeContactsContactTypesEnum } from '../../enums/contact-types.enum';
import {
  AddContact,
  AddContactField,
  AddressInterface,
  Contact,
  ContactStatusForm,
  ContactCustomField,
  ContactField,
  Field,
  FieldGroup,
  FieldType,
  StatusFieldAction,
  ContactStatusAction,
  ActionField,
  FieldDto,
} from '../../interfaces';
import {
  ContactsGQLService,
  ContactsListService,
  ContactsStoreService,
  FieldsGQLService,
  StatusGQLService,
  UploaderService,
  UploadResponseInterface,
} from '../../services';
import { getContactFields, parseJSON } from '../../utils/contacts';

import { ContactStatusComponent } from './status.component';

@Component({
  selector: 'pe-contacts-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class ContactComponent implements OnInit {

  @ViewChild('fileInput') fileInput: ElementRef;

  private readonly cancelBtn = this.translateService.translate('contacts-app.actions.status.form.cancel');
  private readonly saveBtn = this.translateService.translate('contacts-app.actions.status.form.save');

  public contact = false;
  public isLoading = false;
  public isLoadingImage = false;
  public theme: AppThemeEnum;
  public uploadProgress = 0;
  private statusFormDialog: PeOverlayRef;
  private onSavedSubject$ = new BehaviorSubject(null);

  public readonly contactTypes = PeContactsContactTypesEnum;
  public readonly countries: Country[] = Object.keys(countries).map(key => countries[key]);
  public typeOptions = Object
    .entries(PeContactsContactTypesEnum)
    .map(([name, value]) => ({
      value,
      name: name.toLowerCase(),
    }));

  public contactForm: FormGroup = this.formBuilder.group({
    businessId: [''],
    city: [],
    company: [''],
    country: [],
    customFields: [[]],
    email: [''],
    fieldGroups: [[]],
    firstName: [''],
    homepage: [],
    imageUrl: [],
    lastName: [''],
    mobilePhone: [''],
    state: [],
    status: [],
    street: [],
    type: [this.typeOptions[0].name],
    zip: [],
  });

  businessFields: Field[] = [];
  statusFields: StatusFieldAction[] = [];
  fieldGroups: FieldGroup[] = [];
  defaultFields: Field[] = [];
  customFieldsValue :FieldDto[] = [];

  public set customFields(newValue) {
    this.customFieldsValue = newValue;
    this.peOverlayData.customFields = newValue;
  }

  public get customFields() {
    return this.customFieldsValue;
  }

  private readonly getDefaultFields$ = this.fieldsGQLService
    .getDefaultField()
    .pipe(
      tap((fields: Field[]) => {
        this.defaultFields = fields.filter(a => !a.businessId);
        this.customFields = fields
        .filter(a => a.businessId)
        .map( field => ({ title: field.name , ...field }))
      }));

  private readonly getStatuses$ = this.statusGQLService.getAllContactsStatus(this.envService.businessId)
    .pipe(
      tap((statuses) => {
        this.statusFields = statuses.map(status => {
          return {
            id: status._id,
            name: (status.businessId ? status.name : this.translateService.translate(status.name)),
            ...(status.businessId
              && { action: {
                id: status._id,
                name: this.translateService.translate('contacts-app.actions.status.form.edit.action'),
                value: 'edit' } } ),
          };
        })
        this.cdr.detectChanges();
      }));

  constructor(
    private cdr: ChangeDetectorRef,
    private clipboardApi: ClipboardService,
    private formBuilder: FormBuilder,
    private overlay: Overlay,
    private injector:Injector,

    @Inject(PE_OVERLAY_DATA) private peOverlayData: any,
    @Inject(PE_OVERLAY_CONFIG) private peOverlayConfig: OverlayHeaderConfig,
    private peAuthService: PeAuthService,
    private contactsGQLService: ContactsGQLService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private contactsListService: ContactsListService,
    private contactsStoreService: ContactsStoreService,
    private fieldsGQLService: FieldsGQLService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    private uploaderService: UploaderService,
    private statusGQLService: StatusGQLService,
    private readonly destroy$: PeDestroyService,
    private envService: PebEnvService,
  ) {
    this.peOverlayConfig.doneBtnCallback = this.onSave;
    this.theme = this.peOverlayConfig.theme as AppThemeEnum;
  }

  ngOnInit(): void {

   (window as any).PayeverStatic.IconLoader.loadIcons(['social']);

    const contactId = this.peOverlayData?.item?.id;
    this.onSavedSubject$.pipe(
      tap((data) => {
        if (data?.edit) {
          this.updateStatus(data?.value);
        }
        if (data?.create) {
          this.appendStatus(data?.value);
        }
        if (data?.delete) {
          this.deleteStatus(data?.value);
        }
      }),
      takeUntil(this.destroy$),

    ).subscribe();



    this.contact = !!contactId;

    concat(
      this.getDefaultFields$,
      this.getStatuses$,
      contactId
        ? this.getContact(contactId)
        : this.getFields(),
    ).pipe(takeUntil(this.destroy$)).subscribe();

    if (this.peAuthService.isAdmin()) {
      this.typeOptions = this.typeOptions.filter(item => item.value === PeContactsContactTypesEnum.Company);
      this.contactForm.controls.type.patchValue(this.typeOptions[0].name);
    }
  }

  private initFields(businessFields) {
    this.businessFields = businessFields.filter(a => !a.businessId);

    this.customFields = businessFields
      .filter(a => a.businessId)
      .map(field => ({
        title: field.name,
        showDefault: field.showOn.includes(PeContactsContactTypesEnum.Default),
        ...field }))
  }

  private getFields(): Observable<any> {
    this.isLoading = true;

    return this.fieldsGQLService.getFields(this.peOverlayData?.item?.id).pipe(tap(businessFields => {
      this.initFields(businessFields);
      this.isLoading = false;
      this.cdr.detectChanges();
    }));
  }

  private updateStatus(value) {
    const index = this.statusFields.findIndex(status => status.id === value._id);
    this.statusFields[index].name = value.name
    this.cdr.markForCheck();
  }

  private appendStatus(value) {
    this.statusFields.push({
      name: value.name,
      id: value._id,
      ...(value.businessId && { action: { id: value._id, name: 'Edit', value: 'Edit' } } ),
    });
    this.cdr.markForCheck();
  }

  private deleteStatus(value) {
    const index = this.statusFields.findIndex(status => status.id === value._id);
    this.statusFields.splice(index, 1);
    this.cdr.markForCheck();
  }

  private getContact(contactId: string): Observable<any>{
    this.isLoading = true;

    return forkJoin([
      this.fieldsGQLService.getFields(contactId),
      this.contactsGQLService.getContactById(contactId),
    ]).pipe(
      tap(([businessFields, contact]: [Field[], any]) => {
        this.initFields(businessFields);

        let fields: { [key: string]: string };
        const fieldsDict = {};

        if (contact) {
          this.contactsStoreService.contactId = contact.id;
          fields = getContactFields(contact);
          fields.type = contact.type;
          fields.businessId = contact.businessId;
          fields.status = contact.status
          // Set customFields in forms from BE
          contact.fields.forEach((field: { fieldId: string | number; }) => {
            fieldsDict[field.fieldId] = field;
          });
          const additionalFields: ContactCustomField[] = this.getAdditionalFields(contact.fields);

          additionalFields.forEach((field: ContactCustomField) => {
            const group: FormGroup = this.patchValues(field);
            (this.contactForm.controls.customFields as FormArray).push(group);
          });
          this.setCustomFieldValues(contact.fields)
        }

        const data: Contact = this.contactsStoreService.getContactData();
        this.contactForm.patchValue({
          ...fields,
          ...data,
        });

        this.isLoading = false;
        this.cdr.detectChanges();
      }));
  }



  private onSave = (): void => {
    const controls = this.contactForm.controls;
    controls.type.setValidators([Validators.required]);
    controls.type.updateValueAndValidity();

    controls.firstName.setValidators([Validators.required]);
    controls.firstName.updateValueAndValidity();

    if (!this.peAuthService.isAdmin()) {
      controls.lastName.setValidators([Validators.required]);
      controls.lastName.updateValueAndValidity();
    }

    controls.mobilePhone.setValidators([Validators.pattern('^[0-9]*$')]);
    controls.mobilePhone.updateValueAndValidity();

    controls.email.setValidators([Validators.email]);
    controls.email.updateValueAndValidity();

    if (this.contactForm.valid) {
      this.isLoading = true;
      this.peOverlayConfig.doneBtnTitle = this.translateService.translate('contacts-app.actions.loading');
      this.peOverlayConfig.isLoading = true;

      this.contactForm.markAllAsTouched();
      this.contactForm.markAsDirty();

      const contactId = this.peOverlayData?.item?.id;
      const folderId = this.contactsListService.selectedFolder?._id;
      const contact: AddContact = {
        type: this.contactForm.controls.type.value,
        status: this.contactForm.controls.status.value,
        fields: this.getContactFields(),
      };

      const notify = contactId
        ? 'contacts-app.messages.contact_updated'
        : 'contacts-app.messages.contact_added';

      const request$ = contactId
        ? this.contactsGQLService.updateContact(contactId, contact)
        : this.contactsGQLService.addContact(contact, folderId);

      request$
        .pipe(
          tap((contactData) => {
            this.showSuccessSnackbar(this.translateService.translate(notify));
            const dataToSave = {
              contactId: this.peOverlayData?.item?.id,
              contact: contactData,
            }

            this.customFields.forEach(field => {
              if(!field.showDefault)
              {
                this.fieldsGQLService.updateCustomFieldId(field._id, this.envService.businessId, contactData._id).subscribe();
              }
            });
            this.peOverlayConfig.onSaveSubject$.next(dataToSave);
          }),
          catchError((error) => {
            this.isLoading = false;
            this.peOverlayConfig.doneBtnTitle = this.translateService.translate('contacts-app.actions.save');
            this.peOverlayConfig.isLoading = false;

            return of(true);
          }),
          takeUntil(this.destroy$))
        .subscribe();
    } else {
      this.cdr.detectChanges();
    }
  }

  public openForm(data: ContactStatusForm): void {
    const sendSubject$ = new Subject<any>();


    const closeStatusDialog = () => {
      this.statusFormDialog.close();
    }
    const config: PeOverlayConfig = {
      backdropClick: closeStatusDialog,
      hasBackdrop: true,
      headerConfig: {
        backBtnCallback: closeStatusDialog,
        backBtnTitle: this.cancelBtn,
        doneBtnCallback: () => sendSubject$.next(),
        doneBtnTitle: this.saveBtn,
        removeContentPadding: false,
        title: this.translateService.translate(`contacts-app.actions.status.form.${data.action}.title`),
        theme: this.theme,
      },
      data: {
        ...data,
        sendSubject$,
        onSavedSubject$: this.onSavedSubject$,
      },
      component: ContactStatusComponent,
    };
    this.statusFormDialog = this.peOverlayWidgetService.open(config);
  }

  public addStatus(): void {
    const itemData = { action: ContactStatusAction.Create };
    this.openForm(itemData)
  }

  public editStatus($event: ActionField): void {
    const item = this.statusFields.find(element => $event.id === element.id)
    const itemData = { action: ContactStatusAction.Edit, value: item };
    this.openForm(itemData)
  }

  public addMedia($event: any): void {
    const files: FileList = $event.target.files as FileList;

    if (files.length > 0) {
      this.isLoadingImage = true;
      this.contactForm.patchValue({ imageUrl: null });
      this.cdr.detectChanges();
      const file: File = files[0];
      const reader: FileReader = new FileReader();
      reader.readAsDataURL(file);
      this.fileInput.nativeElement.value = '';

      reader.onload = () => {
        this.uploaderService.uploadImageWithProgress('images', file, false)
          .pipe(
            tap((event: HttpEvent<UploadResponseInterface>) => {
              switch (event.type) {
                case HttpEventType.UploadProgress: {
                  this.uploadProgress = event.loaded;
                  this.cdr.detectChanges();
                  break;
                }
                case HttpEventType.Response: {
                  this.contactForm.patchValue({ imageUrl: event.body.blobName || reader.result as string });
                  this.isLoadingImage = false;
                  this.cdr.detectChanges();
                  break;
                }
                default:
                  break;
              }
            }),
            takeUntil(this.destroy$))
          .subscribe()
      };
    }
  }

  private getContactFields(): AddContactField[] {
    const fields = [];
    const controls = this.contactForm.controls;

    this.defaultFields.forEach((field: any) => {
      const control = controls[field.name];
      if (control?.value) {
        if (field.name === 'company') {
          if (controls.type.value === PeContactsContactTypesEnum.Company) {
            fields.push({ value: control.value, fieldId: field.id });
          }
        } else {
          fields.push({ value: control.value, fieldId: field._id });
        }
      }
    });

    this.customFields.forEach(customField =>{
      if(customField.value) {
        fields.push({
          value: customField.type === FieldType.Multiselect
            ? JSON.stringify(customField.value).replace(/"/g, '\\"')
              : customField.value,
          fieldId: customField._id })
      }
    })

    controls.customFields.value.forEach((customField: any) => {
      if (customField.fieldValue) {
        fields.push({
          value: customField.fieldType === FieldType.Multiselect ?
            JSON.stringify(customField.fieldValue).replace(/"/g, '\\"') : customField.fieldValue,
          fieldId: customField.id,
        });
      }
    });

    return fields;
  }

  private getCustomFieldFormGroup(businessField: Field): FormGroup {
    let showOnPerson = false, showOnCompany = false, showDefault = false;
    businessField.showOn?.forEach((value: PeContactsContactTypesEnum) => {
      switch (value) {
        case PeContactsContactTypesEnum.Company:
          showOnCompany = true;
          break;
        case PeContactsContactTypesEnum.Person:
          showOnPerson = true;
          break;
        case PeContactsContactTypesEnum.Default:
          showDefault = true;
      }
    });

    return this.formBuilder.group({
      showDefault,
      showOnPerson,
      showOnCompany,
      id: [businessField.id],
      fieldLabel: [businessField.name],
      fieldType: [businessField.type],
      fieldValue: [],
      defaultValues: [businessField.defaultValues ?? []],
      filterable: [businessField.filterable],
      editableByAdmin: [businessField.editableByAdmin],
    });
  }

  private patchValues(field: ContactCustomField): FormGroup {
    const group: FormGroup = this.formBuilder.group({});

    forEach(field, (value, key) => {
      group.addControl(key, new FormControl(value));
    });

    return group;
  }

  private getAdditionalFields(contactFields: ContactField[]): ContactCustomField[] {
    const contactCustomFields: ContactCustomField[] = [];

    contactFields?.forEach((contactField: ContactField) => {
      if (contactField.field && !this.defaultFields.find((defField: Field) => defField.id === contactField.field.id)) {
        let showOnPerson = false, showOnCompany = false;
        if (contactField?.field?.showOn) {
          contactField.field.showOn.forEach((value: PeContactsContactTypesEnum) => {
            if (value === PeContactsContactTypesEnum.Person) {
              showOnPerson = true;
            } else if (value === PeContactsContactTypesEnum.Company) {
              showOnCompany = true;
            }
          });
        }
        contactCustomFields.push({
          showOnCompany,
          showOnPerson,
          id: contactField.fieldId,
          fieldLabel: contactField.field.name,
          fieldType: contactField.field.type,
          fieldValue: contactField.field.type === FieldType.Multiselect ?
            parseJSON(contactField.value) : contactField.value,
          defaultValues: contactField.field.defaultValues,
          filterable: contactField.field.filterable,
          editableByAdmin: contactField.field.editableByAdmin,
        });
      }
    });

    return contactCustomFields;
  }

  private setCustomFieldValues(contactFields: ContactField[]){

    contactFields?.forEach((contactField: ContactField) => {
      if (contactField.field) {
      let customField = this.customFields.find((defField: FieldDto) => defField._id === contactField.field._id)
        if (customField != null) {
          customField.value = customField.type === FieldType.Multiselect ? parseJSON(contactField.value) : contactField.value;
        }
      }
    });
  }

  public addressOn(address: AddressInterface): void {
    this.contactForm.patchValue({
      street: address.street,
      city: address.city,
      zip: address.zip_code,
      country: countries[address.country]?.name,
    });
  }

  public visitHomepage(): void {
    let homepage = this.contactForm.controls.homepage.value;

    if(homepage){
      if (!/^http[s]?:\/\//.test(homepage)) {
        homepage = `http://${homepage}`;
      }

      window.open(homepage, '_blank');
    }
  }

  public copyEmail(): void {
    this.clipboardApi.copyFromContent(this.contactForm.controls.email.value)
    this.snackbarService.toggle(true, {
      content: 'Copied',
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24,
    });
  }

  openCustomFieldsDialog() {
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'pe-custom-fields-backdrop',

    });

    overlayRef.backdropClick().subscribe(() => overlayRef.dispose());

    return overlayRef;
  }

  public openCustomField(){
    const overlayRef = this.openCustomFieldsDialog();
    const contactId = this.peOverlayData?.item?.id;

    const customField = overlayRef.attach<PeCutomFieldComponent>(new ComponentPortal(PeCutomFieldComponent, null, this.createInjector()));
    customField.instance.onClose$.pipe(
      take(1),
      tap((data: FieldDto | null) => {
        if (data) {
          data.value = '';
          this.customFields.push(data);
          this.setValueDefault(data);
          this.fieldsGQLService.createCustomField({
            businessId:this.envService.businessId ,
            groupId:'random-test-id',
            defaultValues:data.defaultValues,
            editable:true,
            editableByAdmin:data.editableByAdmin,
            filterable:data.filterable ,
            name:data.title,
            type:data.type ,
            showOn: data.showOn,
          }, contactId).pipe(
            take(1),
            tap((res) => {
              data._id = res._id;
            }),
          ).subscribe();

          this.cdr.detectChanges();
        }
        overlayRef.dispose();
      })
    ).subscribe();
  }

  private createInjector(): Injector {
    return Injector.create({
      parent: this.injector,
      providers: [{
        provide: PE_OVERLAY_DATA,
        useValue: this.peOverlayData,
      }],
    });
  }

  removeField(index): void {
    let customField :any = this.customFields[index];
    this.fieldsGQLService.deleteField(customField.businessId, customField._id).subscribe();
    this.customFields.splice(index, 1);
    this.cdr.detectChanges();
  }

  setValueDefault(data): void {
    if(data.showDefault) {
      if(!data.showOn.includes(PeContactsContactTypesEnum.Default)) {
          data.showOn.push(PeContactsContactTypesEnum.Default);
        }
      } else {
      const index = data.showOn.indexOf(PeContactsContactTypesEnum.Default);
      if(index >= 0) {
        data.showOn.splice(index, 1);
      }
    }
  }

  editField(index): void {
    const overlayRef = this.openCustomFieldsDialog();
    const contactId = this.peOverlayData?.item?.id;

    const customField = overlayRef.attach<PeCutomFieldComponent>(new ComponentPortal(PeCutomFieldComponent, null, this.createInjector()));
    customField.instance.field = this.customFields[index];
    customField.instance.onClose$.pipe(
      take(1),
      switchMap((data: FieldDto | null) => {
        if (data) {
          this.setValueDefault(data);

          this.customFields[index] = data;

          const fieldToSave = { ...data,
            businessId: this.envService.businessId,
            groupId: 'random-test-id',
            editable: true,
            name: data.title,
            _id: data._id,
          }

          return this.fieldsGQLService.updateCustomField(fieldToSave, contactId);
        } else {
          return of(null);
        }
      })
    ).subscribe(() => {
      overlayRef.dispose();

      this.cdr.markForCheck();
    });


    this.cdr.detectChanges();
  }

  private showSuccessSnackbar(message) {
    this.snackbarService.toggle(
      true,
      {
        content: message,
        duration: 5000,
        iconId: 'icon-commerceos-success',
        iconSize: 24,
      });
  }
}
