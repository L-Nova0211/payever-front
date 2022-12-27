import { Injectable } from '@angular/core';
import { Mutation } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable()
export class CreateAppointmentGQL extends Mutation {
  document = gql`
    mutation createAppointment($businessId: String!, $data: CreateAppointmentDto!){
      createAppointment(businessId: $businessId, data: $data) {
        _id
        allDay
        applicationScopeElasticId
        date
        time
      }
    }
  `;
}
