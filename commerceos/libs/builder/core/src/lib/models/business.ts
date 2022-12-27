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
  companyDetails?: {
    industry: string;
    product: string;
    status: string;
  };
  contactDetails?: any;
  email?: string;
  wallpaper: string;
  themeSettings?: {
    _id?: string;
    theme?: string;
  };
  currentWallpaper?: {
    _id?: string;
    theme?: string;
    auto?: boolean;
  };
  [key: string]: any;
}
