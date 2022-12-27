import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { BaseModule } from '@pe/base';
import { I18nModule } from '@pe/i18n';

import { LayoutComponent } from './components/layout/layout.component';
import { ActiveBusinessComponent } from './components/active-business/active-business.component';
import { CosLocalesSwitcherComponent } from './components/locales-switcher/locales-switcher.component';
import { CosLocaleListComponent } from './components/locale-list/locale-list.component';
import { PasswordMustComponent } from './components/password-must/password-must.component';
import { CountryGuard } from './guards';


const EXP = [
  ActiveBusinessComponent,
  CosLocaleListComponent,
  CosLocalesSwitcherComponent,
  LayoutComponent,
  PasswordMustComponent,
];
@NgModule({
  imports: [
    CommonModule,
    BaseModule,
    I18nModule.forChild()
  ],
  exports: [...EXP],
  declarations: [...EXP],
  providers: [
    CountryGuard,
  ],
})
export class EntrySharedModule { }
