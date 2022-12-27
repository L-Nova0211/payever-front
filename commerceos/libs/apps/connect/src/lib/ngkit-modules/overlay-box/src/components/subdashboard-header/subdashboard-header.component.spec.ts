import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// import { CommonModule as NgKitCommonModule } from '../../../../common';
import { I18nModule, TranslateStubService } from '@pe/i18n';

import { ButtonModule } from '../../../../button';
import { nonRecompilableTestModuleHelper, fakeOverlayContainer, FakeOverlayContainer } from '../../../../test';

import { SubdashboardHeaderComponent } from './subdashboard-header.component';

describe('SubdashboardHeaderComponent', () => {
  let fixture: ComponentFixture<SubdashboardHeaderComponent>;
  let component: SubdashboardHeaderComponent;

  const {
   //overlayContainerElement, // TODO: test dropdown via this element
    fakeElementContainerProvider,
  }: FakeOverlayContainer = fakeOverlayContainer();

  nonRecompilableTestModuleHelper({
    imports: [
      I18nModule,
      NoopAnimationsModule,
      // NgKitCommonModule,
      MatMenuModule,
      MatExpansionModule,
      ButtonModule,
    ],
    declarations: [
      SubdashboardHeaderComponent,
    ],
    providers: [
      fakeElementContainerProvider,
      TranslateStubService.provide(),
    ],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubdashboardHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component instance', () => {
    expect(component).toBeTruthy();
  });
});
