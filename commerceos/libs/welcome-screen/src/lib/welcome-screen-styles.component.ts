import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'welcome-screen-styles',
  template: '',
  styles: ['.cdk-dark-backdrop + .cdk-global-overlay-wrapper {z-index: 2000;}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WelcomeOverlayScreenStylesComponent {}
