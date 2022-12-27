import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, pluck, take } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import { PeFilterConditions, PeFilterType, PeGridSortingDirectionEnum } from '@pe/grid';

import { PeAppointmentsRequestsErrorsEnum } from '../enums';
import {
  CreateAppointmentGQL,
  CreateFieldGQL,
  DeleteAppointmentGQL,
  DeleteFieldGQL,
  GetAppointmentGQL,
  GetAppointmentsGQL,
  GetFieldsGQL,
  UpdateAppointmentGQL,
  UpdateFieldGQL,
} from '../graph-ql';
import { FieldDto, PeAppointmentsAppointmentInterface } from '../interfaces';
import { PE_CONTACTS_API_PATH, PE_PRODUCTS_API_PATH } from '../tokens';

import { PeErrorsHandlerService } from './errors-handler.service';

@Injectable()
export class PeAppointmentsCalendarApiService {
  constructor(
    private httpClient: HttpClient,

    private pebEnvService: PebEnvService,
    // Appointments
    private createAppointmentGQL: CreateAppointmentGQL,
    private deleteAppointmentGQL: DeleteAppointmentGQL,
    private getAppointmentGQL: GetAppointmentGQL,
    private getAppointmentsGQL: GetAppointmentsGQL,
    private updateAppointmentGQL: UpdateAppointmentGQL,
    // Fields
    private createFieldGQL: CreateFieldGQL,
    private deleteFieldGQL: DeleteFieldGQL,
    private getFieldsGQL: GetFieldsGQL,
    private updateFieldGQL: UpdateFieldGQL,

    @Inject(PE_CONTACTS_API_PATH) private peContactsApiPath: string,
    @Inject(PE_PRODUCTS_API_PATH) private peProductsApiPath: string,
    private peErrorsHandlerService: PeErrorsHandlerService,
  ) { }

  private get businessId(): string {
    return this.pebEnvService.businessId;
  }

  private get contactsPath(): string {
    return `${this.peContactsApiPath}/api/folders/business/${this.businessId}`;
  }

  private get productsPath(): string {
    return `${this.peProductsApiPath}/folders/business/${this.businessId}`;
  }

