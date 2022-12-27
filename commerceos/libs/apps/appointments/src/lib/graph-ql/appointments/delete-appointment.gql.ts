import { Injectable } from '@angular/core';
import { Mutation } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable()
export class DeleteAppointmentGQL extends Mutation {
  document = gql`
    mutation deleteAppointment($id: String!, $businessId: String!){
      deleteAppointment(id: $id, businessId: $businessId)
    }
  `;
}
