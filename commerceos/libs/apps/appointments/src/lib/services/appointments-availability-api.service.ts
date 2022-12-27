import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, pluck, take } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import { PeGridSearchDataInterface } from '@pe/grid';

import { PeAppointmentsRequestsErrorsEnum } from '../enums';
import {
  CreateAvailabilityGql,
  DeleteAvailabilityGql,
  GetAvailabilitiesGql,
  GetAvailabilityGql,
  UpdateAvailabilityGql,
} from '../graph-ql';
import { PeAppointmentsAvailabilityInterface } from '../interfaces';

import { PeErrorsHandlerService } from './errors-handler.service';
import { GetDefaultAvailabilityGql } from '../graph-ql';


@Injectable()
export class PeAppointmentsAvailabilityApiService {
  constructor(
    private pebEnvService: PebEnvService,
    // Types GQL
    private createAppointmentAvailabilityGQL: CreateAvailabilityGql,
    private deleteAppointmentAvailabilityGQL: DeleteAvailabilityGql,
    private getAppointmentAvailabilityGQL: GetAvailabilityGql,
    private getDefaultAvailabilityGQL: GetDefaultAvailabilityGql,
    private getAppointmentAvailabilitiesGQL: GetAvailabilitiesGql,
    private updateAppointmentAvailabilityGQL: UpdateAvailabilityGql,
    private peErrorsHandlerService: PeErrorsHandlerService,
  ) { }

  private get businessId(): string {
    return this.pebEnvService.businessId;
  }

  // Appointment availability
  public getDefaultAppointmentAvailability(): Observable<PeAppointmentsAvailabilityInterface> {
    return this.getDefaultAvailabilityGQL
      .watch({
        businessId: this.businessId,
      })
      .valueChanges
      .pipe(
        take(1),
        map((response: any) => response.data?.getDefaultAppointmentAvailability),
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.GetDefaultAppointmentAvailability, error);

          return throwError(error);
        }));
  }

  public getAppointmentAvailability(availabilityId: string): Observable<PeAppointmentsAvailabilityInterface> {
    return this.getAppointmentAvailabilityGQL
      .watch({
        businessId: this.businessId,
        id: availabilityId,
      })
      .valueChanges
      .pipe(
        take(1),
        map((response: any) => response.data?.appointmentAvailability),
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.GetAppointmentAvailability, error);

          return throwError(error);
        }));
  }

  public getAppointmentAvailabilities(
    searchData: PeGridSearchDataInterface,
  ): Observable<{
    collection: PeAppointmentsAvailabilityInterface[],
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

    return this.getAppointmentAvailabilitiesGQL
      .watch({
        businessId: this.businessId,
        listQuery: { filters, limit, ...listQuery },
      })
      .valueChanges
      .pipe(
        take(1),
        map((response: any) => response.data?.appointmentAvailabilities ?? defaultData),
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.GetAppointmentAvailabilities, error);

          return of(defaultData);
        }));
  }

  public createAppointmentAvailability(availability: PeAppointmentsAvailabilityInterface): Observable<any> {
    return this.createAppointmentAvailabilityGQL
      .mutate({
        businessId: this.businessId,
        data: availability,
      })
      .pipe(
        pluck('data', 'createAppointmentAvailability'),
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.CreateAppointmentAvailability, error);

          return throwError(error);
        }));
  }

  public updateAppointmentAvailability(
    typeId: string,
    availability: PeAppointmentsAvailabilityInterface
  ): Observable<any> {
    return this.updateAppointmentAvailabilityGQL
      .mutate({
        id: typeId,
        businessId: this.businessId,
        data: availability,
      })
      .pipe(
        pluck('data', 'updateAppointmentAvailability'),
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.UpdateAppointmentAvailability, error);

          return throwError(error);
        }));
  }

  public deleteAppointmentAvailability(availabilityId: string): Observable<any> {
    return this.deleteAppointmentAvailabilityGQL
      .mutate({
        businessId: this.businessId,
        id: availabilityId,
      })
      .pipe(
        catchError((error) => {
          this.peErrorsHandlerService
            .errorHandler(PeAppointmentsRequestsErrorsEnum.DeleteAppointmentAvailability, error);

          return throwError(error);
        }));
  }
}
