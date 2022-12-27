import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CommonModule } from '@pe/ng-kit/modules/common';
import { I18nModule } from '@pe/ng-kit/modules/i18n';
import { NavbarModule } from '@pe/ng-kit/modules/navbar';
import { nonRecompilableTestModuleHelper } from '@pe/ng-kit/modules/test';

import { SharedDashboardModule } from '../../../dashboard/shared-dashboard/shared-dashboard.module';
import { SharedModule } from '../../../shared/shared.module';
import { MicroContainerRoutingModule } from '../../micro-container-routing.module';
import { PricingOverlayComponent } from '../pricing-overlay/pricing-overlay.component';
import { SelectPlanBarComponent } from '../select-plan-bar/select-plan-bar.component';

import { MicroContainerComponent } from './micro-container.component';




describe('MicroContainerComponent', () => {
  let component: MicroContainerComponent;
  let fixture: ComponentFixture<MicroContainerComponent>;

  nonRecompilableTestModuleHelper({
    declarations: [
      MicroContainerComponent,
      SelectPlanBarComponent,
      PricingOverlayComponent,
    ],
    imports: [
      CommonModule,
      I18nModule.forChild(),
      MicroContainerRoutingModule,
      NavbarModule,
      SharedDashboardModule,
      SharedModule,
      MatProgressSpinnerModule,
    ],
  });

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MicroContainerComponent);
    component = fixture.componentInstance;
  }));

  describe('Constructor', () => {
    it('Should create component instance', () => {
      expect(component).toBeTruthy('fail with initialize component');
    });
  });
});
