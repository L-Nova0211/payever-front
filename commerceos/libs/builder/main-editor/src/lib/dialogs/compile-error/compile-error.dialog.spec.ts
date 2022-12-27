import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebEditorCompileErrorDialog } from './compile-error.dialog';

describe('PebEditorCompileErrorDialog', () => {

  let fixture: ComponentFixture<PebEditorCompileErrorDialog>;
  let component: PebEditorCompileErrorDialog;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebEditorCompileErrorDialog],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorCompileErrorDialog);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should reload', () => {

    expect(component.onReloadClick).toBeTruthy();

  });

});
