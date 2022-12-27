import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import 'hammerjs';
import 'hammer-timejs';

// import { WindowModule } from '../../window';
import { NavbarComponent } from './components/navbar.component';
// import { CustomElementAdapterModule } from '../../custom-component-adapter/custom-element-adapter.module';

@NgModule({
  imports: [
    CommonModule,
    // CustomElementAdapterModule,
    RouterModule,
    MatButtonModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatTooltipModule,
    MatDividerModule,
    // WindowModule
  ],
  declarations: [
    NavbarComponent,
  ],
  entryComponents: [
    NavbarComponent,
  ],
  exports: [NavbarComponent],
})
export class NavbarModule {}
