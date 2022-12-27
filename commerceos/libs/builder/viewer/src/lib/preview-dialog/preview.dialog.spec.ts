import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { PebScreen } from '@pe/builder-core';
import * as pebRenderer from '@pe/builder-renderer';
import { of } from 'rxjs';
import { PebViewerPreviewDialog } from './preview.dialog';

describe('PebViewerPreviewDialog', () => {

  let fixture: ComponentFixture<PebViewerPreviewDialog>;
  let component: PebViewerPreviewDialog;
  let iconRegistry: jasmine.SpyObj<MatIconRegistry>;
  let domSanitizer: jasmine.SpyObj<DomSanitizer>;
  let dialogRef: any;
  let data: {
    themeSnapshot: any;
    screen: PebScreen;
  };

  beforeAll(() => {

    Object.defineProperty(pebRenderer, 'fromResizeObserver', {
      value: pebRenderer.fromResizeObserver,
      writable: true,
    });

  });


  beforeEach(waitForAsync(() => {

    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    data = {
      themeSnapshot: { test: 'theme.snapshot' },
      screen: null,
    };

    const iconRegistrySpy = jasmine.createSpyObj<MatIconRegistry>('MatIconRegistry', ['addSvgIcon']);

    const domSanitizerSpy = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', {
      bypassSecurityTrustResourceUrl: 'bypassed',
    });

    TestBed.configureTestingModule({
      declarations: [PebViewerPreviewDialog],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatIconRegistry, useValue: iconRegistrySpy },
        { provide: DomSanitizer, useValue: domSanitizerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebViewerPreviewDialog);
      component = fixture.componentInstance;

      iconRegistry = TestBed.inject(MatIconRegistry) as jasmine.SpyObj<MatIconRegistry>;
      domSanitizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;
      dialogRef = TestBed.inject(MatDialogRef);

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set props and add svg icon on construct', () => {

    expect(component.themeSnapshot).toEqual(data.themeSnapshot);
    component.frameScreenType$.subscribe(screen => expect(screen).toEqual(PebScreen.Desktop)).unsubscribe();
    component.activeScreen$.subscribe(screen => expect(screen).toEqual(PebScreen.Desktop)).unsubscribe();
    expect(iconRegistry.addSvgIcon).toHaveBeenCalledWith('preview-back', 'bypassed');
    expect(domSanitizer.bypassSecurityTrustResourceUrl)
      .toHaveBeenCalledWith('assets/icons/general/preview-back.svg');

  });

  it('should set device frame transform as observable on construct', () => {

    const fromResizeSpy = spyOn(pebRenderer, 'fromResizeObserver');
    const frameWrapper = new ElementRef(document.createElement('div'));
    let result: string;

    /**
     * component.frameScreenType$.value is PebScreen.Tablet
     * fromResizeObserver returns mocked data with prop width as 600
     */
    fromResizeSpy.and.returnValue(of({
      width: 600,
      height: 300,
    }));

    component[`frameWrapper`] = frameWrapper;
    component.frameScreenType$.next(PebScreen.Tablet);
    component.deviceFrameTransform$.subscribe(res => result = res);
    component.viewInit$.next();

    expect(result).toBe(undefined);
    expect(fromResizeSpy).toHaveBeenCalledWith(frameWrapper.nativeElement);

    /**
     * component.frameScreenType$.value is PebScreen.Desktop
     */
    component.frameScreenType$.next(PebScreen.Desktop);
    component.viewInit$.next();

    expect(result).toEqual('scale(0.5)');

    /**
     * fromResizeObserver returns mocked data with prop width as 1600
     */
    fromResizeSpy.and.returnValue(of({
      width: 1600,
      height: 300,
    }));

    component.viewInit$.next();

    expect(result).toEqual('scale(1)');

  });

  it('should set device frame height as observable on construct', () => {

    const fromResizeSpy = spyOn(pebRenderer, 'fromResizeObserver');
    const frameWrapper = new ElementRef(document.createElement('div'));
    let result: string;

    /**
     * component.frameScreenType$.value is PebScreen.Tablet
     * fromResizeObserver returns mocked data with prop width as 600
     */
    fromResizeSpy.and.returnValue(of({
      width: 600,
      height: 300,
    }));

    component[`frameWrapper`] = frameWrapper;
    component.frameScreenType$.next(PebScreen.Tablet);
    component.deviceFrameHeight$.subscribe(res => result = res);
    component.viewInit$.next();

    expect(result).toBe(undefined);
    expect(fromResizeSpy).toHaveBeenCalledWith(frameWrapper.nativeElement);

    /**
     * component.frameScreenType$.value is PebScreen.Desktop
     */
    component.frameScreenType$.next(PebScreen.Desktop);
    component.viewInit$.next();

    expect(result).toEqual('calc(100% / 0.5)');

    /**
     * fromResizeObserver returns mocked data with prop width as 1600
     */
    fromResizeSpy.and.returnValue(of({
      width: 1600,
      height: 300,
    }));

    component.viewInit$.next();

    expect(result).toEqual('100%');

  });

  it('should handle ng after view init', () => {

    const nextSpy = spyOn(component.viewInit$, 'next');

    component.ngAfterViewInit();

    expect(nextSpy).toHaveBeenCalled();

  });

  it('should close dialog', () => {

    component.close();

    expect(dialogRef.close).toHaveBeenCalled();

  });

  it('should change screen type', () => {

    const nextSpy = spyOn(component.frameScreenType$, 'next');

    component.changeScreenType(PebScreen.Mobile);

    expect(nextSpy).toHaveBeenCalledWith(PebScreen.Mobile);

  });

});
