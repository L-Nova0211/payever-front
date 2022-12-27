import { CommonModule, registerLocaleData } from '@angular/common';
import localeDE from '@angular/common/locales/en-DE';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import { I18nModule } from '@pe/i18n';
import { MediaModule } from '@pe/media';
import { TranslateLoaderModule } from '@pe/translate-loader';

import {
  ButtonComponent,
  ColumnComponent,
  GridComponent,
  IconsComponent,
  ImageTableComponent,
  StartComponent,
  TableComponent,
  TextComponent,
  WidgetComponent,
  AvatarsComponent,
  CouponCodeComponent,
  SocialTableComponent,
  AppointmentTableComponent,
} from './components';
import { ContactsTableComponent } from './components/contacts-table/contacts-table.component';
import { SharedModule } from './shared/shared.module';

const DECLARATIONS = [
  ButtonComponent,
  ColumnComponent,
  GridComponent,
  IconsComponent,
  ImageTableComponent,
  AvatarsComponent,
  StartComponent,
  TableComponent,
  TextComponent,
  WidgetComponent,
  CouponCodeComponent,
  SocialTableComponent,
  AppointmentTableComponent,
  ContactsTableComponent,
];

registerLocaleData(localeDE, 'en-DE');
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    I18nModule,
    RouterModule,
    MatProgressSpinnerModule,
    MediaModule,
    TranslateLoaderModule,
  ],
  exports: [
    WidgetComponent,
    SharedModule,
  ],
  declarations: [
    ...DECLARATIONS,
  ],
  providers: [],
})
export class PeWidgetsModule {}
