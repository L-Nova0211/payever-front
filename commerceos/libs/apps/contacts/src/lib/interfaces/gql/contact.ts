import { AddContactField, ContactCustomField, Field, StatusField } from './custom-field';
import { FieldGroup } from './group';

export interface Contact {
  id: string;
  _id: string;
  businessId: string;
  imageUrl?: string;
  channelSetId?: any;

  email: string;
  type: string;
  firstName: string;
  lastName: string;
  mobilePhone: string;
  homepage?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;

  status?: StatusField;

  customFields?: ContactCustomField[];
  fieldGroups?: FieldGroup[];
}

export interface AddContact {
  type: string;
  status: string;
  fields: AddContactField[];
}

export interface ContactsData {
  data: {
    allContacts: {
      nodes: Contact[];
    };
  };
}

export interface ContactField {
  field?: Field;
  fieldId: string;
  id: string;
  value: string;
  contactId?: string;
}

export interface ContactResponse {
  id: string;
  _id?: string;
  businessId: string;
  type: string;
  contactFields: {
    nodes: ContactField[]
  };
}

export interface ContactOffset {
  nodes: ContactResponse[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
  };
}
