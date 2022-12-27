import { PeAffiliatesProgramCommissionTypesEnum, PeAffiliatesProgramAppliesToEnum } from '../enums';

export interface PeAffiliatesProgramInterface {
  _id?: string;
  affiliateBranding?: string;
  applicationScopeElasticId?: string;
  appliesTo: PeAffiliatesProgramAppliesToEnum;
  assets: number;
  categories: any[];
  commission: PeAffiliatesProgramCommissionInterface[];
  commissionType: string;
  cookie: any;
  currency: string;
  defaultCommission: number;
  inviteLink: string;
  isDefault?: boolean;
  name: string;
  products: any[];
  programApi: string;
  serviceEntityId?: string;
  startedAt: any;
  status: string;
  parentFolderId?: string;
  url: string;
}

export interface PeAffiliatesProgramCommissionInterface {
  commission: number;
  commissionType: PeAffiliatesProgramCommissionTypesEnum;
  title: string;
}
