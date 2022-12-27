import { Injectable } from '@angular/core';
import { Mutation } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable()
export class CreateAvailabilityGql extends Mutation {
  document = gql`
    mutation createAppointmentAvailability($businessId: String!, $data: CreateAppointmentAvailabilityDto!){
      createAppointmentAvailability(businessId: $businessId, data: $data) {
        _id
        name
        timeZone
      }
    }
  `;
}
