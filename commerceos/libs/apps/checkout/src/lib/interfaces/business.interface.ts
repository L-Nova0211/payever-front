export interface BusinessInterface { // TODO just import from '@pe/finexp-app/finexp-editor/src/interfaces';
  _id: string;
  name: string;
  active: boolean;
  currency: string;
  themeSettings: {
    theme: string;
  };
  companyAddress: {
    country: string;
  };
}
