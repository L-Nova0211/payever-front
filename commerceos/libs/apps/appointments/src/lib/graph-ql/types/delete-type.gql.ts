import { Injectable } from '@angular/core';
import { Mutation } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable()
export class DeleteAppointmentTypeGQL extends Mutation {
  document = gql`
    mutation deleteAppointmentType($id: String!, $businessId: String!){
      deleteAppointmentType(id: $id, businessId: $businessId)
    }
  `;
}
