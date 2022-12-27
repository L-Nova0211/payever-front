import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import graphqlTag from 'graphql-tag';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

import { EnvService } from '@pe/common';

import { ApolloBaseName } from '../graphql/graphql.module';
import { AddStatusField, UpdateStatusField } from '../interfaces';

@Injectable()
export class StatusGQLService {

  constructor(
    private apollo: Apollo,
    private envService: EnvService,
  ) { }

  public getAllContactsStatus(businessId: string): Observable<any> {
    let query = graphqlTag`
      {
        statuses(businessId: "${businessId}") {
            _id
            name
            businessId
        }
      }
    `;

    return this.apollo
    .use(ApolloBaseName.contacts)
    .subscribe({
      query,
    })
    .pipe(
      pluck('data', 'statuses')
    )
  }

  public createContactStatus(field: AddStatusField): Observable<{ id: string; value: string; }> {
    const mutation = graphqlTag`
      mutation createStatus($name: String!) {
        createStatus(businessId: "${this.envService.businessId}", data: {name: $name}) {
          _id
          businessId
          name
        }
      }
    `;

    return this.apollo
      .use(ApolloBaseName.contacts)
      .mutate({
        mutation,
        variables: {
          ...field,
        },
      })
      .pipe(
        pluck('data', 'createStatus')
      );
  }

  public updateContactStatus(field: UpdateStatusField): Observable<{ id: string; value: string; }> {
    const mutation = graphqlTag`
      mutation updateStatus($name: String!) {
        updateStatus(
          businessId: "${field.businessId}"
          id: "${field.id}"
          data: {
            name: $name
          }
        ) {
          _id
          name
          businessId
        }
      }
    `;

    return this.apollo
      .use(ApolloBaseName.contacts)
      .mutate({
        mutation,
        variables: { name: field.name },
      })
      .pipe(
        pluck('data', 'updateStatus')
      );
  }

  public deleteContactStatus(id: string, businessId: string): Observable<boolean> {
    const mutation = graphqlTag`
      mutation {
        deleteStatus(businessId: "${businessId}", id: "${id}")
      }
    `;

    return this.apollo
      .use(ApolloBaseName.contacts)
      .mutate({
        mutation,
      }).pipe(
        pluck('data', 'deleteStatus'),
      );
  }
}
