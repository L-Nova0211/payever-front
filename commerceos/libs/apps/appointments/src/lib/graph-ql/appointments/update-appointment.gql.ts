import { Injectable } from '@angular/core';
import { Mutation } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable()
export class UpdateAppointmentGQL extends Mutation {
  document = gql`
    mutation updateAppointment($id: String!, $businessId: String!, $data: UpdateAppointmentDtoAppointmentDto!){
      updateAppointment(id: $id, businessId: $businessId, data: $data) {
        _id
        allDay
        date
        time
      }
    }
  `;
}
