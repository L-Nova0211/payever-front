import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebEditorExpandablePanelComponent } from './expandable-panel.component';

describe('PebEditorExpandablePanelComponent', () => {

  let fixture: ComponentFixture<PebEditorExpandablePanelComponent>;
  let component: PebEditorExpandablePanelComponent;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebEditorExpandablePanelComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorExpandablePanelComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set opened', () => {

    const nextSpy = spyOn(component.openedSubject$, 'next').and.callThrough();

    component.opened = true;

    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(component.openedSubject$.value).toBe(true);

  });

  it('should toggle', () => {

    const nextSpy = spyOn(component.openedSubject$, 'next').and.callThrough();
    const emitSpy = spyOn(component.toggleOpened, 'emit').and.callThrough();

    component.toggle();

    expect(nextSpy).toHaveBeenCalledWith(false);
    expect(component.openedSubject$.value).toBe(false);
    expect(emitSpy).toHaveBeenCalledWith(false);

  });

});
