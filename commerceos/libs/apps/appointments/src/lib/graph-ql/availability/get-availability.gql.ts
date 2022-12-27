import { Injectable } from '@angular/core';
import { Query } from 'apollo-angular';
import gql from 'graphql-tag';

import { AppointmentDto } from '../../interfaces';

@Injectable()
export class GetAvailabilityGql extends Query<AppointmentDto> {
  document = gql`
    query appointmentAvailability($id: String!, $businessId: String!){
      appointmentAvailability(id: $id, businessId: $businessId) {
        _id
        name
        isDefault
        timeZone
        weekDayAvailability {
          name
          isEnabled
          ranges {
            from
            to
          }
        }
      }
    }
  `;
}
