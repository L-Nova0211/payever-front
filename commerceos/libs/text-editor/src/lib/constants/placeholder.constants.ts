import { TextEditorPlaceholderItem } from '../interfaces/placeholder';

export const PLACEHOLDER_DATA: TextEditorPlaceholderItem[] = [
  {
    name: 'Contacts',
    value: 'contacts',
    children: [
      {
        name: 'First Name',
        value: 'contacts.first-name',
      },
      {
        name: 'Last Name',
        value: 'contacts.last-name',
      },
      {
        name: 'Email',
        value: 'contacts.email',
      },
      {
        name: 'Phone',
        value: 'contacts.phone',
      },
    ],
  },
  {
    name: 'Employees',
    value: 'employees',
    children: [
      {
        name: 'First Name',
        value: 'employees.first-name',
      },
      {
        name: 'Last Name',
        value: 'employees.last-name',
      },
      {
        name: 'Email',
        value: 'employees.email',
      },
      {
        name: 'Phone',
        value: 'employees.phone',
      },
    ],
  },
  {
    name: 'Registration',
    value: 'registration',
    children: [
      {
        name: 'Industry',
        value: 'registration.industry-name',
      },
    ],
  },
  {
    name: 'Business',
    value: 'business',
    children: [
      {
        name: 'Name',
        value: 'business.name',
      },
      {
        name: 'Phone',
        value: 'business.phone',
      },
      {
        name: 'Email',
        value: 'business.email',
      },
    ],
  },
  {
    name: 'Application',
    value: 'application',
    children: [
      {
        name: 'Name',
        value: 'application.name',
      },
    ],
  },
];
