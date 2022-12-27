import { Injectable } from '@angular/core';
import { Query } from 'apollo-angular';
import gql from 'graphql-tag';

import { PeAppointmentsTypeInterface } from '../../interfaces';

@Injectable()
export class GetAppointmentTypesGQL extends Query<PeAppointmentsTypeInterface[]> {
  document = gql`
    query appointmentTypes($businessId: String!, $listQuery: ListQueryDto!){
      appointmentTypes(businessId: $businessId, listQuery: $listQuery) {
        collection {
          _id
          isDefault
          name
          type
        }
        pagination_data {
          page
          total
        }
      }
    }
  `;
}
