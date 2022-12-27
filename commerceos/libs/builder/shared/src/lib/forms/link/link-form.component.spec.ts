// import { NO_ERRORS_SCHEMA } from '@angular/core';
// import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
// import { PebInteractionType, PebPageType, PebPageVariant } from '@pe/builder-core';
// import { BehaviorSubject, of, Subject } from 'rxjs';
// import { count, take } from 'rxjs/operators';
// import { PebEditorStore } from '../../../services';
// import { PebLinkForm } from './link-form.component';
// import { PebLinkFormService } from './link-form.service';

// describe('PebLinkForm', () => {

//   let fixture: ComponentFixture<PebLinkForm>;
//   let component: PebLinkForm;
//   let linkFormService: {
//     textStyle$: Subject<any>,
//     setTextStyles: jasmine.Spy,
//   };
//   let snapshotSubject: Subject<any>;

//   beforeEach(waitForAsync(() => {

//     snapshotSubject = new Subject();
//     const editorStoreMock = {
//       snapshot$: snapshotSubject,
//     };

//     linkFormService = {
//       textStyle$: new Subject(),
//       setTextStyles: jasmine.createSpy('setTextStyles'),
//     };

//     TestBed.configureTestingModule({
//       declarations: [PebLinkForm],
//       providers: [
//         { provide: PebEditorStore, useValue: editorStoreMock },
//         { provide: PebLinkFormService, useValue: linkFormService },
//       ],
//       schemas: [NO_ERRORS_SCHEMA],
//     }).compileComponents().then(() => {

//       fixture = TestBed.createComponent(PebLinkForm);
//       component = fixture.componentInstance;

//     });

//   }));

//   it('should be defined', () => {

//     fixture.detectChanges();

//     expect(component).toBeDefined();

//   });

//   it('should set routes$ on construct', () => {

//     const snapshotMock = {
//       application: {
//         routing: [
//           {
//             pageId: 'p-001',
//             url: 'pages/p-001',
//             routeId: 'r-001',
//           },
//           {
//             pageId: 'p-002',
//             url: 'pages/p-002',
//             routeId: 'r-002',
//           },
//           {
//             pageId: 'p-003',
//             url: 'pages/p-003',
//             routeId: 'r-003',
//           },
//         ],
//       },
//       pages: [
//         {
//           id: 'p-001',
//           name: 'Page 1',
//           type: PebPageType.Master,
//           variant: PebPageVariant.Default,
//         },
//         {
//           id: 'p-002',
//           name: 'Page 2',
//           type: PebPageType.Replica,
//           variant: PebPageVariant.Default,
//         },
//       ],
//     };

//     component.routes$.subscribe(routes => expect(routes).toEqual({
//       [PebInteractionType.NavigateInternal]: [{
//         name: 'pages/p-002',
//         value: 'r-002',
//       }],
//       [PebInteractionType.OverlayOpenPage]: [
//         { value: 'r-001', name: 'Page 1' },
//         { value: 'r-002', name: 'Page 2' },
//       ],
//     }));
//     snapshotSubject.next(snapshotMock);

//   });

//   it('should set links$ on construct', () => {

//     const snapshotMock = {
//       application: {
//         routing: [
//           {
//             pageId: 'p-001',
//             url: 'pages/p-001',
//             routeId: 'r-001',
//           },
//           {
//             pageId: 'p-002',
//             url: 'pages/p-002',
//             routeId: 'r-002',
//           },
//           {
//             pageId: 'p-003',
//             url: 'pages/p-003',
//             routeId: 'r-003',
//           },
//         ],
//       },
//       pages: [
//         {
//           id: 'p-001',
//           name: 'Page 1',
//           type: PebPageType.Master,
//           variant: PebPageVariant.Default,
//         },
//         {
//           id: 'p-002',
//           name: 'Page 2',
//           type: PebPageType.Replica,
//           variant: PebPageVariant.Default,
//         },
//       ],
//     };

//     component.links$.subscribe(links => expect(links).toEqual([
//       { value: 'r-001', name: 'Page 1' },
//       { value: 'r-002', name: 'Page 2' },
//     ]));

//     component.typeControl.patchValue(PebInteractionType.OverlayOpenPage);
//     snapshotSubject.next(snapshotMock);

//   });

//   it('should set customLink$ on construct', () => {

//     component.customLink$.pipe(
//       take(2),
//       count((value, index) => {
//         if (index === 0) {
//           expect(value).toBe(false);
//         } else {
//           expect(value).toBe(true);
//         }
//         return true;
//       }),
//     ).subscribe();

//     /**
//      * type is PebInteractionType.OverlayOpenPage
//      */
//     component.typeControl.patchValue(PebInteractionType.OverlayOpenPage);

//     /**
//      * type is PebInteractionType.NavigateExternal
//      */
//     component.typeControl.patchValue(PebInteractionType.NavigateExternal);

//   });

//   it('should handle ng init', () => {

