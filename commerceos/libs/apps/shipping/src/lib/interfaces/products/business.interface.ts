import { CompanyAddress } from './company.interface';

export interface Business {
  uuid: string;
  slug: string;
  id: number;
  currency: string;
  companyAddress: CompanyAddress;
}
