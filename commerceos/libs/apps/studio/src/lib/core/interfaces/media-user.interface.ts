import { MediaType } from '../enums';

export interface PeCreateUserMedia {
  url?: string;
  description?: string;
  mediaType?: MediaType;
  name?: string;
}

export interface PeUpdateUserMedia {
  id: string;
  mediaType: MediaType;
  name: string;
  url?: string;
  description?: string;
}

export interface PeCreateUserAttributeGroupBody {
  businessId: string;
  name: string;
}

export interface PeCreateUserAttributeGroupResponse {
  _id: string;
  business: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PeCreateUserAttributeBody {
  businessId: string;
  icon?: string;
  name: string;
  type: string;
  filterAble: boolean;
  onlyAdmin: boolean;
  showOn?: string;
  defaultValue?: string;
  userAttributeGroupId?: string;
}

export interface PeCreateUserAttributeResponse {
  businessId: string;
  icon: string;
  name: string;
  type: string;
  filterAble: boolean;
  onlyAdmin: boolean;
  showOn: string;
  defaultValue: string;
  userAttributeGroupId: string;
}
