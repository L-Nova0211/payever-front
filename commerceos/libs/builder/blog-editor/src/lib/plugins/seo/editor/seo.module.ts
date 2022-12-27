import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PebEditorIconsModule, PebEditorSharedModule } from '@pe/builder-shared';

import { PebEditorBlogSeoSidebarComponent } from './seo.sidebar';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PebEditorIconsModule,
    PebEditorSharedModule,
  ],
  declarations: [
    PebEditorBlogSeoSidebarComponent,
  ],
  exports: [
    PebEditorBlogSeoSidebarComponent,
  ],
})
export class PebEditorBlogSeoPluginModule {
}
