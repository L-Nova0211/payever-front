import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ApmService } from '@elastic/apm-rum-angular';
import { flatten } from 'flat';
import cloneDeep from 'lodash/cloneDeep';
import forIn from 'lodash/forIn';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { CosEnvService } from '@pe/base';
import { EnvService } from '@pe/common';
import { PeGridSearchDataInterface } from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { SnackbarService } from '@pe/snackbar';

import { PeFoldersRequestsErrorsEnum } from '../enums';
import { FolderItem, PeFoldersUpdatePositionsInterface } from '../interfaces';
import { PE_FOLDERS_API_PATH } from '../tokens';

export const ID_OF_DEFAULT_FOLDER = 'default';

@Injectable()
export class PeFoldersApiService {

  public readonly hostPath$ = new BehaviorSubject<string>(null);
  public readonly applicationId$ = new BehaviorSubject<string>(null);

  constructor(
    private apmService: ApmService,
    private httpClient: HttpClient,
    private cosEnvService: CosEnvService,
    private envService: EnvService,
    private peAuthService: PeAuthService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    @Inject(PE_FOLDERS_API_PATH) private peFoldersApiPath: string,
  ) { }

  private get foldersPath(): string {
    return `${this.hostPath$.value ? this.hostPath$.value : this.peFoldersApiPath}/folders`;
  }

  public get foldersBusinessPath(): string {
    const applicationPath = this.applicationId$.value
      ? `/application/${this.applicationId$.value}`
      : '';

    return this.cosEnvService.isPersonalMode
      ? `${this.foldersPath}/user/${this.peAuthService.getUserData().uuid}`
      : `${this.foldersPath}/business/${this.envService.businessId}${applicationPath}`;
  }

  private get foldersDefaultThemePath(): string {
    return `${this.foldersPath}/theme/default`;
  }

  // Folders requests
  public getFolders(): Observable<any> {
    return this.httpClient
      .get(this.foldersBusinessPath)
      .pipe(
        catchError(error => {
          this.errorHandler(PeFoldersRequestsErrorsEnum.GetFolders, error, true);

          return throwError(error);
        }));
  }

  public getFoldersTree(): Observable<any> {
    return this.httpClient
      .get(`${this.foldersBusinessPath}/tree`)
      .pipe(
        catchError(error => {
          this.errorHandler(PeFoldersRequestsErrorsEnum.GetFoldersTree, error, true);

          return of([]);
        }));
  }

  public getRootFolder(): Observable<any> {
    return this.httpClient
      .get(`${this.foldersBusinessPath}/root-folder`)
      .pipe(
        catchError(error => {
          this.errorHandler(PeFoldersRequestsErrorsEnum.GetRootFolder, error, true);

          return throwError(error);
        }));
  }

  public createFolder(folderData: FolderItem): Observable<any> {
    return this.httpClient
      .post(this.foldersBusinessPath, folderData)
      .pipe(
        catchError(error => {
          this.errorHandler(PeFoldersRequestsErrorsEnum.CreateFolder, error, true);

          return throwError(error);
        }));
  }

  public deleteFolder(folderId: string): Observable<null> {
    return this.httpClient
      .delete<null>(`${this.foldersBusinessPath}/folder/${folderId}`)
      .pipe(
        catchError(error => {
          this.errorHandler(PeFoldersRequestsErrorsEnum.DeleteFolder, error, true);

          return throwError(error);
        }));
  }

  public updateFolder(folderData: FolderItem): Observable<any> {
    const folderId = folderData._id;
    delete folderData._id;

    return this.httpClient
      .patch(`${this.foldersBusinessPath}/folder/${folderId}`, folderData)
      .pipe(
        catchError(error => {
          this.errorHandler(PeFoldersRequestsErrorsEnum.UpdateFolder, error, true);

          return throwError(error);
        }));
  }

  public updatePositions(updatePositions: PeFoldersUpdatePositionsInterface): Observable<any> {
    return this.httpClient
      .post(`${this.foldersBusinessPath}/update-positions`, updatePositions)
      .pipe(
        catchError(error => {
          this.errorHandler(PeFoldersRequestsErrorsEnum.UpdatePositions, error, true);

          return throwError(error);
        }));
  }

  // Documents requests
  public getFolderItems(folderId: string, searchData?: any, rootFolderId: string = null): Observable<any> {
    const path = folderId === ID_OF_DEFAULT_FOLDER
      ? `${this.foldersDefaultThemePath}/documents`
      : folderId === rootFolderId
        ? `${this.foldersBusinessPath}/root-documents`
        : `${this.foldersBusinessPath}/folder/${folderId}/documents`;

    return this.httpClient
      .get(path, { params: this.getSearchParams(searchData) })
      .pipe(
        catchError(error => {
          this.errorHandler(PeFoldersRequestsErrorsEnum.GetFolderItems, error, true);
          const folderItems = {
            collection: [],
            pagination_data: {
              page: 1,
              total: 0,
            },
          };

          return of(folderItems);
        }));
  }

  public moveToFolder(documentId: string, folderId: string, rootFolderId: string = null): Observable<any> {
    const moveToFolder = folderId === rootFolderId ? 'move-to-root' : `move-to-folder/${folderId}`;

    return this.httpClient
      .post(`${this.foldersBusinessPath}/document/${documentId}/${moveToFolder}`, documentId)
      .pipe(
        catchError(error => {
          this.errorHandler(PeFoldersRequestsErrorsEnum.MoveToFolder, error, true);

          return throwError(error);
        }));
  }

  public getDefaultFolder(): Observable<FolderItem[]> {
    return this.httpClient
      .get<FolderItem[]>(this.foldersDefaultThemePath)
      .pipe(
        catchError(error => {
          this.errorHandler(PeFoldersRequestsErrorsEnum.GetDefaultFolder, error, true);

          return throwError(error);
        }));
  }

  private getSearchParams(searchData: PeGridSearchDataInterface): HttpParams {
    const searchDataCopy = cloneDeep(searchData);
    let searchParams: HttpParams = new HttpParams()
      .set('sort[0][field]', searchDataCopy.orderBy ? searchDataCopy.orderBy : 'updatedAt')
      .set('sort[0][direction]', searchDataCopy.direction ? searchDataCopy.direction : 'desc')
      .set('limit', searchDataCopy.perPage ? `${searchDataCopy.perPage}` : '10')
      .set('page', searchDataCopy.page ? `${searchDataCopy.page}` : '1')
      .set('filters[isHeadline][0][condition]', 'isNot')
      .set('filters[isHeadline][0][value][0]', 'true');

    if (Object.keys(searchDataCopy?.configuration ?? []).length) {
      const flattenParams: { [propName: string]: string } = flatten({ configuration: searchDataCopy.configuration });

      forIn(flattenParams, (propValue: string, propName: string) => {
        const httpParamName: string = propName.split('.')
          .map((element: string, index: number) => {
            if (element.includes('[')) {
              element = element.replace('[', '.').replace(']', '');
            }

            return index !== 0 ? `[${element}]` : 'filters';
          })
          .join('');

        searchParams = searchParams.set(httpParamName.replace(':', '.'), propValue);
      });
    }

    return searchParams;
  }

  private errorHandler(description: string, error: any, showWarning?: boolean): void {
    const errorDescription = this.translateService.translate(description);

    if (showWarning) {
      this.snackbarService.toggle(true, {
        content: errorDescription,
        duration: 15000,
        iconColor: '#E2BB0B',
        iconId: 'icon-alert-24',
        iconSize: 24,
      });
    }
    this.apmService.apm.captureError(`${errorDescription} ms:\n${JSON.stringify(error)}`);
  }
}
