import { Overlay } from '@angular/cdk/overlay';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';

import { PebEditorState, PebScreen } from '@pe/builder-core';
import { PebEditorStore } from '@pe/builder-shared';
import { PebDeviceService } from '@pe/common';

import { PebEditorScreenTool } from './screen.tool';

describe('PebEditorScreenTool', () => {

  let fixture: ComponentFixture<PebEditorScreenTool>;
  let component: PebEditorScreenTool;
  let state: jasmine.SpyObj<PebEditorState>;

  beforeEach(waitForAsync(() => {

    const stateMock = {
      screen$: of(PebScreen.Desktop),
      screen: PebScreen.Desktop,
      defaultScreen: PebScreen.Desktop,
    };

    TestBed.configureTestingModule({
      declarations: [PebEditorScreenTool],
      providers: [
        { provide: PebEditorStore, useValue: {} },
        { provide: PebEditorState, useValue: stateMock },
        { provide: Overlay, useValue: {} },
        { provide: PebDeviceService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorScreenTool);
      component = fixture.componentInstance;

      state = TestBed.inject(PebEditorState) as jasmine.SpyObj<PebEditorState>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get screen', () => {

    component.screen$.subscribe(screen => expect(screen).toEqual(PebScreen.Desktop));

  });

  it('should open screen', () => {

    const element = document.createElement('div');
    const value = {
      defaultScreen: null,
      screen: null,
    };
    const openSpy = spyOn<any>(component, 'openOverlay').and.returnValue(of(value));
    const detachSpy = spyOn<any>(component, 'detachOverlay');

    /**
     * value.screen & defaultScreen are null
     */
    component.openScreen(element);

    expect(openSpy).toHaveBeenCalled();
    expect(detachSpy).toHaveBeenCalledTimes(1);

    /**
     * value.screen is PebScreen.Tablet
     * value.defaultScreen is PebScreen.Mobile
     */
    value.screen = PebScreen.Tablet;
    value.defaultScreen = PebScreen.Mobile;

    component.openScreen(element);

    expect(detachSpy).toHaveBeenCalledTimes(2);

  });

});
