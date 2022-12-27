export interface UserAccountInterface {
  _id: string;
  firstName: string;
  lastName: string;
  language: string;
  email: string;
  hasUnfinishedBusinessRegistration: boolean;

  salutation?: string;
  phone?: string;
  birthday?: string;
  createdAt?: string;
  logo?: string;
}
