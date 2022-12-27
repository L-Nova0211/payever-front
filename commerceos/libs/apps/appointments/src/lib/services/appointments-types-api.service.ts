import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, pluck, take } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import { PeGridSearchDataInterface } from '@pe/grid';

import { PeAppointmentsRequestsErrorsEnum } from '../enums';
import { PeAppointmentsTypeInterface } from '../interfaces';

import { PeErrorsHandlerService } from './errors-handler.service';
import {
  CreateAppointmentTypeGQL,
  DeleteAppointmentTypeGQL,
  GetAppointmentTypeGQL,
  GetAppointmentTypesGQL,
  UpdateAppointmentTypeGQL,
} from '../graph-ql';

@Injectable()
export class PeAppointmentsTypesApiService {
  constructor(
    private pebEnvService: PebEnvService,
    // Types GQL
    private createAppointmentTypeGQL: CreateAppointmentTypeGQL,
    private deleteAppointmentTypeGQL: DeleteAppointmentTypeGQL,
    private getAppointmentTypeGQL: GetAppointmentTypeGQL,
    private getAppointmentTypesGQL: GetAppointmentTypesGQL,
    private updateAppointmentTypeGQL: UpdateAppointmentTypeGQL,
    private peErrorsHandlerService: PeErrorsHandlerService,
  ) { }

  private get businessId(): string {
    return this.pebEnvService.businessId;
  }

  // Appointment types
  public getAppointmentType(typeId: string): Observable<PeAppointmentsTypeInterface> {
    return this.getAppointmentTypeGQL
      .watch({
        businessId: this.businessId,
        id: typeId,
      })
      .valueChanges
      .pipe(
        take(1),
        map((response: any) => response.data?.appointmentType),
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.GetAppointmentType, error);

          return throwError(error);
        }));
  }

  public getAppointmentTypes(
    searchData: PeGridSearchDataInterface,
  ): Observable<{
    collection: PeAppointmentsTypeInterface[],
    pagination_data: {
      page: number,
      total: number,
    },
  }> {
    const { configuration, perPage: limit, ...listQuery } = searchData;
    const filters = configuration ? JSON.stringify(configuration) : null;
    const pagination_data = { page: 1, total: 0 };
    const defaultData = {
      collection: [],
      pagination_data,
    };

    return this.getAppointmentTypesGQL
      .watch({
        businessId: this.businessId,
        listQuery: { filters, limit, ...listQuery },
      })
      .valueChanges
      .pipe(
        take(1),
        map((response: any) => response.data?.appointmentTypes ?? defaultData),
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.GetAppointmentTypes, error);

          return of(defaultData);
        }));
  }

  public createAppointmentType(type: PeAppointmentsTypeInterface): Observable<any> {
    return this.createAppointmentTypeGQL
      .mutate({
        businessId: this.businessId,
        data: type,
      })
      .pipe(
        pluck('data', 'createAppointmentType'),
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.CreateAppointmentType, error);

          return throwError(error);
        }));
  }

  public updateAppointmentType(typeId: string, type: PeAppointmentsTypeInterface): Observable<any> {
    return this.updateAppointmentTypeGQL
      .mutate({
        id: typeId,
        businessId: this.businessId,
        data: type,
      })
      .pipe(
        pluck('data', 'updateAppointmentType'),
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.UpdateAppointmentType, error);

          return throwError(error);
        }));
  }

  public deleteAppointmentType(typeId: string): Observable<any> {
    return this.deleteAppointmentTypeGQL
      .mutate({
        businessId: this.businessId,
        id: typeId,
      })
      .pipe(
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.DeleteAppointmentType, error);

          return throwError(error);
        }));
  }
}