//     const payloadControlSpies = {
//       pristine: spyOn(component.linkForm.get('payload'), 'markAsPristine').and.callThrough(),
//       untouched: spyOn(component.linkForm.get('payload'), 'markAsUntouched').and.callThrough(),
//     };
//     const linkFormSpies = {
//       touched: spyOn(component.linkForm, 'markAsTouched').and.callThrough(),
//       pristine: spyOn(component.linkForm, 'markAsPristine').and.callThrough(),
//       untouched: spyOn(component.linkForm, 'markAsUntouched').and.callThrough(),
//     };
//     const textStyleSubject = new BehaviorSubject(null);

//     linkFormService.setTextStyles.and.returnValue(of(null));
//     linkFormService.textStyle$ = textStyleSubject;

//     component[`ngZone` as any] = {
//       onStable: of(true),
//     };
//     component.ngOnInit();

//     expect(component.linkForm.value).toEqual({
//       type: 'none',
//       payload: null,
//     });
//     expect(linkFormSpies.touched).not.toHaveBeenCalled();
//     expect(linkFormSpies.pristine).toHaveBeenCalledTimes(1);
//     expect(linkFormSpies.untouched).toHaveBeenCalledTimes(1);
//     expect(linkFormService.setTextStyles).not.toHaveBeenCalled();
//     Object.values(payloadControlSpies).forEach(spy => expect(spy).toHaveBeenCalled());

//     /**
//      * change component.typeControl to PebInteractionType.OverlayClose
//      */
//     component.linkForm.get('payload').markAsPristine();
//     component.linkForm.get('payload').markAsUntouched();
//     Object.values(payloadControlSpies).forEach(spy => spy.calls.reset());

//     component.typeControl.patchValue(PebInteractionType.OverlayClose);

//     Object.values(payloadControlSpies).forEach(spy => expect(spy).not.toHaveBeenCalled());
//     expect(component.linkForm.get('payload').dirty).toBe(true);
//     expect(component.linkForm.get('payload').touched).toBe(true);
//     expect(linkFormService.setTextStyles).not.toHaveBeenCalled();
//     expect(linkFormSpies.touched).toHaveBeenCalledTimes(1);
//     expect(linkFormSpies.pristine).toHaveBeenCalledTimes(1);
//     expect(linkFormSpies.untouched).toHaveBeenCalledTimes(1);

//     /**
//      * change component.typeControl to 'none'
//      * component.typeControl is dirty
//      * component.linkForm is touched
//      */
//     Object.values(payloadControlSpies).forEach(spy => spy.calls.reset());

//     component.typeControl.markAsDirty();
//     component.typeControl.patchValue('none');

//     Object.values(payloadControlSpies).forEach(spy => expect(spy).toHaveBeenCalled());
//     expect(component.linkForm.get('payload').value).toEqual('');
//     expect(linkFormSpies.touched).toHaveBeenCalledTimes(2);
//     expect(linkFormSpies.pristine).toHaveBeenCalledTimes(2);
//     expect(linkFormSpies.untouched).toHaveBeenCalledTimes(2);
//     expect(linkFormService.setTextStyles).toHaveBeenCalledOnceWith({ link: null }, true);

//     /**
//      * change component.payloadControl
//      * component.payloadControl is dirty
//      */
//     Object.values(payloadControlSpies).forEach(spy => spy.calls.reset());
//     linkFormService.setTextStyles.calls.reset();

//     component.typeControl.patchValue(PebInteractionType.NavigateExternal, { emitEvent: false });
//     component.linkForm.get('payload').markAsDirty();
//     component.linkForm.get('payload').patchValue({ url: 'url/external' });

//     Object.values(payloadControlSpies).forEach(spy => expect(spy).toHaveBeenCalled());
//     expect(component.linkForm.get('payload').value).toEqual({ url: 'url/external' });
//     expect(linkFormSpies.touched).toHaveBeenCalledTimes(3);
//     expect(linkFormSpies.pristine).toHaveBeenCalledTimes(3);
//     expect(linkFormSpies.untouched).toHaveBeenCalledTimes(3);
//     expect(linkFormService.setTextStyles).toHaveBeenCalledOnceWith({
//       link: {
//         type: PebInteractionType.NavigateExternal,
//         payload: { url: 'url/external' },
//       },
//     }, true);

//     /**
//      * emit linkFormService.textStyle$ value as object
//      */
//     linkFormSpies.untouched.calls.reset();
//     linkFormService.setTextStyles.calls.reset();
//     textStyleSubject.next({
//       type: PebInteractionType.NavigateInternal,
//       payload: null,
//     });
//     component.linkForm.get('payload').markAsDirty();
//     component.linkForm.get('payload').patchValue({ url: 'url/internal' });

//     expect(linkFormService.setTextStyles).toHaveBeenCalledOnceWith({
//       link: {
//         type: PebInteractionType.NavigateInternal,
//         payload: { url: 'url/internal' },
//       },
//     }, true);

//     /**
//      * emit linkFormService.textStyle$ value as array
//      */
//     linkFormService.setTextStyles.calls.reset();
//     textStyleSubject.next([{
//       type: PebInteractionType.NavigateInternal,
//       payload: null,
//     }]);
//     component.linkForm.get('payload').markAsDirty();
//     component.linkForm.get('payload').patchValue({ url: null });

//     expect(linkFormService.setTextStyles).toHaveBeenCalledOnceWith({
//       link: {
//         type: null,
//         payload: { url: null },
//       },
//     }, true);

//   });

// });
