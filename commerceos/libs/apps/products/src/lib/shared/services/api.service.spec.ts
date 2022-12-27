import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';

import { EnvService, PE_ENV } from '@pe/common';

import { ProductsOrderBy } from '../../products-list/enums/order-by.enum';
import { Direction } from '../enums/direction.enum';
import { ChannelTypes } from '../enums/product.enum';

import { ApolloBaseName, ProductsApiService } from './api.service';

describe('ProductsApiService', () => {
  let apiService: ProductsApiService;

  const peEnvMock = {
    backend: {
      products: 'products',
    },
  };

  const envServiceMock = {
    businessId: 'businessId',
  };

  let apolloController: ApolloTestingController;

  let filterConfiguration = {
    title: [
      {
        condition: 'contains',
        value: ['Product title'],
      },
      {
        condition: 'doesNotContain',
        value: ['Product title'],
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ApolloTestingModule.withClients([ApolloBaseName.products, ApolloBaseName.contacts]),
      ],
      providers: [
        ProductsApiService,
        HttpClient,
        { provide: EnvService, useValue: envServiceMock },
        { provide: PE_ENV, useValue: peEnvMock },
      ],
    });
    apiService = TestBed.inject(ProductsApiService);
    apolloController = TestBed.inject(ApolloTestingController);
  });

  afterEach(() => {
    apolloController.verify();
  });

  it('should be defined', () => {
    expect(apiService).toBeDefined();
  });

  it('should sort product on title but folders on name', () => {
    let searchData = {
      page: 1,
      perPage: 48,
      direction: Direction.ASC,
      orderBy: ProductsOrderBy.TitleRAW,
      configuration: null,
    };

    let result = apiService['getSearchParams'](searchData);

    expect(result['updates'][0]).toEqual({
      param: 'sort[0][field]',
      value: ProductsOrderBy.TitleRAW,
      op: 's',
    });

    expect(result['updates'][1]).toEqual({
      param: 'sort[0][direction]',
      value: Direction.ASC,
      op: 's',
    });

    expect(result['updates'][6]).toEqual({
      param: 'sort[1][field]',
      value: 'name',
      op: 's',
    });

    expect(result['updates'][7]).toEqual({
      param: 'sort[1][direction]',
      value: Direction.ASC,
      op: 's',
    });
  });

  it('should create and update products', () => {
    let mockProduct = {
      id: 'cb304503-77ab-4955-887e-1af3e18929db',
      images: [],
      title: 'dsfds',
      company: 'LastSeenTest',
      country: 'DE',
      language: 'de',
      description: '',
      price: 323,
      priceTable: [],
      onSales: false,
      salePrice: 32,
      saleEndDate: '2022-09-30',
      saleStartDate: null,
      vatRate: 16,
      collections: [],
      sku: '432',
      inventory: 0,
      lowInventory: 0,
      emailLowStock: false,
      inventoryTrackingEnabled: false,
      barcode: '',
      categories: [],
      type: 'physical',
      channelSets: [
        {
          id: '565331a9-4a86-46e7-b016-07f37cd15290',
          type: ChannelTypes.Pos,
          name: 'LastSeenTest',
        },
        {
          id: '34ab48fb-f40a-43d2-81f5-81bfec3892e0',
          type: ChannelTypes.Shop,
          name: 'LastSeenTest',
        },
        {
          id: 'c6f5fe47-308a-4766-b62d-e09d9fcf4be3',
          type: ChannelTypes.Dropshipping,
          name: null,
        },
      ],
      active: true,
      attributes: [],
      shipping: {
        weight: '0',
        width: '0',
        length: '0',
        height: '0',
      },
      seo: {
        title: '',
        description: '',
      },
    };

    apiService.createProduct(mockProduct as any, 'business').subscribe();
    apolloController.expectOne('updateProduct');
  });

  it('should search products on title', () => {
    let searchData = {
      page: 1,
      perPage: 48,
      direction: Direction.ASC,
      orderBy: ProductsOrderBy.TitleRAW,
      configuration: filterConfiguration,
    };

    let result = apiService['getSearchParams'](searchData);

    expect(result['updates'][6]).toEqual({
      param: 'filters[title][0][condition]',
      value: 'contains',
      op: 's',
    });

    expect(result['updates'][7]).toEqual({
      param: 'filters[title][0][value][0]',
      value: 'Product title',
      op: 's',
    });

    expect(result['updates'][8]).toEqual({
      param: 'filters[title][1][condition]',
      value: 'doesNotContain',
      op: 's',
    });

    expect(result['updates'][9]).toEqual({
      param: 'filters[title][1][value][0]',
      value: 'Product title',
      op: 's',
    });
  });
});
