import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { ScrollingModule as CdkScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxsModule } from '@ngxs/store';

import { PebEnvService } from '@pe/builder-core';
import { PeChatModule, ScrollingModule } from '@pe/chat';
import {
  APP_TYPE,
  AppType,
  EnvironmentConfigInterface,
  PE_ENV,
  PeDestroyService,
  PePreloaderService,
  PreloaderState,
} from '@pe/common';
import { PeDataGridModule } from '@pe/data-grid';
import { PeFoldersActionsService, PeFoldersApiService, PeFoldersModule, PE_FOLDERS_API_PATH } from '@pe/folders';
import { PeGridModule, PeGridState } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
import { MediaModule, MediaUrlPipe } from '@pe/media';
import { OverlayWidgetModule, PeOverlayWidgetService, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeChatMemberService, PeChatService, PeMessageTrackerService } from '@pe/shared/chat';
import { PeSidebarModule } from '@pe/sidebar';
import {
  PebButtonModule,
  PebButtonToggleModule,
  PebContextMenuModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebLogoPickerModule,
  PebMessagesModule,
  PebProductPickerModule,
  PebSelectModule,
  PeContextMenuService,
  PePickerModule,
  PebCheckboxModule,
  PeLongPressEventDirectiveModule,
} from '@pe/ui';

import { ChatListFacade, ConversationFacade } from '../../classes';
import {
  PeMessageBubbleLiveChatComponent,
  PeCreatingChatStepsMainComponent,
  PeCreatingChatStepsTypeComponent,
  PeCreatingChatStepsContactComponent,
  PeMessageChatRoomComponent,
  PeMessageForwardFormComponent,
  PeMessageChatRoomFormComponent,
  PeMessageChatRoomListComponent,
  PeMessageChatRoomListHeaderComponent,
  PeMessageChatRoomListHeaderStylesComponent,
  PeMessageChatRoomSettingsComponent,
  PeMessageChatContextMenuComponent,
  PeMessageChatContextSeenListComponent,
  PeMessageFolderFormComponent,
  PeMessageFolderTreeComponent,
  PeMessageLoaderComponent,
  PeMessageNavComponent,
  PeMessageProductListComponent,
  PeMessageConnectRootComponent,
  PeMessageChannelRootComponent,
  PeMessageSubscriptionListComponent,
  PeMessageAddAdminsComponent,
  PeMessageInviteLinkComponent,
  PeMessageAdditionalChannelSettingsComponent,
  PeMessageEditInfoComponent,
  PeMessagePermissionsComponent,
  PeMessageMailActionsComponent,
  PeMessageOverlayComponent,
  MessageBubbleItemComponent,
  PeMessageMemberSettingsComponent,
  PeMessageGroupRootComponent,
  PeMessagePermissionsRootComponent,
  PeMessageInviteRootComponent,
  PeMessageInviteFormComponent,
  PeCreatingChatFormComponent,
  PeMessageChatPermissionsComponent,
  PePinOverlayComponent,
  PeMessageChatListComponent,
  PeMessageDeleteTemplateComponent,
  PeChatRoomListIntersectionDirective,
  PeChatRoomMessageIntersectionDirective,
  PeMessageConversationComponent,
  PeMessageConversationEmptyListComponent,
  PeMessageConversationListComponent,
  PeMessageConversationSearchComponent,
  PeMessageConversationsComponent,
  PeMessageChatContextMenuStylesComponent,
} from '../../components';
import { PeChatListSkeletonComponent } from '../../components/message-chat-room-list/skeleton/skeleton.component';
import { AdminGuard } from '../../guards/admin.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { PeMessageAuthInterceptor } from '../../interceptors';
import { PeSharedModule } from '../../modules/shared';
import {
  PeMarketingApiService,
  PeMessageApiService,
  PeMessageChatRoomListService,
  PeMessageChatRoomService,
  PeMessageConversationService,
  PeMessageNavService,
  PeMessageManagementService,
  PeMessagePinService,
  PeMessageService,
  PeMessageThemeService,
  PeMessageChatBoxService,
  PeMessageGuardService,
  PeMessageOverlayService,
  PeMessageWebSocketService,
  PeMessageAppsService,
  PeMessageLiveChatService,
  PeMessageChannelSettingsService,
  PeMessageEnvService,
  PeMessageIntegrationService,
  PeMessageInvitationApiService,
  MessageRuleService,
  MessageStateService,
  PeMessageChatContextMenuService,
  PeMessageFileUploadService,
  PeMessageVirtualService,
  ContactsDialogService,
  MessageChatDialogService,
} from '../../services';
import { MessageState } from '../../state/message.state';

import { PeMessageComponent } from './message.component';

(window as any)?.PayeverStatic?.IconLoader?.loadIcons([
  'apps',
  'settings',
  'builder',
]);

export const I18nModuleForRoot = I18nModule.forRoot();
export const ngxsForFeatureModule = NgxsModule.forFeature([MessageState, PreloaderState, PeGridState]);

