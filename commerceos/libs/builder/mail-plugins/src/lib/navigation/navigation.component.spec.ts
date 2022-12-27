import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';

import { PebEditorState, PebScreen } from '@pe/builder-core';
import { PebEditorStore } from '@pe/builder-shared';

import { PebEditorMailNavigationComponent } from './navigation.component';

describe('PebEditorMailNavigationComponent', () => {

  let fixture: ComponentFixture<PebEditorMailNavigationComponent>;
  let component: PebEditorMailNavigationComponent;

  beforeEach(waitForAsync(() => {

    const stateMock = {
      screen$: of(PebScreen.Desktop),
    };

    TestBed.configureTestingModule({
      declarations: [PebEditorMailNavigationComponent],
      providers: [
        { provide: PebEditorState, useValue: stateMock },
        { provide: PebEditorStore, useValue: {} },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorMailNavigationComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get screen', () => {

    component.screen$.subscribe((screen) => {
      expect(screen).toEqual(PebScreen.Desktop);
    });

  });

});
