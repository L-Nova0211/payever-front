// import { TestBed, waitForAsync } from '@angular/core/testing';
// import { of } from 'rxjs';
// import { switchMap, take, tap } from 'rxjs/operators';
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// import { getNextParentElement, PebAbstractEditor, PebEditorRenderer } from '@pe/builder-editor';
// import {
//   PebEditorState,
//   PebElementType,
//   PebLanguage,
//   PebPageType,
//   PebPageVariant,
//   PebScreen,
//   PebTemplate,
// } from '@pe/builder-core';
// import { PebRenderer, PebRendererModule, PebRendererSharedModule } from '@pe/builder-renderer';
// import { TranslationLoaderService } from '@pe/i18n';
// import { PE_ENV } from '@pe/common';
// import { PebDocumentElement, PebSectionElement, PebShapeElement } from '@pe/builder-base-plugins';

// describe('Shop Utils', () => {

//   it('should get section for selected element as next parent', waitForAsync(async () => {
//     const template: PebTemplate = {
//       id: 'templateId-001',
//       type: PebElementType.Document,
//       children: [
//         {
//           id: 'sectionId-001',
//           type: PebElementType.Section,
//           children: [
//             {
//               id: 'shapeId-001',
//               type: PebElementType.Shape,
//               children: [
//                 {
//                   id: 'shapeId-002',
//                   type: PebElementType.Shape,
//                   children: [],
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//     };
//     const stylesheet = {
//       'templateId-001': {},
//       'sectionId-001': {},
//       'shapeId-001': {},
//       'shapeId-002': {},
//     };
//     const context = {};
//     const translationLoaderServiceSpy = jasmine.createSpyObj<TranslationLoaderService>(
//       'TranslationLoaderService',
//       { loadTranslations: of(true) },
//     );

//     await TestBed.configureTestingModule({
//       declarations: [PebRenderer],
//       imports: [
//         PebRendererModule.forRoot({
//           elements: {
//             lazy: {},
//             preloaded: {
//               shape: PebShapeElement,
//               section: PebSectionElement,
//               document: PebDocumentElement,
//             },
//           },
//         }),
//         PebRendererSharedModule,
//         HttpClientTestingModule,
//         NoopAnimationsModule,
//       ],
//       providers: [
//         { provide: PE_ENV, useValue: {} },
//         { provide: TranslationLoaderService, useValue: translationLoaderServiceSpy },
//       ],
//     }).compileComponents();

//     const rendererFixture = TestBed.createComponent(PebRenderer);
//     const renderer = rendererFixture.componentInstance;
//     renderer.options = {
//       scale: 1,
//       screen: PebScreen.Desktop,
//       interactions: true,
//       locale: PebLanguage.English,
//     };
//     renderer.element = template;
//     renderer.stylesheet = stylesheet;
//     renderer.context = context;
//     renderer.rendered.pipe(
//       take(1),
//       switchMap(() => {
//         const editorRenderer = new PebEditorRenderer(renderer, null);

//         const state = jasmine.createSpyObj<PebEditorState>('PebEditorState', [], {
//           selectedElements: ['shapeId-002'],
//         });
//         const editor = jasmine.createSpyObj<PebAbstractEditor>('PebAbstractEditor', [], {
//           activePageSnapshot$: of({
//             template,
//             stylesheet,
//             id: 'pageId-001',
//             name: 'Page1',
//             variant: PebPageVariant.Default,
//             type: PebPageType.Replica,
//             data: {},
//             context: {},
//           }),
//         });

//         return getNextParentElement(state, editorRenderer, editor).pipe(
//           tap(nextParent => expect(nextParent.definition.id).toEqual('sectionId-001')),
//         );
//       }),
//       tap({ error: fail }),
//     ).subscribe();
//     rendererFixture.changeDetectorRef.detectChanges();
//   }));

// });
