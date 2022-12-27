export interface SearchDataInterface {
  page: number,
  perPage: number,
  title?: string,
  firstName?: string,
  lastName?: string,
}

export interface RootFolderItemsInterface {
  collection: RootFolderContactItemInterface[],
  filters: Object,
  pagination_data: SearchDataPaginationInterface,
  usage: Object,
}

export interface SearchDataPaginationInterface {
  page: number,
  perPage: number,
}

export interface SearchFolderContactOptions {
  all?: number,
  orderBy?: string,
  direction?: string,
  page?: number,
  limit?: number,
  query?: string,
  queryFields?: string[],
  filters?: Object,
  sort?: string[],
  currency?: string
}

export interface RootFolderContactItemInterface {
  businessId: string,
  isFolder: boolean,
  isHeadline: boolean,
  isProtected: boolean
  name: string,
  imageUrl: string,
  mobilePhone: string,
  homepage: string,
  street: string,
  city: string,
  country: string,
  parentFolderId: string,
  position: number,
  createdBy: string,
  firstName: string,
  lastName: string,
  email: string,
  _id: string,
  id:string,
  serviceEntityId?: string,
  mongoId?: string,
  metaUserId?: string,
}

export interface Contact {
  businessId: string,
  parentFolderId: string,
  scope: string,
  title: string,
  userId: string,
  fullName: string,
  type: string,
  createdAt: string,
  updatedAt: string,
  firstName: string,
  lastName: string,
  email: string,
  isFolder: boolean,
  imageUrl:string,
  serviceEntityId: string,
  id: string,
  metaUserId?: string,
  _id: string
}


