import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { PebEditorState, PebMotionEvent } from '@pe/builder-core';
import { PebEditorRenderer } from '@pe/builder-main-renderer';

import { PebMotionEventDetailForm } from './motion-event-detail.form';


describe('PebMotionEventDetailForm', () => {

  let fixture: ComponentFixture<PebMotionEventDetailForm>;
  let component: PebMotionEventDetailForm;

  const elemMock: any = { id: 'elem-001' };

  beforeEach(waitForAsync(() => {

    const stateMock = {
      selectedElements: [elemMock.id],
    };

    const rendererSpy = jasmine.createSpyObj<PebEditorRenderer>('PebEditorRenderer', {
      getElementComponent: elemMock,
    });

    TestBed.configureTestingModule({
      declarations: [PebMotionEventDetailForm],
      providers: [
        { provide: PebEditorState, useValue: stateMock },
        { provide: PebEditorRenderer, useValue: rendererSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebMotionEventDetailForm);
      component = fixture.componentInstance;
      component.formGroup = new FormGroup({
        test: new FormControl(),
      });

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();
    expect(component.component).toEqual(elemMock as any);

  });

  it('should handle search input enter event', () => {

    const eventMock = { preventDefault: jasmine.createSpy('preventDefault') };

    component.searchInputEnterHandler(eventMock as any);

    expect(eventMock.preventDefault).toHaveBeenCalled();

  });

  it('should select motion', () => {

    const motion = PebMotionEvent.OnClick;

    component.effectType = 'test';
    component.selectMotion(motion);
    expect(component.formGroup.value).toEqual({
      test: motion,
    });

  });

});
