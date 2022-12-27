import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, pipe, Subject } from 'rxjs';
import { delay, map, repeat, takeWhile, tap } from 'rxjs/operators';

import { EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';

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

  public statusCheckOperator = pipe(
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

  public importFromFile(
    businessId: string,
    fileUrl: string,
    overwriteExisting: boolean,
    uploadedImages?: any[],
  ): Observable<any> {
    const apiURL = `${this.env.backend.contactsSynchronizer}/api/synchronization/business/${businessId}/tasks`;

    return this.http.put<any>(apiURL, {
      kind: SynchronizationTasKindEnum.FileImport,
      fileImport: {
        fileUrl,
        overwriteExisting,
        uploadedImages,
      },
    });
  }
  
}
