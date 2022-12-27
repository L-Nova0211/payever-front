import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { PebEnvService } from '@pe/builder-core';
import { EnvService } from '@pe/common';
import { PeDataGridService } from '@pe/data-grid';
import { TranslationGuard } from '@pe/i18n';
import { MediaModule } from '@pe/media';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSimpleStepperModule } from '@pe/stepper';

import { PeBrowseContactsFormComponent } from './browse-contacts.component';

(window as any).PayeverStatic.IconLoader.loadIcons([
  'edit-panel',
]);

const routes: Route[] = [
  {
    path: '',
    component: PeBrowseContactsFormComponent,
    canActivate: [TranslationGuard],
    data: {
      i18nDomains: ['contacts-app', 'filters-app', 'data-grid-app'],
      isFromDashboard: true,
    },
    children: [
      {
        path: '',
        data: {
          popupMode: true,
        },
        loadChildren: () => import('@pe/apps/contacts').then(m => m.ContactsModule),
      },
    ],
  },
];
export const routerModuleForChild = RouterModule.forChild(routes);
// @dynamic
@NgModule({
  exports: [RouterModule],
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    routerModuleForChild,
    PeSimpleStepperModule,
    MediaModule,
  ],
  declarations: [PeBrowseContactsFormComponent],
  providers: [
    PeDataGridService,
  
    {
      provide: PebEnvService,
      useExisting: EnvService,
    },
  ],
})

export class PeBrowseContactsModule {}
