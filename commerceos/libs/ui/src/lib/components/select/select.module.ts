import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PebSelectComponent } from './select';
import { SelectActionComponent } from './select-action';
import { SelectGroupComponent } from './select-group';
import { SelectOptionComponent } from './select-option';
import { OverlayComponent } from './select-overlay';
import { SelectVirtualOptionsComponent } from './select-virtual-option';
import { PebSelectDirective } from './select.directive';

@NgModule({
  imports: [CommonModule, PortalModule, OverlayModule, FormsModule, ScrollingModule],
  declarations: [
    PebSelectComponent,
    OverlayComponent,
    SelectActionComponent,
    SelectOptionComponent,
    PebSelectDirective,
    SelectGroupComponent,
    SelectVirtualOptionsComponent,
  ],
  exports: [
    PebSelectComponent,
    SelectOptionComponent,
    SelectActionComponent,
    PebSelectDirective,
    SelectGroupComponent,
    SelectVirtualOptionsComponent,
  ],
})
export class PebSelectModule {}
