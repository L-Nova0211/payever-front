import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, Injector } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ClipboardModule } from 'ngx-clipboard';


// TODO Return back
// import { PaymentsModule } from '@pe/connect-sdk/sdk/payments';

import { AppSwitcherModule } from '@pe/app-switcher';
import { SharedModule } from '@pe/apps/connect';
import { AuthModule } from '@pe/auth';
import {
  CheckoutMicroService,
  MicroModule,
  ECMAScriptSupportService,
  CheckoutSharedService,
} from '@pe/common';
import { ConfirmationScreenModule } from '@pe/confirmation-screen';
import { PeDataGridModule, PeDataGridSidebarService } from '@pe/data-grid';
import { PeFiltersModule } from '@pe/filters';
import {
  FinexpApiAbstractService,
  FinexpStorageAbstractService,
  FinexpHeaderAbstractService,
  CheckoutModalModule,
} from '@pe/finexp-app';
import { PeFoldersModule } from '@pe/folders';
import {
  FormComponentsColorPickerModule,
  FormComponentsInputModule,
  FormModule,
  SnackBarModule,
  ThirdPartyFormModule,
} from '@pe/forms';
// import { CheckoutWrapperElementsModule } from '@pe/checkout-wrapper-main';
import { PeGridModule } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
import { MediaModule } from '@pe/media';
import { OverlayWidgetModule, PeOverlayWidgetService, PE_OVERLAY_COMPONENT, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { SnackbarModule } from '@pe/snackbar';
import { PeSimpleStepperModule } from '@pe/stepper';
import { PebColorPickerFormModule, PebFormFieldInputModule, PebLogoPickerModule, PebSelectModule } from '@pe/ui';

import { CheckoutRoutingModule } from './checkout-routing.module';
import {
  CallbacksComponent,
  CheckoutFullModalComponent,
  ColorAndStyleComponent,
  ConfirmationModalComponent,
  ConnectAppEditComponent,
  CreateCheckoutComponent,
  CspComponent,
  LanguageComponent,
  PoliciesComponent,
  NotificationsComponent,
  SectionsModalComponent,
  TestingModeComponent,
  CheckoutWrapperDirectLinkComponent,
  WelcomeDetailsComponent,
  WelcomePaymentsComponent,
  CheckoutLayoutComponent,
  EditSettingsComponent,
  LayoutComponent,
  QRIntegrationComponent,
  CheckoutClipboardCopyComponent,
  RootCheckoutWrapperComponent,
  ThirdPartyComponent,
  SwitcherComponent,
  CreateCheckoutFormComponent,
  PanelCheckoutComponent,
  PanelPaymentOptionsComponent,
  PanelChannelsComponent,
  PanelConnectComponent,
  PanelSectionsComponent,
  PanelSettingsComponent,
  StoreAppComponent,
  PosAppComponent,
  QRAppComponent,
  MarketingAppComponent,
  CronIntervalSettingsComponent,
} from './components';
import {
  OldCreateCheckoutFormComponent,
} from './components/deprecated/create-checkout-form/create-checkout-form.component';
import {
  HeaderStylesComponent,
  ButtonStylesComponent,
  ButtonSecondaryStylesComponent,
  PageStylesComponent,
  InputStyleComponent,
  LogoStylesComponent,
  ScreenTypeStyleComponent,
  StyleItemComponent,
  StyleColorPickerComponent,
  StyleInputPxComponent,
  StyleCornerSelectComponent,
  StyleAlignmentComponent,
  StyleFormSchemeComponent,
  StyleModalComponent,
  StyleModalItemComponent,
  ColorAndStyleStylesComponent,
} from './components/settings/color-and-style/components';
import {
  ExpansionConnMenuListComponent,
  ExpansionMenuListComponent,
  MenuListComponent,
} from './containers';
import { PlatformHeaderLoaderGuard } from './guards';
import {
  CheckoutResolver,
  CurrentCheckoutResolver,
  CurrentCheckoutModalResolver,
  ChannelWidgetDataResolver,
  LoadingResolver,
  ResetCacheResolver,
} from './resolvers';
import { FirstCheckoutGuard, PhoneNumbersResolver } from './services';
import {
  ApiService,
  EnvService,
  StorageService,
  HeaderService,
  RootCheckoutWrapperService,
  UploaderService,
} from './services';
import { NavbarModule, ButtonModule, OverlayBoxModule } from './shared';


(window as any).PayeverStatic?.IconLoader?.loadIcons([
  'apps',
  'banners',
  'builder',
  'dashboard',
  'edit-panel',
  'finance-express',
  'checkout',
  'notification',
  'payment-methods', // For welcome stepper payments
  'payment-plugins', // Same
  'settings',
  'set',
]);
(window as any).PayeverStatic?.SvgIconsLoader?.loadIcons([
  // TODO Load on integration open
  'channel-whatsapp',
  'channel-instagram',
  'channel-fb-messenger',
  'channel-fb',
]);

// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const I18nModuleForChild = I18nModule.forChild();
export const MediaModuleForRoot = MediaModule.forRoot();

export function StorageServiceFactory(injector: Injector): any {
  if (!window['pe_Checkout_StorageService']) {
    window['pe_Checkout_StorageService'] = new StorageService(injector);
  }

  return window['pe_Checkout_StorageService'];
}

const modals = [
  CallbacksComponent,
  CspComponent,
  EditSettingsComponent,
  ColorAndStyleComponent,
  LanguageComponent,
  PoliciesComponent,
  NotificationsComponent,
  CreateCheckoutFormComponent,
  CronIntervalSettingsComponent,
];

@NgModule({
  imports: [
    AuthModule,
    CommonModule,
    RouterModule,
    CheckoutRoutingModule,
    ClipboardModule,
    // PaymentsModule,  //TODO Return back
    PeSimpleStepperModule,
    FormModule,
    I18nModuleForChild,
    PePlatformHeaderModule,
    MediaModuleForRoot,
    MatButtonModule,
    MatCardModule,
    DragDropModule,
    MatCheckboxModule,
    MatDividerModule,
    MatExpansionModule,
    MatListModule,
    MatMenuModule,
    OverlayModule,
    PortalModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatTooltipModule,
    MicroModule,
    ThirdPartyFormModule,
    // CheckoutWrapperElementsModule,
    AppSwitcherModule,
    SnackBarModule,
    ReactiveFormsModule,
    MatSelectModule,
    FormComponentsColorPickerModule,
    FormComponentsInputModule,

    PeGridModule,
    PeFoldersModule,
    PeFiltersModule,
    PebSelectModule,
    PebFormFieldInputModule,
    ButtonModule,
    NavbarModule,
    OverlayBoxModule,
    SharedModule,
    PeDataGridModule,
    CheckoutModalModule,
    PebLogoPickerModule,
    ConfirmationScreenModule,
    SnackbarModule,

    OverlayWidgetModule,
    PebColorPickerFormModule,
  ],
  declarations: [
    CheckoutWrapperDirectLinkComponent,
    WelcomeDetailsComponent,
    WelcomePaymentsComponent,
    CheckoutLayoutComponent,
    LayoutComponent,
    QRIntegrationComponent,
    CheckoutClipboardCopyComponent,
    RootCheckoutWrapperComponent,
    CheckoutFullModalComponent,
    CallbacksComponent,
    ColorAndStyleComponent,
    ScreenTypeStyleComponent,
    StyleItemComponent,
    StyleColorPickerComponent,
    StyleInputPxComponent,
    StyleCornerSelectComponent,
    StyleAlignmentComponent,
    StyleFormSchemeComponent,
    StyleModalComponent,
    StyleModalItemComponent,
    ColorAndStyleStylesComponent,
    HeaderStylesComponent,
    ButtonStylesComponent,
    ButtonSecondaryStylesComponent,
    PageStylesComponent,
    InputStyleComponent,
    LogoStylesComponent,
    ConfirmationModalComponent,
    ConnectAppEditComponent,
    CreateCheckoutComponent,
    CreateCheckoutFormComponent,
    OldCreateCheckoutFormComponent,
    EditSettingsComponent,
    ExpansionMenuListComponent,
    ExpansionConnMenuListComponent,
    MenuListComponent,
    SwitcherComponent,
    CspComponent,
    LanguageComponent,
    PoliciesComponent,
    NotificationsComponent,
    SectionsModalComponent,
    TestingModeComponent,
    ThirdPartyComponent,
    ExpansionMenuListComponent,
    ExpansionConnMenuListComponent,
    MenuListComponent,

    StoreAppComponent,
    PosAppComponent,
    QRAppComponent,
    MarketingAppComponent,

    PanelCheckoutComponent,
    PanelPaymentOptionsComponent,
    PanelChannelsComponent,
    PanelConnectComponent,
    PanelSectionsComponent,
    PanelSettingsComponent,
    CronIntervalSettingsComponent,
  ],
  providers: [
    FirstCheckoutGuard,
    PhoneNumbersResolver,
    CheckoutResolver,

    ApiService,
    EnvService,
    StorageService,
    HeaderService,
    RootCheckoutWrapperService,
    UploaderService,
    PeDataGridSidebarService,

    CurrentCheckoutResolver,
    ChannelWidgetDataResolver,
    CurrentCheckoutModalResolver,
    LoadingResolver,
    ResetCacheResolver,
    PlatformHeaderLoaderGuard,
    PeOverlayWidgetService,
    {
      provide: FinexpApiAbstractService,
      useClass: ApiService,
    },
    {
      provide: FinexpStorageAbstractService,
      useFactory: StorageServiceFactory,
      deps: [Injector],
    },
    {
      provide: StorageService,
      useFactory: StorageServiceFactory,
      deps: [Injector],
    },
    {
      provide: FinexpHeaderAbstractService,
      useClass: HeaderService,
    },
    {
      provide: PE_OVERLAY_DATA,
      useValue: {},
    },
    {
      provide: PE_OVERLAY_COMPONENT,
      useClass: CreateCheckoutComponent,
    },
    ECMAScriptSupportService,
    CheckoutMicroService,
    CheckoutSharedService,
  ],
  entryComponents: [
    ...modals,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // For 'pe-checkout-wrapper-by-channel-set-id'
})
export class CheckoutModule {
}
