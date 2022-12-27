import { Injectable } from '@angular/core';
import { Mutation } from 'apollo-angular';
import gql from 'graphql-tag';

import { FieldDto } from '../../interfaces';

@Injectable()
export class CreateFieldGQL extends Mutation {
  document = gql`
    mutation createFields($businessId: String!, $appointmentId: String){
      createField(
        businessId: $businessId 
        appointmentId: $appointmentId
        data: {
          name: "custom"
          title: "Custom"
          type: "text",
          filterable: true,
          editableByAdmin: false
          showDefault: false
        }
      ) {
        _id
        name
      }
    }
  `;

  createField(field: FieldDto) {
    this.document = gql`
      mutation createField($businessId: String!, $appointmentId: String){
        ${field.name}: createField(
          businessId: $businessId
          appointmentId: $appointmentId
          data: {
            name: "${field.name}"
            title: "${field.title}"
            type: "${field.type || 'text'}",
            filterable: ${field.filterable || 'true'},
            editableByAdmin: ${field.editableByAdmin || 'false'}
            defaultValues: ${JSON.stringify(field.defaultValues).replace(/"/g, '\"') || '[]'}
            showDefault: ${field.showDefault || 'false'}
          }
        ) {
          _id
          name
          title
          showDefault
          appointmentId
          defaultValues
          editableByAdmin
          filterable
          type
        }
      }
    `;

    return this;
  }
}
