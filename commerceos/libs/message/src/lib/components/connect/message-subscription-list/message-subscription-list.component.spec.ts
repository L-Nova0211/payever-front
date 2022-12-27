import { Compiler, NO_ERRORS_SCHEMA, Pipe } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { PebEnvService } from '@pe/builder-core';
import { NavigationService, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeMessageIntegration } from '@pe/shared/chat';

import { Subject } from 'rxjs';

import { PeMessageSubscriptionListComponent } from './message-subscription-list.component';

interface SubscriptionMock {
  integration: {
    name: string;
  };
  enabled: boolean;
}

@Pipe({
  name: 'translate',
})
class TranslatePipeMock {
  transform() {}
}

describe('PeMessageSubscriptionListComponent', () => {
  let fixture: ComponentFixture<PeMessageSubscriptionListComponent>;
  let component: PeMessageSubscriptionListComponent;
  let subscriptions: SubscriptionMock[];
  let peOverlayData: {
    subscriptionList: SubscriptionMock[];
    changes: { [key: string]: boolean };
    close: jasmine.Spy;
  };

  const envService = { businessId: 'b-001' };

  beforeEach(
    waitForAsync(() => {
      subscriptions = [
        {
          enabled: false,
          integration: {
            name: 'integration.1',
          },
        },
        {
          enabled: true,
          integration: {
            name: 'integration.2',
          },
        },
      ];

      peOverlayData = {
        subscriptionList: subscriptions,
        changes: null,
        close: jasmine.createSpy('close'),
      };

      const navigationServiceSpy = jasmine.createSpyObj<NavigationService>('NavigationService', ['saveReturn']);

      const compilerSpy = jasmine.createSpyObj<Compiler>('Compiler', ['compileModuleAsync']);

      const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate'], { url: 'url/test' });

      const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['translate']);
      translateServiceSpy.translate.and.callFake((key: string) => `${key}.translated`);

      TestBed.configureTestingModule({
        declarations: [PeMessageSubscriptionListComponent, TranslatePipeMock],
        providers: [
          FormBuilder,
          { provide: NavigationService, useValue: navigationServiceSpy },
          { provide: Compiler, useValue: compilerSpy },
          { provide: Router, useValue: routerSpy },
          { provide: PeDestroyService, useValue: new Subject() },
          { provide: TranslateService, useValue: translateServiceSpy },
          { provide: PebEnvService, useValue: envService },
          { provide: PE_OVERLAY_DATA, useValue: peOverlayData },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(PeMessageSubscriptionListComponent);
          component = fixture.componentInstance;
        });
    }),
  );

  it('should be defined', () => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  it('should set form on init', () => {
    component.ngOnInit();

    expect(component.formGroup).toBeDefined();
    expect(component.formGroup.value).toEqual({
      'integration.1': false,
      'integration.2': true,
    });
    expect(peOverlayData.changes).toBeNull();

    component.formGroup.patchValue({
      'integration.2': false,
    });
    expect(peOverlayData.changes).toEqual({
      'integration.1': false,
      'integration.2': false,
    });
  });

  it('should get label', () => {
    const labels = Object.values(PeMessageIntegration);

    for (const label of labels) {
      expect(component.getLabel(label)).toEqual(`message-app.message-integration.types.${label}.translated`);
    }
  });
});
