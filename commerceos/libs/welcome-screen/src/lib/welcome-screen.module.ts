import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@pe/button';

import { WelcomeOverlayScreenStylesComponent } from './welcome-screen-styles.component';
import { WelcomeOverlayScreenComponent } from './welcome-screen.component';


@NgModule({
  imports: [CommonModule, OverlayModule, ButtonModule],
  declarations: [WelcomeOverlayScreenComponent, WelcomeOverlayScreenStylesComponent],
  entryComponents: [WelcomeOverlayScreenComponent],
})
export class WelcomeScreenModule {
}
