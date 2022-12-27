import { Injectable } from '@angular/core';
import { Query } from 'apollo-angular';
import gql from 'graphql-tag';

import { PeAppointmentsTypeInterface } from '../../interfaces';

@Injectable()
export class GetAppointmentTypeGQL extends Query<PeAppointmentsTypeInterface> {
  document = gql`
    query appointmentType($id: String!, $businessId: String!){
      appointmentType(id: $id, businessId: $businessId) {
        _id
        dateRange
        description
        duration
        eventLink
        indefinitelyRange
        isDefault
        isTimeAfter
        isTimeBefore
        maxInvitees
        name
        schedule
        timeAfter
        timeBefore
        type
        unit
      }
    }
  `;
}
