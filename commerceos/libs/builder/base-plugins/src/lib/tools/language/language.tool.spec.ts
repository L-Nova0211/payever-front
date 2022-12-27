import { Overlay } from '@angular/cdk/overlay';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { BehaviorSubject, of } from 'rxjs';

import { PebEditorState, PebLanguage } from '@pe/builder-core';
import { PebDeselectAllAction, PebEditorStore, PebSelectAction } from '@pe/builder-shared';
import { PebDeviceService } from '@pe/common';

import { PebEditorLanguageToolDialogComponent } from './language.dialog';
import { PebEditorLanguageTool } from './language.tool';

describe('PebEditorLanguageTool', () => {

  let fixture: ComponentFixture<PebEditorLanguageTool>;
  let component: PebEditorLanguageTool;
  let state: jasmine.SpyObj<PebEditorState>;
  let store: jasmine.SpyObj<Store>;

  beforeEach(waitForAsync(() => {

    const storeSpy = jasmine.createSpyObj<Store>('Store', ['dispatch']);

    const stateMock = {
      selectedElements: ['elem-001'],
      textEditorActive$: of({ test: 'maker' }),
      language$: of(PebLanguage.English),
      language: PebLanguage.English,
    };

    TestBed.configureTestingModule({
      declarations: [PebEditorLanguageTool],
      providers: [
        { provide: PebEditorStore, useValue: {} },
        { provide: PebEditorState, useValue: stateMock },
        { provide: Overlay, useValue: {} },
        { provide: PebDeviceService, useValue: {} },
        { provide: Store, useValue: storeSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorLanguageTool);
      component = fixture.componentInstance;

      state = TestBed.inject(PebEditorState) as jasmine.SpyObj<PebEditorState>;
      store = TestBed.inject(Store) as jasmine.SpyObj<Store>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get maker active', () => {

    component.makerActive$.subscribe(active => expect(active).toBe(true));

  });

  it('should get language', () => {

    component.language$.subscribe(lang => expect(lang).toEqual(PebLanguage.English));

  });

  it('should open language', fakeAsync(() => {

    const element = document.createElement('div');
    const overlay = new BehaviorSubject(PebLanguage.German);
    const openSpy = spyOn<any>(component, 'openOverlay').and.returnValue(overlay);
    const emitSpy = spyOn(component.execCommand, 'emit');
    const detachSpy = spyOn<any>(component, 'detachOverlay');

    openSpy.and.returnValue(overlay);

    /**
     * language is set
     */
    component.openLanguage(element);

    tick();

    expect(openSpy).toHaveBeenCalledWith(PebEditorLanguageToolDialogComponent, element, {
      state,
      editorStore: {},
    });
    expect(emitSpy).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(new PebDeselectAllAction());
    expect(store.dispatch).toHaveBeenCalledWith(new PebSelectAction(['elem-001']));
    expect(detachSpy).toHaveBeenCalled();

    /**
     * language is null
     */
    overlay.next(null);

    component.openLanguage(element);

    tick();

    expect(emitSpy).toHaveBeenCalledWith({ type: 'toggleLanguagesSidebar' });

  }));

});
