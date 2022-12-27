import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { BaseDashboardModule } from '@pe/base-dashboard';

import { ZendeskGuard } from './zendesk.guard';

@NgModule({
  imports: [CommonModule, BaseDashboardModule],
  exports: [BaseDashboardModule],
  providers: [ZendeskGuard],
})
export class ZendeskModule {}
