import { PebInteractionType } from '../utils/interactions';

import { PebIntegrationCommon } from './element';

export interface PebPaginationParams {
  offset?: number;
  limit?: number;
}

export type PebOrderDirection = 'asc'|'desc'|string;

export type PebOrderParams = Array<{ field: string, direction: PebOrderDirection }>;

export interface PebFilterParam {
  field?: string;
  fieldCondition: PebFilterConditionType|string;
  value: any;
}

export enum PebFilterConditionType {
  In = 'in',
  Contains = 'contains',
  IContains = 'icontains',
  Or = 'or',
  And = 'and',
  Is = 'is',
}

export enum PebEntityType {
  Detail = 'detail',
}

export type PebFilterParams = PebFilterParam[];

export enum PebIntegrationActionParams {
  Business = 'business',
  Shop = 'shop',
  Order = 'order',
  Filter = 'filter',
  Offset = 'offset',
  Limit = 'limit',
  Data = 'data',
  ChannelSet = 'channelSet',
  Id = 'id',
}

export enum PebIntegrationTag {
  Products = 'products',
  Media = 'media',
  Checkout = 'checkout',
  Auth = 'auth',
  BuilderShop = 'builderShop',
  Contact = 'contact',
  Shop = 'Shop',
  Site = 'Site',
  Subscription = 'billing-subscription'
}

export enum PebIntegrationActionTag {
  GetList = 'getList',
  GetCategories = 'getCategories',
  GetCategoriesByProducts = 'getCategoriesByProducts',
  GetFilters = 'getFilters',
  GetCollections = 'getCollections',
  GetPlans = 'getPlans',
  GetRecommendations = 'getRecommendations',
  List = 'list',
  Detail   = 'detail',
  Form = 'form',
}

export enum PebIntegrationDataType {
  ImageUrl = 'imageUrl',
  Text = 'text',
  Select = 'select',
  Input = 'input',
  Checkbox = 'checkbox',
  Textarea = 'textarea',
  PasswordInput = 'passwordInput',
  Submit = 'submit',
  Languages = 'languages',
}

export interface PebIntegration {
  id: string;
  title: string;
  tag: PebIntegrationTag | string;
  url: string;
  envUrl?: string;
  swaggerUrl: string;
  actions: PebIntegrationAction[];
  data: PebIntegrationData[];
  interactions: PebIntegrationInteraction[];
}

export interface PebIntegrationInteraction extends PebIntegrationCommon {
  interactionType: PebInteractionType | string;
  interactionPayload?: string;
  interactionAction: PebIntegrationInteractionAction | string;
  meta?: { [field: string]: PebIntegrationActionFieldMeta }; // for forms
}

export interface PebIntegrationData extends PebIntegrationCommon {
  contextEntity: PebEntityType | string;
  contextIntegration: string;
  createdAt?: string;
  property: string;
  subType: PebIntegrationFieldMetaSubtype | string;
  type: PebIntegrationFieldMetaType | string;
  updatedAt?: string;
  dataType: PebIntegrationDataType | string;
}

export interface PebIntegrationSelectLink extends PebIntegrationData {
  titleProp: string;
  valueProp: string;
  interactionType: PebInteractionType | string;
}

export interface PebIntegrationAction extends PebIntegrationCommon {
  tags: Array<PebIntegrationActionTag | string>;
  queryType: PebIntegrationActionQueryType | string;
  responseType: PebIntegrationActionResponseType | string;
  method: string; // gql or http method
  url: string;
  description: string;
  meta: { [field: string]: PebIntegrationActionFieldMeta }; // for gql
  requestMeta: { [field: string]: PebIntegrationActionFieldMeta }; // for rest
  responseMeta: { [field: string]: PebIntegrationActionFieldMeta }; // for rest, mb need to unite with meta
  params: Array<PebIntegrationActionParams|string>;
  actionData?: PebIntegrationActionData;
}

export interface PebIntegrationActionData {
  field: 'price' | 'type';
  title: string;
  type: 'select' | 'sort-select';
  options: { label: string, value: 'physical' | 'digital' | 'service', field: string };
}

export enum PebIntegrationInteractionAction {
  Subscribe = 'subscribe',
  Interact = 'interact',
  Form = 'form',
}

export enum PebIntegrationActionQueryType {
  Query = 'query',
  Mutation = 'mutation',
  Rest = 'rest',
}

export interface PebIntegrationActionFieldMeta {
  type: PebIntegrationFieldMetaType | string;
  subtype: PebIntegrationFieldMetaSubtype | string;
  required?: boolean;
  restricted?: boolean;
}

export enum PebIntegrationFieldMetaType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Object = 'object',
  Date = 'date',
  Time = 'time',
}

export enum PebIntegrationFieldMetaSubtype {
  Value = 'value',
  Array = 'array',
}

export enum PebIntegrationActionResponseType {
  Single = 'single',
  List = 'list',
}

export interface PebIntegrationActionListResponse<T = any> {
  result: T[];
  totalCount: number;
}

export enum PebIntegrationFilterType {
  Select = 'select',
  SortSelect = 'sort-select',
}

export interface PebIntegrationFilter {
  field: string;
  type: PebIntegrationFilterType | string;
  title: string;
  options?: Array<{ label: string, value: any, field?: string }>;
}

/**
 * Blogs
 */
export interface PebBlog {
  title: string;
  disabled: boolean;
  active: boolean;
  image: string;
}

/**
 * products
 */

export interface PebProductCollection {
  id: string;
  name: string;
  parent?: string;
  image?: string;
  ancestors?: any;
  productCount: number;
}

export interface PebProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  salePrice: string;
  currency: string;
  images: string[];
  imagesUrl: string[];
  collections: PebProductCollection[];
}

export interface PebProductCategory {
  title?: string;
  name?: string;
  id: string;
  description?: string;
  image?: string;
  products?: PebProduct[];
  parent?: {
    id: string;
    title: string;
    description: string;
  };
}
