import { Overlay } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { PebEditorState } from '@pe/builder-core';
import { PebEditorStore } from '@pe/builder-shared';
import { PebDeviceService } from '@pe/common';

import { PebEditorValidatorTool } from './validator.tool';

describe('PebEditorValidatorTool', () => {

  let fixture: ComponentFixture<PebEditorValidatorTool>;
  let component: PebEditorValidatorTool;
  let button: HTMLButtonElement;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebEditorValidatorTool],
      providers: [
        { provide: PebEditorStore, useValue: {} },
        { provide: PebEditorState, useValue: {} },
        { provide: Overlay, useValue: {} },
        { provide: PebDeviceService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(PebEditorValidatorTool, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorValidatorTool);
      component = fixture.componentInstance;
      button = fixture.debugElement.query(By.css('button')).nativeElement;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should exet command on click', () => {

    const clickEvent = new MouseEvent('click');
    const emitSpy = spyOn(component.execCommand, 'emit');

    /**
     * component.loading is TRUE
     */
    component.loading = true;
    fixture.detectChanges();

    button.dispatchEvent(clickEvent);

    expect(emitSpy).not.toHaveBeenCalled();

    /**
     * component.loading is FALSE
     */
    component.loading = false;
    fixture.detectChanges();

    button.dispatchEvent(clickEvent);

    expect(emitSpy).toHaveBeenCalledWith({ type: 'toggleThemeValidatorSidebar' });

  });

});
