import { Injectable } from '@angular/core';
import { Mutation } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable()
export class UpdateAppointmentTypeGQL extends Mutation {
  document = gql`
    mutation updateAppointmentType($id: String!, $businessId: String!, $data: UpdateAppointmentTypeDto!){
      updateAppointmentType(id: $id, businessId: $businessId, data: $data) {
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
