import { Injectable } from '@angular/core';
import { Query } from 'apollo-angular';
import gql from 'graphql-tag';

import { AppointmentDto } from '../../interfaces';

@Injectable()
export class GetAppointmentGQL extends Query<AppointmentDto> {
  document = gql`
    query appointment($id: String!, $businessId: String!){
      appointment(id: $id, businessId: $businessId) {
        _id
        allDay
        date
        duration
        contacts
        fields {
          fieldId
          value
        }
        measuring
        products
        repeat
        time
      }
    }
  `;
}
