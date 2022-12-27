import { Injectable } from '@angular/core';
import { Query } from 'apollo-angular';
import gql from 'graphql-tag';

import { AppointmentDto } from '../../interfaces';

@Injectable()
export class GetDefaultAvailabilityGql extends Query<AppointmentDto> {
  document = gql`
    query getDefaultAppointmentAvailability($businessId: String!){
      getDefaultAppointmentAvailability(businessId: $businessId) {
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
