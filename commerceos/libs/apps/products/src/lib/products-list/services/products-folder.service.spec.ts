import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PeDestroyService } from '@pe/common';
import { FolderOutputEvent } from '@pe/folders';
import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { ProductsApiService } from '../../shared/services/api.service';

import { ProductsFoldersService } from './products-folder.service';

describe('ProductsFoldersService', () => {
  let productsFoldersService: ProductsFoldersService;

  let exampleEvent: FolderOutputEvent = {
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

  let exampleFolderContent = {
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
    ],
    filters: {},
    pagination_data: {
      page: 1,
      total: 1,
    },
    usage: {},
  };

  let ProductsApiServiceSpy = jasmine.createSpyObj<ProductsApiService>('ProductsApiService', [
    'getFolderDocuments',
    'moveToRoot',
    'deleteFolder',
  ]);
  ProductsApiServiceSpy.getFolderDocuments.and.callThrough().and.returnValue(of(exampleFolderContent));
  ProductsApiServiceSpy.moveToRoot.and.callFake(() => of());
  ProductsApiServiceSpy.deleteFolder.and.callFake(() => of());

  const TranslateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['translate']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductsFoldersService,
        { provide: SnackbarService, useValue: {} },
        { provide: PeDestroyService, useValue: {} },
        { provide: ProductsApiService, useValue: ProductsApiServiceSpy },
        { provide: TranslateService, useValue: TranslateServiceSpy },
      ],
    });

    productsFoldersService = TestBed.inject(ProductsFoldersService);
  });

  it('should be defined', () => {
    expect(productsFoldersService).toBeDefined();
  });

  it('should move items to root folder when deleting folder', () => {
    productsFoldersService.onDeleteFolder(exampleEvent).subscribe();

    expect(ProductsApiServiceSpy.getFolderDocuments).toHaveBeenCalled();
    expect(ProductsApiServiceSpy.moveToRoot).toHaveBeenCalled();
    expect(ProductsApiServiceSpy.deleteFolder).toHaveBeenCalled();
  });
});
