import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebElementCoordsControl } from './element-coords/element-coords.control';
import { PebGuidelinesControl } from './guidelines/guidelines.control';
import {
  PebHoverComponent,
  PebSectionComponent,
  PebSelectionComponent,
} from './selection';
import { PeControlsComponent } from './selection/controls.component';
import { PeRadiusComponent } from './selection/radius/radius.component';
import { PebShapeCornersControl } from './shape-corners/shape-corners.control';
import { PeSvgFillComponent } from './svg-fill/svg-fill.component';

const controls = [
  PebElementCoordsControl,
  PebGuidelinesControl,
  PebHoverComponent,
  PebShapeCornersControl,
  PebSectionComponent,
  PebSelectionComponent,
  PeControlsComponent,
  PeSvgFillComponent,
  PeRadiusComponent,
];

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [...controls],
  exports: [...controls],
})
export class PebControlsModule {
}
