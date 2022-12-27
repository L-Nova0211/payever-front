import { ContactField, ContactMainInfo } from '../interfaces';

const FIELDS: string[] = ['firstName', 'lastName', 'email', 'mobilePhone', 'imageUrl', 'country', 'company'];

export function getContactDisplayFields(contact: any): ContactMainInfo {
  const contactMainInfo: ContactMainInfo = {
    id: contact._id,
    firstName: '',
    lastName: '',
    email: '',
    mobilePhone: '',
    imageUrl: './assets/icons/contact-grid.png',
    country: '',
    company: '',
    isFolder: false,
  };

  FIELDS.forEach((name: string) => {
    const contactField = contact.fields.find((field: any) => (field.field) ? field.field.name === name : false );
    if (contactField) {
      contactMainInfo[name] = contactField.value;
    }
  });

  contactMainInfo.fullName = `${contactMainInfo.firstName} ${contactMainInfo.lastName}`;

  return contactMainInfo;
}

export function getContactFields(contact: any): { [key: string]: string } {
  const fields: { [key: string]: string } = {};
  contact.fields.forEach((field: ContactField) => {
    if(field.field) {
      fields[field.field.name] = field.value;
    }
  });

  return fields;
}

export function getGQLFilters(filters: any): string {
  return JSON.stringify(filters).replace(/"([^"]+)":/g, '$1:');
}

export function getFilterOperatorConcatenation(filter: string): 'or' | 'and' | string {
  const dict = {
    notEqualTo: 'or',
  };

  return dict[filter] || 'and';
}

export function camelToSnakeCase(input: string): string {
  return input.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export function nextSortOrder(order: string): string {
  const sortOrders = ['', 'ASC', 'DESC'];
  let index = sortOrders.findIndex(so => so === (order || ''));
  if (index === 2) {
    index = 0;
  } else {
    index += 1;
  }

  return sortOrders[index];
}

export function parseJSON(value: string): any {
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}
