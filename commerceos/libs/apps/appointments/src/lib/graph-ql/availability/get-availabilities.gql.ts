import { Injectable } from '@angular/core';
import { Query } from 'apollo-angular';
import gql from 'graphql-tag';

import { AppointmentDto } from '../../interfaces';

@Injectable()
export class GetAvailabilitiesGql extends Query<AppointmentDto[]> {
  document = gql`
    query appointmentAvailabilities($businessId: String!, $listQuery: ListQueryDto!){
      appointmentAvailabilities(businessId: $businessId, listQuery: $listQuery) {
        collection {
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
        pagination_data {
          page
          total
        }
      }
    }
  `;
}
