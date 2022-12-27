import { OverlayModule } from '@angular/cdk/overlay';
import { ScrollingModule as CdkScrollingModule } from '@angular/cdk/scrolling';
import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { NgxsModule } from '@ngxs/store';

import {
  PebDocumentMakerElement,
  PebGridMakerElement,
  PebSectionMakerElement,
  PebShapeMakerElement,
  PebTextMakerElement,
} from '@pe/builder-elements';
import { ELEMENT_FACTORIES, PebEditorOptionsState, PebRendererModule } from '@pe/builder-renderer';
import { APP_TYPE, AppType, PePreloaderService } from '@pe/common';
import { I18nModule } from '@pe/i18n';
import { PeChatMemberService } from '@pe/shared/chat';
import { PebButtonToggleModule, PebFormFieldInputModule, PebSelectModule } from '@pe/ui';

import { PeChatComponent } from './chat.component';
import { PeChatOptions } from './chat.options';
import { PeChatAutocompleteComponent } from './components/chat-autocomplete/chat-autocomplete.component';
import {
  PeAttachMenusStylesComponent,
  PeFileUploadComponent,
  PeDropBoxComponent,
} from './components/chat-form-attach-menus';
import { PeChatFormComponent } from './components/chat-form/chat-form.component';
import { PeChatForwardMenuComponent } from './components/chat-forward-menu/chat-forward-menu.component';
import { PeChatForwardSenderComponent } from './components/chat-forward-sender/chat-forward-sender.component';
import { PeChatHeaderTagStylesComponent } from './components/chat-header-tag';
import { PeChatHeaderTagComponent } from './components/chat-header-tag/chat-header-tag.component';
import { PeChatHeaderComponent } from './components/chat-header/chat-header.component';
import {
  PeChatMessageFileComponent,
  PeChatMessageFileListComponent,
  PeChatMessageFileLoaderComponent,
  PeChatMessageMediaListComponent,
} from './components/chat-message-file';
import { ChatMessageHeaderComponent } from './components/chat-message-header/chat-message-header.component';
import { PeChatMessageMailComponent } from './components/chat-message-mail/chat-message-mail.component';
import { PeChatMessageQuoteComponent } from './components/chat-message-quote/chat-message-quote.component';
import { PeChatMessageTemplateComponent } from './components/chat-message-template/chat-message-template.component';
import { PeChatMessageTextComponent } from './components/chat-message-text/chat-message-text.component';
import { PeChatMessageComponent } from './components/chat-message/chat-message.component';
import { PeChatSelectComponent } from './components/chat-select/chat-select.component';
import { PeChatTypingDotsComponent } from './components/chat-typing-dots/chat-typing-dots.component';
import { SafePipe, PeTimeAgoPipe, PeChatInitialsPipe, PeTagTransformerPipe } from './pipes';
import { PeTruncatingPipe } from './pipes/truncating/truncating.pipe';
import { PeTypingMembersPipe } from './pipes/typing-members/typing.pipe';
import { ScrollingModule } from './scrolling/scrolling.module';

export const pebElementSelectionState = NgxsModule.forFeature([PebEditorOptionsState]);
(window as any).PayeverStatic?.IconLoader?.loadIcons([
  'messaging',
]);

const PE_CHAT_COMPONENTS = [
  PeChatAutocompleteComponent,
  PeChatComponent,
  PeChatFormComponent,
  PeChatHeaderComponent,
  PeChatTypingDotsComponent,
  PeChatMessageComponent,
  PeChatMessageFileComponent,
  PeChatMessageQuoteComponent,
  PeChatMessageTemplateComponent,
  PeChatMessageTextComponent,
  PeChatSelectComponent,
  PeChatMessageMailComponent,
  PeFileUploadComponent,
  PeAttachMenusStylesComponent,
  PeChatHeaderTagComponent,
  PeDropBoxComponent,
  PeChatHeaderTagStylesComponent,
  PeChatForwardSenderComponent,
  PeChatForwardMenuComponent,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OverlayModule,
    TextFieldModule,
    ReactiveFormsModule,
    RouterModule,
    PebButtonToggleModule,
    PebFormFieldInputModule,
    PebSelectModule,
    PebRendererModule,
    I18nModule,
    pebElementSelectionState,
    PickerModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ScrollingModule,
    CdkScrollingModule,
  ],
  declarations: [
    ...PE_CHAT_COMPONENTS,

    PeChatInitialsPipe,
    PeChatMessageFileListComponent,
    PeChatMessageFileLoaderComponent,
    PeChatMessageMediaListComponent,
    PeTruncatingPipe,
    PeTypingMembersPipe,
    SafePipe,
    PeTimeAgoPipe,
    PeTagTransformerPipe,
    ChatMessageHeaderComponent,
  ],
  exports: [...PE_CHAT_COMPONENTS],
  providers: [
    PeChatMemberService,
    PePreloaderService,
    PeTruncatingPipe,
    PeTypingMembersPipe,
    {
      provide: APP_TYPE,
      useValue: AppType.Message,
    },
    {
      provide: ELEMENT_FACTORIES,
      useValue: {
        document: PebDocumentMakerElement,
        grid: PebGridMakerElement,
        section: PebSectionMakerElement,
        shape: PebShapeMakerElement,
        text: PebTextMakerElement,
      },
    },
  ],
})
export class PeChatModule {
  static forRoot(options?: PeChatOptions): ModuleWithProviders<PeChatModule> {
    return {
      ngModule: PeChatModule,
      providers: [{ provide: PeChatOptions, useValue: options || {} }],
    };
  }

  static forChild(options?: PeChatOptions): ModuleWithProviders<PeChatModule> {
    return {
      ngModule: PeChatModule,
      providers: [{ provide: PeChatOptions, useValue: options || {} }],
    };
  }
}
