import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebScreen } from '@pe/builder-core';

import { OVERLAY_DATA } from '../../misc/overlay.data';

import { PebEditorScreenToolDialogComponent } from './screen.dialog';

describe('PebEditorScreenToolDialogComponent', () => {

  let fixture: ComponentFixture<PebEditorScreenToolDialogComponent>;
  let component: PebEditorScreenToolDialogComponent;
  let data: {
    data: {
      screen: PebScreen;
    };
    emitter: {
      next: jasmine.Spy;
    };
  };

  beforeEach(waitForAsync(() => {

    data = {
      data: {
        screen: PebScreen.Desktop,
      },
      emitter: {
        next: jasmine.createSpy('next'),
      },
    };

    TestBed.configureTestingModule({
      declarations: [PebEditorScreenToolDialogComponent],
      providers: [
        { provide: OVERLAY_DATA, useValue: data },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorScreenToolDialogComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set screen', () => {

    component.setScreen(PebScreen.Mobile);

    expect(data.emitter.next).toHaveBeenCalledWith({ screen: PebScreen.Mobile });

  });

  it('should set default screen', () => {

    component.setDefaultScreen(PebScreen.Tablet);

    expect(data.emitter.next).toHaveBeenCalledWith({ defaultScreen: PebScreen.Tablet });

  });

  it('should emit overlay data on close click', () => {

    component.close();

    expect(data.emitter.next).toHaveBeenCalled();

  });

});