  public getAppointments(): Observable<PeAppointmentsAppointmentInterface[]> {
    return this.getAppointmentsGQL
      .watch({
        businessId: this.businessId,
      })
      .valueChanges
      .pipe(
        take(1),
        map((response: any) => response.data?.appointments ?? []),
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.GetAllAppointments, error);

          return throwError(error);
        }));
  }

  public getAppointment(appointmentId: string): Observable<PeAppointmentsAppointmentInterface> {
    return this.getAppointmentGQL
      .watch({
        businessId: this.businessId,
        id: appointmentId,
      })
      .valueChanges
      .pipe(
        take(1),
        map((response: any) => response.data?.appointment),
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.GetAppointment, error);

          return throwError(error);
        }));
  }

  public createAppointment(appointment: PeAppointmentsAppointmentInterface): Observable<any> {
    return this.createAppointmentGQL
      .mutate({
        businessId: this.businessId,
        data: appointment,
      })
      .pipe(
        pluck('data', 'createAppointment'),
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.CreateAppointment, error);

          return throwError(error);
        }));
  }

  public updateAppointment(appointmentId: string, appointment: PeAppointmentsAppointmentInterface): Observable<any> {
    return this.updateAppointmentGQL
      .mutate({
        id: appointmentId,
        businessId: this.businessId,
        data: appointment,
      })
      .pipe(
        pluck('data', 'updateAppointment'),
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.UpdateAppointment, error);

          return throwError(error);
        }));
  }

  public deleteAppointment(appointmentId: string): Observable<any> {
    return this.deleteAppointmentGQL
      .mutate({
        businessId: this.businessId,
        id: appointmentId,
      })
      .pipe(
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.DeleteAppointment, error);

          return throwError(error);
        }));
  }

  // Fields
  public getFields(appointmentId: string): Observable<FieldDto[]> {
    return this.getFieldsGQL
      .watch({
        appointmentId,
        businessId: this.businessId,
      })
      .valueChanges
      .pipe(
        take(1),
        map((response: any) => response?.data?.fields ?? { data: { fields: [] } }),
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.GetFields, error);

          return throwError(error);
        }));
  }

  public getDefaultFields(appointmentId: string): Observable<FieldDto[]> {
    return this.getFields(appointmentId)
      .pipe(
        map(fields => fields.filter(field => field.editableByAdmin)));
  }

  public getCustomFields(appointmentId: string): Observable<FieldDto[]> {
    return this.getFields(appointmentId)
      .pipe(
        map(fields => fields.filter(field => !field.editableByAdmin)));
  }

  public createField(field: FieldDto, appointmentId: string): Observable<any> {
    if (field.showDefault) {
      appointmentId = null;
    }
    
    return this.createFieldGQL
      .createField(field)
      .mutate({
        appointmentId,
        businessId: this.businessId,
      })
      .pipe(
        pluck('data'),
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.CreateField, error);

          return throwError(error);
        }));
  }

  public updateField(fieldId: string, field: FieldDto, appointmentId: string): Observable<any> {
    if (field.showDefault) {
      appointmentId = null;
    }

    return this.updateFieldGQL
      .mutate({
        appointmentId,
        businessId: this.businessId,
        data: field,
        id: fieldId,
      })
      .pipe(
        pluck('data', 'updateField'),
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.UpdateField, error);

          return throwError(error);
        }));
  }

  public updateFieldId(fieldId: string, appointmentId: string): Observable<any> {
    return this.updateFieldGQL
      .updateFieldId(appointmentId)
      .mutate({
        businessId: this.businessId,
        id: fieldId,
      })
      .pipe(
        pluck('data', 'updateField'),
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.UpdateFieldId, error);

          return throwError(error);
        }));
  }

  public deleteField(fieldId: string): Observable<any> {
    return this.deleteFieldGQL
      .mutate({
        businessId: this.businessId,
        id: fieldId,
      })
      .pipe(
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.DeleteField, error);

          return throwError(error);
        }));
  }

  // contacts
  public getContacts(filter?: string | string[]): Observable<any> {
    return this.httpClient
      .post(`${this.contactsPath}/search`, this.filterConfiguration(filter))
      .pipe(
        pluck('collection'),
        map((contacts: any) => contacts
          .map(contact => ({
            id: contact.serviceEntityId,
            image: contact?.imageUrl ?? 'assets/icons/customer.svg',
            label: contact.title,
            name: contact.title,
            title: contact.title,
          }))
        ),
        catchError((error) => {
          this.peErrorsHandlerService.errorHandler(PeAppointmentsRequestsErrorsEnum.GetContacts, error, true);

          return [];
        }));
  }

  // products
  public getProducts(filter?: string | string[]): Observable<any> {
    return this.httpClient
      .post(`${this.productsPath}/search`, this.filterConfiguration(filter))
      .pipe(
        pluck('collection'),
        map((products: any) => products
          .map(product => ({
            id: product.serviceEntityId,
            image: product?.imagesUrl[0] ?? 'assets/icons/folder-grid.png',
            label: product.title,
            name: product.title,
            title: product.title,
          }))
        ),
        catchError((error) => {
          this.peErrorsHandlerService.errorHandler(PeAppointmentsRequestsErrorsEnum.GetProducts, error, true);

          return [];
        }));
  }

  private filterConfiguration(filter: string | string[]): any {
    const isSearchByTitle = typeof filter === 'string';
    const filters = isSearchByTitle
      ? {
          title: {
            condition: PeFilterConditions.Contains,
            value: '*' + (filter as string).toLowerCase() + '*',
          },
        }
      : {
          serviceEntityId: {
            condition: PeFilterConditions.IsIn,
            value: filter,
          },
        };

    return {
      all: 0,
      currency: PeFilterType.String,
      direction: PeGridSortingDirectionEnum.Descending,
      filters,
      limit: isSearchByTitle ? 20 : filter.length,
      page: 1,
      sort: [PeGridSortingDirectionEnum.Descending],
    };
  }
}
