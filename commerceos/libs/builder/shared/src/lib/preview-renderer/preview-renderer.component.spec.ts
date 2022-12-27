import {
  ComponentFixture,
  fakeAsync,
  flushMicrotasks,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { of, Subject } from 'rxjs';

import { PebEditorApi } from '@pe/builder-api';
import * as pebCore from '@pe/builder-core';
import { PebScreen, pebScreenDocumentWidthList, PebShopContainer } from '@pe/builder-core';

import * as domToImage from './dom-to-image';
import { PagePreviewService } from './page-preview.service';
import { PebPreviewRendererComponent } from './preview-renderer.component';

describe('PebPreviewRendererComponent', () => {

  let fixture: ComponentFixture<PebPreviewRendererComponent>;
  let component: PebPreviewRendererComponent;
  let api: jasmine.SpyObj<PebEditorApi>;
  let previewService: {
    page$: Subject<any>;
    previewSavedSubject$: { next: jasmine.Spy; },
  };

  beforeAll(() => {

    Object.defineProperty(pebCore, 'pebGenerateId', {
      value: pebCore.pebGenerateId,
      writable: true,
    });

    Object.defineProperty(domToImage, 'toBlob', {
      value: domToImage.toBlob,
      writable: true,
    });

  });

  beforeEach(waitForAsync(() => {

    const apiSpy = jasmine.createSpyObj<PebEditorApi>('PebEditorApi', {
      uploadImage: of(null),
    });

    previewService = {
      page$: new Subject(),
      previewSavedSubject$: { next: jasmine.createSpy('next') },
    };

    TestBed.configureTestingModule({
      declarations: [PebPreviewRendererComponent],
      providers: [
        { provide: PebEditorApi, useValue: apiSpy },
        { provide: PagePreviewService, useValue: previewService },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebPreviewRendererComponent);
      component = fixture.componentInstance;
      component.width = 500;
      component.height = 350;
      component.contentPadding = 15;

      api = TestBed.inject(PebEditorApi) as jasmine.SpyObj<PebEditorApi>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get css width', () => {

    expect(component.cssWidth).toEqual(500 / devicePixelRatio);

  });

  it('should get css height', () => {

    expect(component.height).toEqual(350 / devicePixelRatio);

  });

  it('should get padding', () => {

    expect(component.padding).toEqual(`0 ${15 / devicePixelRatio}px`);

  });

  it('should set pageData$ on construct', fakeAsync(() => {

    const dataMock = {
      stylesheet: {
        'elem-001': null,
        'elem-002': {
          backgroundImage: 'http://localhost/url/test',
          color: '#333333',
        },
        'elem-003': {
          backgroundImage: null,
          color: '#222222',
        },
        'elem-004': {
          backgroundImage: 'http://localhost/url/test-2-thumbnail',
          color: '#111111',
        },
        'elem-005': {
          backgroundImage: 'url/test-3-thumbnail',
        },
      },
      screen: PebScreen.Desktop,
    };
    const hostElem = fixture.debugElement.nativeElement;
    const blobMock = new Blob(['test']);
    const toBlobSpy = spyOn(domToImage, 'toBlob').and.resolveTo(blobMock);
    const fileSpy = spyOn(window, 'File').and.callThrough();
    const generateIdSpy = spyOn(pebCore, 'pebGenerateId').and.returnValue('gid-001');
    const result = { next: jasmine.createSpy('next') };

    component.pageData$.subscribe(data => expect(data).toEqual({
      ...dataMock,
      stylesheet: {
        ...dataMock.stylesheet,
        'elem-001': {},
        'elem-002': {
          ...dataMock.stylesheet['elem-002'],
          backgroundImage: 'http://localhost/url/test-thumbnail',
        },
      },
      scale: (500 - 15 * 2) / pebScreenDocumentWidthList[dataMock.screen] / devicePixelRatio,
    } as any));

    previewService.page$.next({ result, data: dataMock });

    /**
     * emit rendered
     */
    component.rendered();

    flushMicrotasks();

    expect(toBlobSpy).toHaveBeenCalledWith(hostElem, {
      width: 500 / devicePixelRatio,
      height: 350 / devicePixelRatio,
      cacheBust: true,
      skipFonts: true,
    });
    let args = api.uploadImage.calls.argsFor(0);
    expect(args[0]).toEqual(PebShopContainer.Images);
    expect(args[1].name).toEqual('builder-page-preview-gid-001.png');
    expect(fileSpy).toHaveBeenCalledWith([blobMock], 'builder-page-preview-gid-001.png');
    expect(generateIdSpy).toHaveBeenCalled();
    expect(result.next).toHaveBeenCalledWith(null);
    expect(previewService.previewSavedSubject$.next).toHaveBeenCalled();

  }));

});
