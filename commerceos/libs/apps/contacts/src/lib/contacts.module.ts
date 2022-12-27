import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NgxsModule } from '@ngxs/store';
import { ClipboardModule } from 'ngx-clipboard';

import { AuthInterceptor } from '@pe/auth';
import { PebEnvService } from '@pe/builder-core';
import { ContactsState, EnvService, PePreloaderService, PE_ENV, PreloaderState } from '@pe/common';
import {
  PE_FOLDERS_API_PATH,
  PeFolderEditorModule,
  PeFoldersActionsService,
  PeFoldersApiService,
  PeFoldersModule,
} from '@pe/folders';
import { FormComponentsColorPickerModule, FormCoreModule, FormModule, ThirdPartyFormModule } from '@pe/forms';
import { PeGridModule, PeGridState } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
import { PeMediaService } from '@pe/media';
import { OverlayWidgetModule, PeOverlayWidgetService } from '@pe/overlay-widget';
import { ContactsAppState } from '@pe/shared/contacts';
import { PeSidebarModule } from '@pe/sidebar';
import {
  PebButtonToggleModule,
  PebCountryPickerModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebMessagesModule,
  PebSelectModule,
  CustomFieldModule,
} from '@pe/ui';
import { PeWidgetsModule } from '@pe/widgets';

import {
  ContactComponent,
  ContactsWidgetComponent,
  GroupModalComponent,
  PeItemMoreComponent,
  ContactStatusComponent,
} from './components';
import { ContactsRoutingModule } from './contacts-routing.module';
import { GoogleAutocompleteDirective } from './directives/google-autocomplete.directive';
import { GraphQLModule } from './graphql/graphql.module';
import { ContactsMediaUrlPipe } from './pipes/media-url.pipe';
import { ContactsResolver } from './resolver/contacts.resolver';
import {
  PeContactsLayoutComponent,
  PeContactsListComponent,
} from './routes';
import {
  ContactsGQLService,
  ContactsListService,
  ContactsRuleService,
  ContactsStoreService,
  FieldsGQLService,
  StatusGQLService,
  GoogleAutocompleteService,
  ImportApiService,
  UploaderService,
} from './services';
import { PE_CONTACTS_API_PATH } from './tokens';

export const NgxsFeatureModule = NgxsModule.forFeature([PreloaderState]);
@NgModule({
  declarations: [
    ContactComponent,
    ContactsWidgetComponent,
    GroupModalComponent,
    PeContactsLayoutComponent,
    PeContactsListComponent,
    PeItemMoreComponent,
    ContactStatusComponent,
    GoogleAutocompleteDirective,

    ContactsMediaUrlPipe,
  ],
  exports: [PeContactsListComponent, ContactStatusComponent],
  imports: [
    FormComponentsColorPickerModule, FormCoreModule, FormModule, ThirdPartyFormModule,
    ClipboardModule,
    CommonModule,
    ContactsRoutingModule,
    FormsModule,
    I18nModule.forChild(),
    MatMenuModule,
    MatIconModule,
    NgxsModule.forFeature([PeGridState]),
    NgxsFeatureModule,
    ReactiveFormsModule,

    OverlayWidgetModule,
    PebButtonToggleModule,
    PebCountryPickerModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PebFormFieldTextareaModule,
    PebExpandablePanelModule,
    PebMessagesModule,
    PebSelectModule,
    PeGridModule,
    PeFolderEditorModule,
    PeFoldersModule,
    PeSidebarModule,
    PeWidgetsModule,
    CustomFieldModule,

    GraphQLModule,
    NgxsModule.forFeature([ContactsState, ContactsAppState]),
  ],
  providers: [
    ContactsGQLService,
    ContactsListService,
    ContactsRuleService,
    ContactsStoreService,
    FieldsGQLService,
    StatusGQLService,
    GoogleAutocompleteService,
    ImportApiService,
    UploaderService,
    ContactsResolver,
    PeFoldersActionsService,
    PeFoldersApiService,
    PeMediaService,
    PeOverlayWidgetService,
    PePreloaderService,
    {
      provide: PebEnvService,
      useExisting: EnvService,
    },
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useClass: AuthInterceptor,
    },
    {
      deps: [PE_ENV],
      provide: PE_CONTACTS_API_PATH,
      useFactory: env => env.backend.contacts,
    },
    {
      provide: PE_FOLDERS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.contacts + '/api',
    },
  ],
})
export class ContactsModule { }
