import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import graphqlTag from 'graphql-tag';
import { Observable } from 'rxjs';
import { map, pluck } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

import { PeAuthService } from '@pe/auth';
import { EnvService } from '@pe/common';

import { ApolloBaseName } from '../graphql/graphql.module';
import { AddContactField, ContactField, Field, UpdateContactField } from '../interfaces';
import { getGQLFilters } from '../utils/contacts';

@Injectable()
export class FieldsGQLService {

  constructor(
    private apollo: Apollo,
    private envService: EnvService,
    private peAuthService: PeAuthService,
  ) { }

  public getAllFields(): Observable<Field[]> {
    const businessId = this.envService.businessId;
    const isAdmin = this.peAuthService.isAdmin() ? '' : `businessId: "${businessId}", `;
    const query = graphqlTag`
      query getFields($contactId: String) {
        fields(${isAdmin}contactId: $contactId) {
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
        variables: {
          businessId,
        },
      })
      .pipe(
        pluck('data', 'fields')
      );
  }

  public getDefaultField(contactId: string = null): Observable<Field[]> {
    const businessId = this.envService.businessId;
    const isAdmin = this.peAuthService.isAdmin() ? '' : `businessId: "${businessId}", `;
    const query = graphqlTag`
      query getDefaultField($contactId: String) {
        fields(${isAdmin}contactId: $contactId) {
          _id
          name
          businessId
          editableByAdmin
          contactId
          type
          defaultValues
          filterable
          showOn
        }
      }
    `;
    
    return this.apollo
      .use(ApolloBaseName.contacts)
      .query({
        query,
        variables: {
          contactId,
        },
      })
      .pipe(
        pluck('data', 'fields')
      );
  }

  public getFields(contactId: string = null): Observable<Field[]> {
    const businessId = this.envService.businessId;
    const isAdmin = this.peAuthService.isAdmin() ? '' : `businessId: "${businessId}", `;
    const query = graphqlTag`
      query getFields($contactId: String) {
        fields(${isAdmin}contactId: $contactId) {
          _id
          name
          businessId
          editableByAdmin
          contactId
          type
          defaultValues
          filterable
          showOn
        }
      }
    `;

    return this.apollo
      .use(ApolloBaseName.contacts)
      .subscribe({
        fetchPolicy: 'network-only',
        query,
        variables: {
          businessId,
          contactId,
        },
      }).pipe(
        pluck('data', 'fields'),
      );
  }

  public getContactFields(filters: any = {}): Observable<ContactField[]> {
    const query = graphqlTag`
      query ($businessId: UUID!) {
        contactFields(
          orderBy: [VALUE_ASC],
          filter: {and: [
            {businessId: {equalTo: $businessId}},
            ${getGQLFilters(filters)}
          ]},
        ) {
          nodes {
            contactId
            fieldId
            value
          }
        }
      }
    `;

    return this.apollo
      .use(ApolloBaseName.contacts)
      .subscribe({
        query,
        variables: {
          businessId: this.envService.businessId,
        },
      }).pipe(
        pluck('data', 'contactFields', 'nodes'),
      );
  }

  public createContactField(field: AddContactField): Observable<{ id: string; value: string; }> {
    const mutation = graphqlTag`
      mutation createContactField(
        $id: UUID!,
        $businessId: UUID!,
        $contactId: UUID!,
        $fieldId: UUID!,
        $value: String!,
      ) {
        createContactField(input: {
          contactField: {
            id: $id,
            businessId: $businessId,
            contactId: $contactId,
            fieldId: $fieldId,
            value: $value,
          }
        }) {
          contactField {
            id
            value
          }
        }
      }
    `;

    return this.apollo
      .use(ApolloBaseName.contacts)
      .mutate({
        mutation,
        variables: {
          id: uuidv4(),
          businessId: this.envService.businessId,
          ...field,
        },
      })
      .pipe(
        pluck('data', 'createContactField', 'contactField')
      );
  }

  public updateContactField(field: UpdateContactField): Observable<{ id: string; value: string; }> {
    const mutation = graphqlTag`
      mutation updateContactField(
        $id: UUID!,
        $value: String!,
      ) {
        updateContactField(
          input: {
            id: $id,
            patch: {
              value: $value,
            }
          }) {
          contactField {
            id
            value
          }
        }
      }
    `;

    return this.apollo
      .use(ApolloBaseName.contacts)
      .mutate({
        mutation,
        variables: field,
      })
      .pipe(
        pluck('data', 'updateContactField', 'contactField')
      );
  }

  public createCustomField(field: Partial<Field>, contactId: string = null): Observable<Field> {
    if(field.showOn.includes('default')) {
      contactId = null;
    }
    const mutation = graphqlTag`
      mutation CreateField($data:CreateFieldDtoFieldDto!, $businessId:String!, $contactId:String) {
        createField(data:$data , businessId:$businessId, contactId:$contactId) {
          _id
          type
          name
          groupId
          businessId
          filterable
          contactId
          editableByAdmin
          defaultValues
          showOn
        }
      }
    `;

    delete field.businessId;
    delete field.editable;

    return this.apollo
      .use(ApolloBaseName.contacts)
      .mutate({
        mutation,
        variables: {
          data:{ ...field },
          contactId,
          businessId: this.envService.businessId,
        },
      })
      .pipe(
        pluck('data', 'createField'),
        map((f: any) => ({
          ...f,
          editable: f['editableByAdmin'],
        })),
      );
  }

  public updateCustomFieldId(_id: string, businessId: string, contactId: string = null): Observable<Field> {
    const mutation = graphqlTag`
      mutation ($contactId: String) {
        updateField(
          businessId: "${businessId}"
          id: "${_id}"
          data: {
            contactId: $contactId
          }
        ) {
          id
          contactId
        }
      }
    `;

    return this.apollo
      .use(ApolloBaseName.contacts)
      .mutate({
        mutation,
        variables: {
          contactId,
        },
      }).pipe(
        pluck('data', 'updateField', 'field'),
      );
  }

  public updateCustomField(field: Field, contactId: string = null): Observable<Field> {
    if(field.showOn.includes('default')) {
      contactId = null;
    }
    const mutation = graphqlTag`
      mutation (
        $filterable: Boolean!
        $editableByAdmin: Boolean!
        $type: String!
        $name: String!
        $defaultValues: [String!]
        $showOn: [String!]
        $contactId: String
      ) {
        updateField(
          businessId: "${field.businessId}"
          id: "${field._id}"
          data: {
            contactId: $contactId
            name: $name
            type: $type
            filterable: $filterable
            editableByAdmin: $editableByAdmin
            defaultValues: $defaultValues
            showOn: $showOn
          }
        ) {
          id
          type
          name
          groupId
          businessId
          contactId
          groupId
          defaultValues
          showOn
        }
      }
    `;

    return this.apollo
      .use(ApolloBaseName.contacts)
      .mutate({
        mutation,
        variables: {
          ...field,
          contactId,
          businessId: this.envService.businessId,
        },
      }).pipe(
        pluck('data', 'updateField', 'field'),
      );
  }

  public deleteField(businessId:string , id: string): Observable<boolean> {
    const mutation = graphqlTag`
      mutation ($businessId:String!, $id: String!) {
        deleteField(businessId: $businessId, id: $id)
      }
    `;

    return this.apollo
      .use(ApolloBaseName.contacts)
      .mutate({
        mutation,
        variables: { businessId, id },
      }).pipe(
        pluck('data', 'deleteContactField'),
      );
  }
}
