// import { ProductsService } from './products.service';
// import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
// import { RootStateService } from 'src/app/root/root.state';
// import { of } from 'rxjs';
// import { TestBed } from '@angular/core/testing';
// import { PLATFORM_ID } from '@angular/core';
// import { Router } from 'express';

// fdescribe('ProductsService', () => {

//   let service: ProductsService;
//   let http: HttpTestingController;
//   let env: any;
//   let shop: any;
//   let rootState: jasmine.SpyObj<RootStateService>;

//   beforeEach(() => {

//     const envMock = {
//       backend: {
//         products: 'be-products',
//       },
//       custom: {
//         storage: 'c-storage',
//       },
//     };

//     const shopMock = {
//       business: {
//         id: 'b-001',
//       },
//     };

//     const rootStateSpy = jasmine.createSpyObj<RootStateService>('RootStateService', [
//       'patchCategoryData',
//       'updateProductState',
//     ]);
//     rootStateSpy[`state$` as any] = of({
//       '@category': {},
//     });

//     TestBed.configureTestingModule({
//       imports: [
//         HttpClientTestingModule,
//       ],
//       providers: [
//         ProductsService,
//         { provide: 'ENVIRONMENT', useValue: envMock },
//         { provide: 'APP', useValue: shopMock },
//         { provide: 'THEME', useValue: {} },
//         { provide: PLATFORM_ID, useValue: 'browser' },
//         { provide: RootStateService, useValue: rootStateSpy },
//         { provide: Router, useValue: {} },
//       ],
//     });

//     service = TestBed.inject(ProductsService);
//     http = TestBed.inject(HttpTestingController);
//     env = TestBed.inject('ENVIRONMENT' as any);
//     shop = TestBed.inject('APP' as any);
//     rootState = TestBed.inject(RootStateService) as jasmine.SpyObj<RootStateService>;

//   });

//   it('should be defined', () => {

//     expect(service).toBeDefined();

//   });

// });
