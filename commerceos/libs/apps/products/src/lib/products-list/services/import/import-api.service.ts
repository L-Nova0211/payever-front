import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, pipe, Subject } from 'rxjs';
import { delay, map, repeat, takeWhile, tap } from 'rxjs/operators';

import { EnvService, EnvironmentConfigInterface, PE_ENV } from '@pe/common';

const REQUEST_CHECK_TIMEOUT = 30000;

export enum SynchronizationTasKindEnum {
  FileImport = 'file-import',
  Integration = 'integration',
}

export enum SyncStatusEnum {
  IN_QUEUE = 'in_queue',
  IN_PROGRESS = 'in_progress',
  SUCCEES = 'success',
  FAILURE = 'failure',
}

export enum SyncDirectionEnum {
  INWARD = 'inward',
  OUTWARD = 'outward',
}

export enum SyncKindEnum {
  INTEGRATION = 'integration',
  FILE_IMPORT = 'file-import',
}

@Injectable()
export class ImportApiService {
  businessId: string = this.envService.businessId;
  isImportsBusy$: Subject<boolean> = new Subject();

  statusCheckOperator = pipe(
    map((tasks: any[]) => !!tasks.length),
    tap((isBusy) => {
      this.isImportsBusy$.next(isBusy);
    }),
    delay(REQUEST_CHECK_TIMEOUT),
    repeat(),
    takeWhile(isBusy => isBusy),
  );

  constructor(
    private envService: EnvService,
    private http: HttpClient,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {}

  getProductIntegrations(businessId: string): Observable<any> {
    const apiURL = `${this.env.backend.connect}/api/business/${businessId}/integration/category/products`;

    return this.http.get<any>(apiURL);
  }

  getProductIntegrationStatus(businessId: string, name: string): Observable<any> {
    const apiURL = `${this.env.backend.thirdParty}/api/business/${businessId}/subscription/${name}/connect/status`;

    return this.http.get<any>(apiURL);
  }

  importFromMarket(businessId: string, integrationId: string, overwrite: boolean): Observable<any> {
    const apiURL =
    `${this.env.backend.productsSynchronizer}/api/synchronization/business/${businessId}`
    + `/integration/${integrationId}/direction/inward/trigger`;

    return this.http.post<any>(apiURL, { overwrite });
  }

  importFromFile(
    businessId: string,
    fileUrl: string,
  ): Observable<any> {
    const apiURL = `${this.env.backend.productFiles}/api/synchronization-tasks/business/${businessId}/file-import`;

    return this.http.put<any>(apiURL, {
      fileUrl,
    });
  }

  getTask(businessId: string, taskId: string): Observable<any> {
    const apiURL = `${this.env.backend.productsSynchronizer}/api/synchronization/business/${businessId}/tasks/${taskId}`;

    return this.http.get<any>(apiURL);
  }

  getTasks(businessId: string, params?: any): Observable<any> {
    const apiURL = `${this.env.backend.productsSynchronizer}/api/synchronization/business/${businessId}/tasks`;

    return this.http.get<any>(apiURL, { params });
  }

  checkImportStatus() {
    this.getTasks(this.businessId, {
      status: [SyncStatusEnum.IN_PROGRESS, SyncStatusEnum.IN_QUEUE],
      direction: SyncDirectionEnum.INWARD,
      kind: SyncKindEnum.FILE_IMPORT,
    })
      .pipe(this.statusCheckOperator)
      .subscribe();
  }
}
