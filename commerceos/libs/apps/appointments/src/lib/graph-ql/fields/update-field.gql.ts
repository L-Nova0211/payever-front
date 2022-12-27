import { Injectable } from '@angular/core';
import { Mutation } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable()
export class UpdateFieldGQL extends Mutation {
  document = gql`
    mutation updateField($id: String!, $businessId: String!, $data: UpdateFieldDtoFieldDto!){
      updateField(id: $id, businessId: $businessId, data: $data) {
        _id
        name
        title
        defaultValues
        showDefault
        editableByAdmin
        filterable
        type
      }
    }
  `;

  updateFieldId(appointmentId: string) {
    this.document = gql`
      mutation updateFieldId($id: String!, $businessId: String!){
        updateField(
          id: $id
          businessId: $businessId
          data: {
            appointmentId: "${appointmentId}"
          }
        ) {
          _id
          appointmentId
          type
        }
      }
    `;
    
    return this;
  }
}
