import moment from 'moment/moment';

import { FolderOutputEvent } from '@pe/folders';

export const envMock = {
  custom: {
    cdn: 'cdn',
  },
  backend: {
    products: '',
  },
};

export const exampleProductData = {
  item: {
    images: [],
    currency: 'EUR',
    country: 'DE',
    language: 'de',
    id: 'c065db41-5fdd-40f4-8b02-a08d8a862113',
    title: 'test product',
    description: '',
    onSales: false,
    price: 400,
    salePrice: null,
    vatRate: 16,
    sku: 'fdsdsfds',
    barcode: '',
    type: 'physical',
    active: true,
    priceTable: [],
    collections: [],
    categories: [],
    channelSets: [
      {
        id: 'a8cd6098-065a-430a-8e9c-98ac919f865e',
        type: 'pos',
        name: 'New business',
      },
      {
        id: '3290cae4-abe4-41e4-9433-fce09136593e',
        type: 'shop',
        name: 'New business-ajyx',
      },
      {
        id: '1240fbd0-e693-4f0e-9471-1a4e56ad3550',
        type: 'dropshipping',
        name: null,
      },
    ],
    variants: [],
    shipping: {
      weight: 0,
      width: 0,
      length: 0,
      height: 0,
    },
    seo: {
      title: null,
      description: null,
    },
  },
  isEdit: false,
};

export const exampleFolderContent = {
  collection: [
    {
      applicationId: null,
      businessId: '44ded02d-fcb0-4686-bbd3-70d03b72f8de',
      parentFolderId: '9b5e2579-64e3-465e-8f13-97531054792b',
      scope: 'business',
      title: 'Item in folder',
      userId: null,
      apps: [],
      active: true,
      barcode: '',
      company: 'LastSeenTest',
      country: 'DE',
      createdAt: '2022-09-20T14:43:43.878Z',
      currency: 'EUR',
      imagesUrl: [],
      price: 432432,
      sku: 'sku',
      type: 'physical',
      vatRate: 16,
      videosUrl: [],
      updatedAt: '2022-09-20T15:33:01.314Z',
      isFolder: false,
      serviceEntityId: '00107ddb-a253-4970-804a-39a6c3e12a6f',
      id: '20e1a47e-77af-4580-8165-142f22c89d31',
      _id: '20e1a47e-77af-4580-8165-142f22c89d31',
    },
    {
      applicationId: null,
      businessId: '44ded02d-fcb0-4686-bbd3-70d03b72f8de',
      parentFolderId: '9b5e2579-64e3-465e-8f13-97531054792b',
      scope: 'business',
      title: 'Item created just now',
      userId: null,
      apps: [],
      active: true,
      barcode: '',
      company: 'LastSeenTest',
      country: 'DE',
      createdAt: moment(),
      currency: 'EUR',
      imagesUrl: [],
      price: 432432,
      sku: 'TestSku',
      type: 'physical',
      vatRate: 16,
      videosUrl: [],
      updatedAt: '2022-09-20T15:33:01.314Z',
      isFolder: false,
      serviceEntityId: '00107ddb-a253-4970-804a-39a6c3e12a6f',
      id: '20e1a47e-77af-4580-8165-142f22c89d31',
      _id: '20e1a47e-77af-4580-8165-142f22c89d31',
    },
  ],
  filters: {},
  pagination_data: {
    page: 1,
    total: 1,
  },
  usage: {},
};

export const exampleEvent: FolderOutputEvent = {
  data: {
    _id: '77f36ae2-6aa7-49b9-bf33-9ec038b97e85',
    name: 'test',
    isAvatar: false,
    abbrText: null,
    isHeadline: false,
    children: [],
    parentFolderId: 'dd480d78-e5dc-4622-831f-5098b7677043',
    isProtected: false,
    position: 54,
  },
};
