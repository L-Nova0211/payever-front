import { Injectable } from '@angular/core';
import { Mutation } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable()
export class DeleteFieldGQL extends Mutation {
  document = gql`
    mutation deleteField($id: String!, $businessId: String!){
      deleteField(id: $id, businessId: $businessId)
    }
  `;
}
