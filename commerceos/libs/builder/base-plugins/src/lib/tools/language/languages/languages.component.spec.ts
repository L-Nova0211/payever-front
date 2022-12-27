import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebEditorLanguagesComponent } from './languages.component';

describe('PebEditorLanguagesComponent', () => {

  let fixture: ComponentFixture<PebEditorLanguagesComponent>;
  let component: PebEditorLanguagesComponent;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebEditorLanguagesComponent],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorLanguagesComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

});
