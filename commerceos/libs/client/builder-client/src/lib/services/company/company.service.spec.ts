// import { TestBed } from '@angular/core/testing';
//
// import { PebElementContextState } from '@pe/builder-core';
//
// import { CompanyService } from './company.service';
//
// import { RootStateService } from 'src/app/root/root.state';
//
// describe('CompanyService', () => {
//
//   let service: CompanyService;
//   let rootState: jasmine.SpyObj<RootStateService>;
//
//   beforeEach(() => {
//
//     const rootStateSpy = jasmine.createSpyObj<RootStateService>('RootStateService', ['patch']);
//
//     TestBed.configureTestingModule({
//       providers: [
//         CompanyService,
//         { provide: 'APP', useValue: null },
//         { provide: RootStateService, useValue: rootStateSpy },
//       ],
//     });
//
//     service = TestBed.inject(CompanyService);
//     rootState = TestBed.inject(RootStateService) as jasmine.SpyObj<RootStateService>;
//
//   });
//
//   it('should be defined', () => {
//
//     expect(service).toBeDefined();
//
//   });
//
//   it('should get logo', () => {
//
//     // w/o shop
//     service.getLogo().subscribe(result => expect(result).toEqual({
//       state: 'ready',
//       data: {
//         src: undefined,
//         name: undefined,
//       },
//     }));
//
//     // w/ shop
//     service[`shop`] = {
//       picture: 'pic.jpg',
//       name: 'Shop',
//     };
//
//     service.getLogo().subscribe(result => expect(result).toEqual({
//       state: 'ready',
//       data: {
//         src: 'pic.jpg',
//         name: 'Shop',
//       },
//     }));
//
//   });
//
//   it('should toggle mobile menu', () => {
//
//     // w/o mobile menu
//     rootState[`state` as any] = {
//       '@mobile-menu': undefined
//     };
//
//     service.toggleMobileMenu();
//
//     expect(rootState.patch).toHaveBeenCalledWith({
//       '@mobile-menu': {
//         state: PebElementContextState.Ready,
//         data: {
//           opened: true,
//         },
//       },
//     });
//
//     // w/o currentState.data
//     rootState[`state` as any] = {
//       '@mobile-menu': { data: undefined },
//     };
//
//     service.toggleMobileMenu();
//
//     expect(rootState.patch).toHaveBeenCalledWith({
//       '@mobile-menu': {
//         state: PebElementContextState.Ready,
//         data: {
//           opened: true,
//         },
//       },
//     });
//
//     // w/ data
//     rootState[`state` as any] = {
//       '@mobile-menu': { data: { opened: true } },
//     };
//
//     service.toggleMobileMenu();
//
//     expect(rootState.patch).toHaveBeenCalledWith({
//       '@mobile-menu': {
//         state: PebElementContextState.Ready,
//         data: {
//           opened: false,
//         },
//       },
//     });
//
//   });
//
//   it('should hide mobile menu', () => {
//
//     service.hideMobileMenu();
//
//     expect(rootState.patch).toHaveBeenCalledWith({
//       '@mobile-menu': {
//         state: PebElementContextState.Ready,
//         data: {
//           opened: false,
//         },
//       },
//     });
//
//   });
//
// });
