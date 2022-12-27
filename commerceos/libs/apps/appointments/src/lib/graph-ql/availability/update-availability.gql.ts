import { Injectable } from '@angular/core';
import { Mutation } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable()
export class UpdateAvailabilityGql extends Mutation {
  document = gql`
    mutation updateAppointmentAvailability($id: String!, $businessId: String!, $data: UpdateAppointmentAvailabilityDto!){
      updateAppointmentAvailability(id: $id, businessId: $businessId, data: $data) {
        _id
        name
        timeZone
      }
    }
  `;
}
