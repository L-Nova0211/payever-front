export interface BusinessDetailsInterface {
  companyAddress: {
    country: string,
    createdAt: string,
    updatedAt: string,
    _id: string
  };
  companyDetails: {
    businessStatus: string,
    createdAt: string,
    employeesRange: string,
    foundationYear: string,
    industry: string,
    phone: string,
    product: string,
    salesRange: any,
    status: string,
    updatedAt: string,
    _id: string
  };
  contactDetails: {
    createdAt: string,
    firstName: string,
    lastName: string,
    updateAt: string,
    _id: string
  };
  createdAt: string;
  updatedAt: string;
  _id: string;
}
