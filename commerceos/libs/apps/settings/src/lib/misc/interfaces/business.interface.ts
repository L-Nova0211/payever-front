export interface BusinessInterface {
  _id: string;
  active?: boolean;
  city: string;
  country: string;
  hidden: string;
  legalForm: string;
  name: string;
  phone: string;
  street: string;
  zipCode: string;
  logo?: string;
  companyAddress?: {
    country: string;
    city: string;
  };
  contactDetails?: any;
  email?: string;
  themeSettings?: any;
  currentWallpaper?: any;
}
