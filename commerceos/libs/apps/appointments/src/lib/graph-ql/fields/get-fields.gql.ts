import { Injectable } from '@angular/core';
import { Query } from 'apollo-angular';
import gql from 'graphql-tag';

import { Fields } from '../../interfaces';

@Injectable()
export class GetFieldsGQL extends Query<Fields> {
  document = gql`
    query fields($businessId: String!, $appointmentId: String){
      fields(businessId: $businessId, appointmentId: $appointmentId) {
        _id
        type
        name
        title
        filterable
        appointmentId
        editableByAdmin
        defaultValues
        showDefault
      }
    }
  `;
}
