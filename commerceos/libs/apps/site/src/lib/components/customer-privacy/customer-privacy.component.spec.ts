import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeSettingsCustomerPrivacyComponent } from './customer-privacy.component';

describe('PeSettingsCustomerPrivacyComponent', () => {

  let fixture: ComponentFixture<PeSettingsCustomerPrivacyComponent>;
  let component: PeSettingsCustomerPrivacyComponent;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [
        PeSettingsCustomerPrivacyComponent,
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeSettingsCustomerPrivacyComponent);
      component = fixture.componentInstance;

      fixture.detectChanges();

    });

  }));

  it('should be defined', () => {

    expect(component).toBeDefined();
    expect(component.toggleValue).toBe(false);

  });

});
