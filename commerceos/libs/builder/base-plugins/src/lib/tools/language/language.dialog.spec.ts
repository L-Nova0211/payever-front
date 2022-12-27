import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebLanguage } from '@pe/builder-core';

import { OVERLAY_DATA } from '../../misc/overlay.data';

import { PebEditorLanguageToolDialogComponent } from './language.dialog';

describe('PebEditorLanguageToolDialogComponent', () => {

  let fixture: ComponentFixture<PebEditorLanguageToolDialogComponent>;
  let component: PebEditorLanguageToolDialogComponent;
  let data: {
    data: any;
    emitter: { next: jasmine.Spy; };
  };

  beforeEach(waitForAsync(() => {

    data = {
      data: null,
      emitter: {
        next: jasmine.createSpy('next'),
      },
    };

    TestBed.configureTestingModule({
      declarations: [PebEditorLanguageToolDialogComponent],
      providers: [
        { provide: OVERLAY_DATA, useValue: data },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorLanguageToolDialogComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get languages', () => {

    const languages = Object.values(PebLanguage).map(language => ({
      language,
      active: !!Math.floor(Math.random() * 2),
    }));

    /**
     * data.data is null
     */
    expect(component.languages).toBeUndefined();

    /**
     * data.data is set
     * editorStore.snapshot is null
     */
    data.data = {
      state: {
        language: PebLanguage.English,
      },
      editorStore: {
        snapshot: null,
      },
    };

    fixture.destroy();
    fixture = TestBed.createComponent(PebEditorLanguageToolDialogComponent);
    component = fixture.componentInstance;

    expect(component.languages).toBeUndefined();

    /**
     * editorStore.snapshot.application is null
     */
    data.data.editorStore.snapshot = { application: null };
    expect(component.languages).toBeUndefined();

    /**
     * editorStore.snapshot.application.data is null
     */
    data.data.editorStore.snapshot.application = { data: null };
    expect(component.languages).toBeUndefined();

    /**
     * editorStore.snapshot.application.data.languages is set
     */
    data.data.editorStore.snapshot.application.data = { languages };
    expect(component.languages).toEqual(languages);

  });

  it('should set value', () => {

    const value = {
      language: PebLanguage.German,
      active: false,
    };

    // active = FALSE
    component.setValue(value);

    expect(data.emitter.next).not.toHaveBeenCalled();

    // active = TRUE
    value.active = true;

    component.setValue(value);

    expect(data.emitter.next).toHaveBeenCalledWith(value.language);

  });

  it('should open language sidebar', () => {

    component.openLanguageSidebar();

    expect(data.emitter.next).toHaveBeenCalledWith(null);

  });

});
