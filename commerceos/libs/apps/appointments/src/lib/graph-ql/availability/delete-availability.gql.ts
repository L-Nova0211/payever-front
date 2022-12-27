import { Injectable } from '@angular/core';
import { Mutation } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable()
export class DeleteAvailabilityGql extends Mutation {
  document = gql`
    mutation deleteAppointmentAvailability($id: String!, $businessId: String!){
      deleteAppointmentAvailability(id: $id, businessId: $businessId)
    }
  `;
}
