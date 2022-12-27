import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { flatten } from 'flat';
import cloneDeep from 'lodash/cloneDeep';
import forIn  from 'lodash/forIn';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV, EnvService } from '@pe/common';
import { FolderItem } from '@pe/folders';
import { SnackbarService } from '@pe/snackbar';

import { PEB_INVOICE_API_COMMON_PATH, PEB_INVOICE_API_PATH } from '../constants';
import { CollectionsLoadedInterface } from '../interfaces/filter.interface';

@Injectable()
export class InvoiceApiService {
  applicationId: string;
  private folderList: FolderItem[] = [];
  constructor(
    @Inject(PEB_INVOICE_API_PATH) private editorApiPath: string,
    @Inject(PEB_INVOICE_API_COMMON_PATH) private commonApiPath: string,
    private http: HttpClient,
    private snackBarService: SnackbarService,
    public  envService: EnvService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {
  }

  /* Folders */
  getFolderDocuments(folderId: string, searchData: any) {
    let path = `${this.editorApiPath}/folders/business/${this.envService.businessId}/root-documents`;
    if (folderId) {
      path = `${this.editorApiPath}/folders/business/${this.envService.businessId}/folder/${folderId}/documents`;
    }

    return this.http.get<any>(path, { params: this.getSearchParams(searchData) });
  }

  getFlatFolders(): Observable<FolderItem[]> {

    return this.http.get<FolderItem[]>(`${this.editorApiPath}/folders/business/${this.envService.businessId}`);
  }

  getFolders(): Observable<FolderItem[]> {

    return this.http.get<FolderItem[]>(`${this.editorApiPath}/folders/business/${this.envService.businessId}/tree`);
  }

  postFolder(folderData: FolderItem): Observable<FolderItem> {

    return this.http.post<FolderItem>(
      `${this.editorApiPath}/folders/business/${this.envService.businessId}`, folderData
    )
  }

  patchFolder(folderData: FolderItem): Observable<FolderItem> {
    const folderId = folderData._id;
    delete folderData._id;

    return this.http.patch<FolderItem>(
      `${this.editorApiPath}/folders/business/${this.envService.businessId}/folder/${folderId}`, folderData
    );
  }

  patchFolderPosition(positions: any[]): Observable<FolderItem> {

    return this.http.post<FolderItem>(
      `${this.editorApiPath}/folders/business/${this.envService.businessId}/update-positions`,
      { positions }
    );
  }

  deleteFolder(folderId: string): Observable<FolderItem> {

    return this.http.delete<FolderItem>(
      `${this.editorApiPath}/folders/business/${this.envService.businessId}/folder/${folderId}`
    );
  }

  moveToFolder(folderId: string, documentId: string) {

    return this.http.post(
      `${this.editorApiPath}/folders/business/${this.envService.businessId}/document/${documentId}`
      + `/move-to-folder/${folderId}`,
      null,
    );
  }

  moveToRoot(documentId: string) {

    return this.http.post(
      `${this.editorApiPath}/folders/business/${this.envService.businessId}/document/${documentId}/move-to-root`, null);
  }

  defaultFolder(): Observable<FolderItem> {

    return this.http.get<FolderItem>(`${this.editorApiPath}/folders/invoice/default`);
  }

  defaultFolderDocuments(searchData) {

    return this.http.get(
      `${this.editorApiPath}/folders/invoice/default/documents`, { params: this.getSearchParams(searchData) });
  }

  clearFolderList(): void {
    this.folderList = [];
  }

  folderTreeMapper(tree: any[]): any[] {
    const treeMapped = tree.reduce((acc, item) => {
      if (item?.children?.length) {
        item.children = [...this.folderTreeMapper(item?.children)];
      }

      return [
        ...acc,
        {
          ...item,
          image: item.image,
        },
      ]
    }, []);

    return treeMapped;
  }

  private getSearchParams(searchData: any): HttpParams {
    const searchDataCopy = cloneDeep(searchData);
    let searchParams: HttpParams = new HttpParams()
      .set('orderBy', searchDataCopy.orderBy ? searchDataCopy.orderBy.replace(/p\./g, '') : 'updatedAt')
      .set('direction', searchDataCopy.direction ? searchDataCopy.direction : 'desc')
      .set('limit', searchDataCopy.perPage ? `${searchDataCopy.perPage}` : '10')
      .set('page', searchDataCopy.page ? `${searchDataCopy.page}` : '1')
      .set('filters[isHeadline][0][condition]', 'isNot')
      .set('filters[isHeadline][0][value][0]', 'true');

    if (Object.keys(searchDataCopy?.configuration ?? []).length) {
      const flattenParams: { [propName: string]: string } =
        flatten({ configuration: searchDataCopy.configuration });

      forIn(flattenParams, (propValue: string, propName: string) => {
        const httpParamName: string = propName.split('.')
          .map((element: string, index: number) => {
            if (index !== 0) {

              return `[${element}]`;
            }

            return 'filters';
          })
          .join('');

        searchParams = searchParams.set(httpParamName, propValue);
      });
    }

    return searchParams;
  }


  getCurrencyList(): any {

    return this.http.get(`${this.commonApiPath}/api/currency/list`);
  }

  loadCollections(page: number, businessId: string, parentId?: string): Observable<CollectionsLoadedInterface> {
    let parentUrl: string;

    if (parentId === undefined) {
      parentUrl = '';
    } else if (parentId === null) {
      parentUrl = '/parent/';
    } else {
      parentUrl = `/parent/${parentId}`;
    }

    return this.http
      .get<CollectionsLoadedInterface>(
        `${this.editorApiPath}/collections/${businessId}${parentUrl}?page=${page}&perPage=100`,
      )
      .pipe(
        catchError((error: any) => of({} as CollectionsLoadedInterface)),
        shareReplay(1),
      );
  }

  openSnackbar(text: string, success: boolean): void {
    this.snackBarService.toggle(true, {
      content: text,
      duration: 2500,
      useShowButton: false,
      iconId: success && 'icon-commerceos-success',
      iconSize: 24,
      iconColor: '#00B640',
    });
  }

}
