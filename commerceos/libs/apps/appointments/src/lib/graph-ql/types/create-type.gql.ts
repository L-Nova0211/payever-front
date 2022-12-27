import { Injectable } from '@angular/core';
import { Mutation } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable()
export class CreateAppointmentTypeGQL extends Mutation {
  document = gql`
    mutation createAppointmentType($businessId: String!, $data: CreateAppointmentTypeDto!){
      createAppointmentType(businessId: $businessId, data: $data) {
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