@NgModule({
  imports: [
    ClipboardModule,
    CommonModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatDialogModule,
    MatTabsModule,
    MatSliderModule,
    MatIconModule,

    PeFoldersModule,
    PeGridModule,
    PeSharedModule,

    I18nModuleForRoot,
    MediaModule,
    OverlayModule,
    OverlayWidgetModule,

    PebContextMenuModule,
    PebButtonModule,
    PebExpandablePanelModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PebButtonToggleModule,
    PebLogoPickerModule,
    PeLongPressEventDirectiveModule,
    PeChatModule,
    PeDataGridModule,
    PePickerModule,
    PeSidebarModule,
    PebCheckboxModule,
    PebSelectModule,
    PePlatformHeaderModule,
    PebFormFieldTextareaModule,
    PebMessagesModule,
    PebProductPickerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ngxsForFeatureModule,
    ScrollingModule,
    CdkScrollingModule,
  ],
  declarations: [
    PeMessageConversationComponent,
    PeMessageConversationsComponent,
    PeChatRoomListIntersectionDirective,
    PeChatRoomMessageIntersectionDirective,
    PeMessageConversationEmptyListComponent,
    PeMessageConversationListComponent,
    PeMessageConversationSearchComponent,
    PeMessageComponent,
    PeMessageChatRoomComponent,
    PeMessageForwardFormComponent,
    PeMessageChatRoomFormComponent,
    PeMessageChatRoomListComponent,
    PeMessageChatRoomListHeaderComponent,
    PeMessageChatRoomListHeaderStylesComponent,
    PeMessageChatRoomSettingsComponent,
    PeMessageChatContextMenuComponent,
    PeMessageChatContextMenuStylesComponent,
    PeMessageChatContextSeenListComponent,
    PeCreatingChatFormComponent,
    PeMessageInviteFormComponent,
    PeCreatingChatStepsMainComponent,
    PeCreatingChatStepsContactComponent,
    PeCreatingChatStepsTypeComponent,
    PeMessageProductListComponent,
    PeMessageFolderFormComponent,
    PeMessageFolderTreeComponent,
    PeMessageLoaderComponent,
    PeMessageNavComponent,
    MessageBubbleItemComponent,
    PeMessageBubbleLiveChatComponent,
    PeMessageSubscriptionListComponent,
    PeMessageAddAdminsComponent,
    PeMessageInviteLinkComponent,
    PeMessageAdditionalChannelSettingsComponent,
    PeMessageMemberSettingsComponent,
    PeMessageEditInfoComponent,
    PeMessagePermissionsComponent,
    PeMessageChatPermissionsComponent,
    PeMessageConnectRootComponent,
    PeMessageChannelRootComponent,
    PeMessageGroupRootComponent,
    PeMessageInviteRootComponent,
    PeMessagePermissionsRootComponent,
    PeMessageMailActionsComponent,
    PeMessageOverlayComponent,
    PeChatListSkeletonComponent,
    PePinOverlayComponent,
    PeMessageChatListComponent,
    PeMessageDeleteTemplateComponent,
  ],
  providers: [
    PeMessageInvitationApiService,
    PeChatMemberService,
    PeMessageApiService,
    ContactsDialogService,
    MessageChatDialogService,
    MessageStateService,
    PeMessageChatRoomService,
    PeMessageChatRoomListService,
    PeMessageConversationService,
    PeMessageNavService,
    PeMessageService,
    PeMessageThemeService,
    PeMessageChatBoxService,
    PeMessageGuardService,
    PeMarketingApiService,
    PeMessageOverlayService,
    PeMessageWebSocketService,
    PeMessageFileUploadService,
    PeMessageAppsService,
    PeMessageLiveChatService,
    PeMessageChannelSettingsService,
    PeMessageManagementService,
    PeMessageVirtualService,
    PeMessagePinService,
    AdminGuard,
    RolesGuard,

    MediaUrlPipe,
    PeChatService,
    PeContextMenuService,
    PeMessageChatContextMenuService,
    PeFoldersActionsService,
    PeFoldersApiService,
    PeOverlayWidgetService,
    MessageRuleService,
    PeDestroyService,
    PePreloaderService,
    PeMessageTrackerService,
    {
      deps: [PE_ENV],
      provide: PE_FOLDERS_API_PATH,
      useFactory: (env: EnvironmentConfigInterface) => env.backend.message + '/api',
    },
    {
      provide: PebEnvService,
      useClass: PeMessageEnvService,
    },
    ChatListFacade,
    ConversationFacade,
    {
      provide: PE_OVERLAY_DATA,
      useValue: {},
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: PeMessageAuthInterceptor,
      multi: true,
    },
    {
      provide: APP_TYPE,
      useValue: AppType.Message,
    },
  ],
  exports: [
    PeMessageComponent,
  ],
})
export class PeMessageModule {
  static forFeature(appType: AppType): ModuleWithProviders<PeMessageModule> {
    return {
      ngModule: PeMessageModule,
      providers: [
        {
          provide: APP_TYPE,
          useValue: appType,
        },
      ],
    };
  }

  static forEmbed(): ModuleWithProviders<PeMessageModule> {
    return {
      ngModule: PeMessageModule,
      providers: [
        PeMessageIntegrationService,
      ],
    };
  }
}
