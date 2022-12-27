import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebThemesModule } from '@pe/themes';

import { PeBlogMaterialModule } from '../../components/material/material.module';

import { PebBlogThemeRoutingModule } from './blog-themes-routing.module';
import { PebBlogThemesComponent } from './blog-themes.component';


@NgModule({
  declarations: [
    PebBlogThemesComponent,
  ],
  imports: [
    CommonModule,
    PebThemesModule,
    PebBlogThemeRoutingModule,
    PeBlogMaterialModule,
  ],
})
export class PebBlogThemeModule { }
