import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { flatten } from 'flat';
import graphqlTag from 'graphql-tag';
import cloneDeep from 'lodash/cloneDeep';
import forIn from 'lodash/forIn';
import { Observable, of } from 'rxjs';
import { map, pluck, switchMap, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';
import { FolderItem } from '@pe/folders';
import { PeGridSortingDirectionEnum, PeGridSortingInterface, PeGridSortingOrderByEnum } from '@pe/grid';
import { RuleValues } from '@pe/rules';

import { ApolloBaseName } from '../graphql/graphql.module';
import { AddContact, ContactResponse, Responses } from '../interfaces';

@Injectable()
export class ContactsGQLService {
  public page = 0;
  public hasNextPage = true;

  constructor(
    private apollo: Apollo,
    private httpClient: HttpClient,

    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private envService: EnvService,
    private peAuthService: PeAuthService,
  ) { }

  public getAllContacts(): Observable<{ result: ContactResponse[]; totalCount: number }> {
    const page = this.page;
    this.page = 0;
    const getRequest$ = (contacts: ContactResponse[] = []) =>
      this.getContacts().pipe(
        switchMap((data: any) => {
          const result = [...contacts, ...data.result];
          if (result.length < data.totalCount) {
            this.page = this.page + 1;

            return getRequest$(result);
          }

          return of({ result, totalCount: data.totalCount });
        })
      );

    return getRequest$().pipe(tap(() => (this.page = page)));
  }

  public searchContacts(
    pagination = { page: 1, perPage: 20 },
    order: PeGridSortingInterface = {
      orderBy: PeGridSortingOrderByEnum.FirstName,
      direction: PeGridSortingDirectionEnum.Ascending,
    },
  ): Observable<any> {
    const businessId = this.envService.businessId || this.envService.businessData._id;
    const query = graphqlTag`
      query {
        searchContacts(businessId: "${businessId}", filters: [{
          field: "fullName",
          fieldType: "string",
          fieldCondition: "contains",
          value: ""
        }],
        params: {
          orderDirection: "${order.direction}",
          orderBy: "${order.orderBy}",
          paginationLimit: ${pagination.perPage},
          pageNumber: ${this.page + 1}
        }) {
          info {
            pagination {
              item_count
              page
              page_count
              per_page
            }
          }
          contacts {
            _id
            businessId
            type
            status
            fields {
              _id
              value
              field {
                _id
                name
              }
            }
          }
        }
      }
    `;

    return this.apollo
      .use(ApolloBaseName.contacts)
      .subscribe({
        query,
      })
      .pipe(
        pluck('data', 'searchContacts'),
        map((data: any) => {

          return {
            result: data.contacts.map((node: any) => {
              node.fields.map((cfNode: any) => {
                cfNode.field.defaultValues =
                  cfNode.field?.defaultValues &&
                    typeof cfNode.field.defaultValues === 'string'
                    ? cfNode.field.defaultValues
                    : [];
                cfNode.field.showOn =
                  cfNode.field?.showOn &&
                    typeof cfNode.field.showOn === 'string'
                    ? cfNode.field.showOn
                    : [];

                return cfNode;
              });

              return node;
            }),
            info: data.info.pagination,
          };
        })
      );
  }

  public getContacts(): Observable<any> {
    const businessId = this.envService.businessId || this.envService.businessData._id;
    let query = graphqlTag`
      query {
        contacts (
          businessId: "${businessId}"
          )
        {
          _id
          businessId
          groupsId
          type
          status
          fields {
            _id
            value
            fieldId
            field {
              _id
              name
            }
          }
        }
      }
    `;

    if (this.peAuthService.isAdmin()) {
      query = graphqlTag`
        query {
          contacts {
            _id
            businessId
            groupsId
            type
            status
            fields {
              _id
              value
              fieldId
              field {
                _id
                name
              }
            }
          }
        }
      `;
    }

    return this.apollo
      .use(ApolloBaseName.contacts)
      .subscribe({
        query,
      })
      .pipe(
        pluck('data', 'contacts'),
        map((data: any) => {

          return {
            result: data.map((node: any) => {
              node.fields.map((cfNode: any) => {
                cfNode.field.defaultValues =
                  cfNode.field?.defaultValues &&
                    typeof cfNode.field.defaultValues === 'string'
                    ? cfNode.field.defaultValues
                    : [];
                cfNode.field.showOn =
                  cfNode.field?.showOn &&
                    typeof cfNode.field.showOn === 'string'
                    ? cfNode.field.showOn
                    : [];

                return cfNode;
              });

              return node;
            }),
            totalCount: data.length,
          };
        })
      );
  }

  public getContactById(id: string): Observable<ContactResponse> {
    const businessId = this.envService.businessId || this.envService.businessData._id;
    let query = graphqlTag`
      query {
        contact(id: "${id}", businessId: "${businessId}") {
          _id
          businessId
          groupsId
          type
          status
          fields {
            _id
            value
            fieldId
            field {
              _id
              name
            }
          }
        }
      }
    `;

    if (this.peAuthService.isAdmin()) {
      query = graphqlTag`
        query {
          contact(id: "${id}") {
            _id
            businessId
            groupsId
            type
            status
            fields {
              _id
              value
              fieldId
              field {
                _id
                name
              }
            }
          }
        }
      `;
    }

    return this.apollo
      .use(ApolloBaseName.contacts)
      .subscribe({
        query,
      })
      .pipe(pluck('data', 'contact'));
  }

  public addContact(newContact: AddContact, folderId?: string): Observable<ContactResponse> {
    const businessId = this.envService.businessId || this.envService.businessData._id;
    const fieldsMutation: any = `${newContact.fields && newContact.fields.length
      ? `
        data: {
          type: "${newContact.type}"
          status: "${newContact.status}"
          fields: [
            ${newContact.fields.map(
              (f: any) => `
                    {
                      value: """${f.value}""",
                      fieldId: "${f.fieldId}",
                    }`
            )}
          ]
        }`
      : ''
      }`;

    const mutation = graphqlTag`
      mutation {
        createContact(
          businessId: "${businessId}"
          ${fieldsMutation}
          targetFolderId: ${folderId ? ('"' +  folderId + '"') : null}
        )
        {
          _id
          type
          businessId
          status
          fields {
            value
            field {
              _id
              name
            }
          }
        }
      }
    `;

    const variables = {
      businessId: this.envService.businessData._id,
      ...newContact,
    };

    // if (folderId) {
    //   variables['targetFolderId'] = folderId;
    // }

    return this.apollo
      .use(ApolloBaseName.contacts)
      .mutate({
        mutation,
        variables,
      })
      .pipe(pluck('data', 'createContact'));
  }


  public removeStoreItem(ids: string[]): Observable<Responses.Empty | any> {
    const businessId = this.envService.businessId || this.envService.businessData._id;
    const mutation = graphqlTag`
      mutation deleteContacts{
        deleteContacts(businessId: "${businessId}", ids: [${ids.map(id => `"${id}",`)}])
      }
    `;

    return this.apollo.use('contacts').mutate({
      mutation,
    });
  }

  public deleteContact(id: string): Observable<boolean> {
    const businessId = this.envService.businessId || this.envService.businessData._id;
    const mutation = graphqlTag`
      mutation {
        deleteContact(businessId: "${businessId}", id: "${id}")
      }
    `;

    return this.apollo
      .use(ApolloBaseName.contacts)
      .mutate({
        mutation,
        variables: { id },
      })
      .pipe(pluck('data', 'deleteContact'));
  }

  public updateContact(id: string, newContact: AddContact): Observable<ContactResponse> {
    const businessId = this.envService.businessId || this.envService.businessData._id;
    const fieldsMutation: any = `${newContact.fields && newContact.fields.length
      ? `
        data: {
          type: "${newContact.type}"
          status: "${newContact.status}"
          fields: [
            ${newContact.fields
              .map((field: any) => `
              {
                value: """${field.value}""",
                fieldId: "${field.fieldId}",
              }`
              )}
          ]
        }`
      : ''
    }`;

    const mutation = graphqlTag`
      mutation {
        updateContact(
          businessId: "${businessId}"
          id: "${id}"
          ${fieldsMutation}
        )
        {
          _id
          type
          businessId
          status
          fields {
            value
            field {
              _id
              name
            }
          }
        }
      }
    `;

    return this.apollo
      .use(ApolloBaseName.contacts)
      .mutate({
        mutation,
        variables: {
          id,
          type: newContact.type,
        },
      })
      .pipe(pluck('data', 'updateContact'));
  }

  public copyContacts(folderId: string = null, ids: string[]): Observable<any> {
    const businessId = this.envService.businessId || this.envService.businessData._id;
    const mutation = graphqlTag`
      mutation copyContacts {
        copyContacts(
          contactIds: [${ids.map(id => `"${id}",`)}],
          businessId: "${businessId}",
          targetFolderId: ${folderId ? `"${folderId}"` : null},
        ) {
          contacts {
            _id
            type
            businessId
            fields {
              value
              field {
                _id
                name
              }
            }
          }
        }
      }
    `;

    return this.apollo
      .use(ApolloBaseName.contacts)
      .mutate({
        mutation,
        variables: {
          businessId: this.envService.businessData._id,
        },
      })
      .pipe(pluck('data', 'copyContacts', 'contacts'));
  }



  public filterContact(filterString: string): Observable<any> {
    const businessId = this.envService.businessId || this.envService.businessData._id;

    return this.httpClient.get<any>(`${this.env.backend.contacts}/api/es/list/${businessId}?filters=${filterString}`);
  }

  /* Folders */

  getFolderDocuments(folderId: string, searchData: any) {
    let path = `${this.env.backend.contacts}/api/folders/business/${this.envService.businessId}/root-documents`;
    if (folderId) {
      path =
        `${this.env.backend.contacts}/api/folders/business/${this.envService.businessId}/folder/${folderId}/documents`;
    }

    return this.httpClient.get<any>(path, { params: this.getSearchParams(searchData) });
  }

  getFlatFolders(): Observable<FolderItem[]> {
    return this.httpClient.get<FolderItem[]>
      (`${this.env.backend.contacts}/api/folders/business/${this.envService.businessId}`);
  }

  getFolders(): Observable<FolderItem[]> {
    return this.httpClient.get<FolderItem[]>
      (`${this.env.backend.contacts}/api/folders/business/${this.envService.businessId}/tree`);
  }

  postFolder(folderData: FolderItem): Observable<FolderItem> {
    return this.httpClient.post<FolderItem>(
      `${this.env.backend.contacts}/api/folders/business/${this.envService.businessId}`, folderData
    );
  }

  patchFolder(folderData: FolderItem): Observable<FolderItem> {
    const folderId = folderData._id;
    delete folderData._id;

    return this.httpClient.patch<FolderItem>(
      `${this.env.backend.contacts}/api/folders/business/${this.envService.businessId}/folder/${folderId}`,
      folderData
    );
  }

  patchFolderPosition(positions: any[]): Observable<FolderItem> {
    return this.httpClient.post<FolderItem>(
      `${this.env.backend.contacts}/api/folders/business/${this.envService.businessId}/update-positions`,
      { positions }
    );
  }

  deleteFolder(folderId: string): Observable<FolderItem> {
    return this.httpClient.delete<FolderItem>(
      `${this.env.backend.contacts}/api/folders/business/${this.envService.businessId}/folder/${folderId}`
    );
  }

  moveToFolder(folderId: string, documentId: string) {
    return this.httpClient.post(
      // eslint-disable-next-line max-len
      `${this.env.backend.contacts}/api/folders/business/${this.envService.businessId}/document/${documentId}/move-to-folder/${folderId}`, null
    );
  }

  moveToRoot(documentId: string) {
    return this.httpClient.post(
      `${this.env.backend.contacts}/api/folders/business/${this.envService.businessId}
      /document/${documentId}/move-to-root`, null
    );
  }

  defaultFolderDocuments(searchData) {
    return this.httpClient.get(
      `${this.env.backend.contacts}/api/folders/product/contact/documents`,
      { params: this.getSearchParams(searchData) }
    );
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
      const flattenParams: { [propName: string]: string } = flatten({ configuration: searchDataCopy.configuration });

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

  private getNumber(val: number | string): number {
    let result = 0;
    if (typeof val !== 'number') {
      try {
        result = Number(val);
      } catch (error) {
        result = 0;
      }
    } else {
      result = val;
    }
    if (isNaN(result)) {
      result = 0;
    }

    return result;
  }


  private getAllParams(object: {}, removeBraces: boolean = true): string {
    const res: string = JSON.stringify(object).replace(/"\w+"\s*:/g, '$1:');

    return removeBraces ? res.substr(1, res.length - 1) : res;
  }

  /* Rules */

  getRulesValues(): Observable<RuleValues> {
    return this.httpClient.get<RuleValues>(`${this.env.backend.contacts}/api/rules/values`);
  }

  getRules(): Observable<any> {
    return this.httpClient.get(`${this.env.backend.contacts}/api/rules/business/${this.envService.businessId}`);
  }

  createRule(data): Observable<any> {
    return this.httpClient.post(`${this.env.backend.contacts}/api/rules/business/${this.envService.businessId}`, data);
  }

  updateRule(data, ruleId: string): Observable<any> {
    return this.httpClient.patch(
      `${this.env.backend.contacts}/api/rules/business/${this.envService.businessId}/rule/${ruleId}`,
      data
    );
  }

  deleteRule(ruleId: string): Observable<any> {
    return this.httpClient.delete(
      `${this.env.backend.contacts}/api/rules/business/${this.envService.businessId}/rule/${ruleId}`
    );
  }

  getRuleDetails(ruleId: string): Observable<any> {
    return this.httpClient.get(
      `${this.env.backend.contacts}​/api​/rules​/business​/
      ${this.envService.businessId}​/rule​/${ruleId}`
    );
  }

  /*Approve-Deny*/
  getAllApplicationAccess(ids) {
    const businessId = this.envService.businessId || this.envService.businessData._id;

    return this.httpClient.get<any>(
      `${this.env.backend.auth}/api/customers/application-access/business/${businessId}`,
      { params: { users: ids } }
    );
  }
}
