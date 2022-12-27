import { NO_ERRORS_SCHEMA, Pipe } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Store } from '@ngxs/store';
import { APP_TYPE, AppType, PeDestroyService, PePreloaderService } from '@pe/common';
import { FolderService, PeFoldersActionsService } from '@pe/folders';
import { PeGridService, PeGridSidenavService } from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { PePlatformHeaderService } from '@pe/platform-header';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { PeMessageSidenavsEnum } from '../../enums';
import {
  MessageRuleService,
  PeMessageApiService,
  PeMessageChatRoomListService,
  PeMessageConversationService,
  PeMessageIntegrationService,
  PeMessageNavService,
  PeMessageService,
} from '../../services';
import { PeMessageNavComponent } from './message-nav.component';

@Pipe({
  name: 'translate',
})

class TranslatePipeMock {
  transform() {
  }
}

describe('PeMessageNavComponent', () => {
  let fixture: ComponentFixture<PeMessageNavComponent>;
  let component: PeMessageNavComponent;

  beforeEach(waitForAsync(() => {

    const storeSpy = jasmine.createSpyObj<Store>('Store', {
      dispatch: null, select: of([]),
    });

    const peFoldersActionsServiceMock = {
      folderChange$: new Subject(),
      lastSelectedFolderId: null,
      folderAction: jasmine.createSpy('folderAction'),
      onUpdatePositions: jasmine.createSpy('onUpdatePositions'),
    };

    const peFolderServiceSpy = jasmine.createSpyObj<FolderService>('FolderService',
      ['getFolderFromTreeById', 'createFolder', 'createHeadline'], {
        deleteNode$: { next: jasmine.createSpy('next') } as any,
      });

    const peGridSidenavServiceMock = {
      toggleOpenStatus$: new BehaviorSubject(true), sidenavOpenStatus: {
        [PeMessageSidenavsEnum.ConversationList]: new BehaviorSubject(true),
      }, toggleViewSidebar: jasmine.createSpy('toggleViewSidebar'),
    };

    const platformHeaderSpy = jasmine.createSpyObj<PePlatformHeaderService>('PePlatformHeaderService',
      ['toggleSidenavActive', 'removeSidenav', 'assignSidenavItem', 'assignConfig']);

    const pePreloaderServiceSpy = jasmine.createSpyObj<PePreloaderService>('PePreloaderService',
      ['startLoading', 'initFinishObservers']);

    const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService',
      ['translate']);
    translateServiceSpy.translate.and.callFake((key: string) => `${key}.translated`);

    const messageRuleServiceSpy = jasmine.createSpyObj<MessageRuleService>('MessageRuleService',
      ['initRuleListener', 'openRules']);

    const peMessageApiService = jasmine.createSpyObj<PeMessageApiService>('PeMessageApiService',
      { getFolderTree: of([]), getRootFolder: of({ _id: 'rf-001' } as any) });

    const peMessageChatRoomListServiceSpy = jasmine.createSpyObj<PeMessageChatRoomListService>
    ('PeMessageChatRoomListService', {
      getConversationList: of([]),
    });

    const peMessageConversationServiceSpy = jasmine.createSpyObj<PeMessageConversationService>
    ('PeMessageConversationService', {
      conversationToGridItemMapper: [],
    }, {
      isLoading$: new BehaviorSubject(false),
      checkForInvitation$: new BehaviorSubject(false),
      activeConversation$: new BehaviorSubject(null),
    });

    const peMessageIntegrationServiceMock = {
      currSettings$: of({ _id: 'theme-001' }),
    };

    const peMessageNavServiceMock = {
      defaultFolderIcon: 'url/folder', activeFolder: null, setFolderTree: null,
      destroy: jasmine.createSpy('destroy'),
    };

    const peMessageServiceMock = {
      isLiveChat: false, isEmbedChat: false, app: 'test-app',
    };

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      declarations: [PeMessageNavComponent, TranslatePipeMock],
      providers: [
        PeMessageNavService,
        { provide: Store, useValue: storeSpy },
        { provide: APP_TYPE, useValue: AppType.Message },
        { provide: PeFoldersActionsService, useValue: peFoldersActionsServiceMock },
        { provide: FolderService, useValue: peFolderServiceSpy },
        { provide: PeGridService, useValue: { theme: null } },
        { provide: PeGridSidenavService, useValue: peGridSidenavServiceMock },
        { provide: PePlatformHeaderService, useValue: platformHeaderSpy },
        { provide: PePreloaderService, useValue: pePreloaderServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: PeDestroyService, useValue: new Subject() },
        { provide: MessageRuleService, useValue: messageRuleServiceSpy },
        { provide: PeMessageApiService, useValue: peMessageApiService },
        { provide: PeMessageChatRoomListService, useValue: peMessageChatRoomListServiceSpy },
        { provide: PeMessageConversationService, useValue: peMessageConversationServiceSpy },
        { provide: PeMessageIntegrationService, useValue: peMessageIntegrationServiceMock },
        { provide: PeMessageNavService, useValue: peMessageNavServiceMock },
        { provide: PeMessageService, useValue: peMessageServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(PeMessageNavComponent, {
        set: { providers: [] },
      })
      .compileComponents().then(() => {
      fixture = TestBed.createComponent(PeMessageNavComponent);
      component = fixture.componentInstance;
    });
  }));

  it('PeMessageNavComponent should be defined', () => {
    fixture.detectChanges();
    expect(component).toBeDefined();
  });

  it('should return folders list including folders under headline element', () => {
    fixture.detectChanges();

    let folders = [{
      '_id': '9a89552f-e024-4fa1-aef3-a3e2babdd744',
      'children': [{
        '_id': '001d2465-070c-4f04-8800-f00caf4d1a52',
        'children': [],
        'isFolder': true,
        'isHeadline': false,
        'isProtected': false,
        'name': 'Subfolder',
        'parentFolderId': '9a89552f-e024-4fa1-aef3-a3e2babdd744',
        'position': 1,
        'scope': 'business',
      }],
      'isFolder': true,
      'isHeadline': false,
      'isProtected': false,
      'name': 'Folder',
      'parentFolderId': '90c9b1c4-5a1a-4cff-82f8-a2eecdc70d08',
      'position': 0,
      'scope': 'business',
    }, {
      '_id': '001d2465-070c-4f04-8800-f00caf4d1a52',
      'children': [],
      'isFolder': true,
      'isHeadline': false,
      'isProtected': false,
      'name': 'Subfolder',
      'parentFolderId': '9a89552f-e024-4fa1-aef3-a3e2babdd744',
      'position': 1,
      'scope': 'business',
    }, {
      '_id': 'a1a78b86-5923-4f78-a780-00992866c466',
      'children': [{
        '_id': 'c72a2b85-f87c-4f5c-b4dd-1b086a1464a8',
        'children': [{
          '_id': '2524fd03-0159-4772-8137-368b3e1869d6',
          'children': [],
          'isFolder': true,
          'isHeadline': false,
          'isProtected': false,
          'name': 'Headline subfolder',
          'parentFolderId': 'c72a2b85-f87c-4f5c-b4dd-1b086a1464a8',
          'position': 4,
          'scope': 'business',
        }],
        'isFolder': true,
        'isHeadline': false,
        'isProtected': false,
        'name': 'Headline folder',
        'parentFolderId': 'a1a78b86-5923-4f78-a780-00992866c466',
        'position': 3,
        'scope': 'business',
      }],
      'isFolder': true,
      'isHeadline': true,
      'isProtected': false,
      'name': 'Headline',
      'parentFolderId': '90c9b1c4-5a1a-4cff-82f8-a2eecdc70d08',
      'position': 2,
      'scope': 'business',
    }, {
      '_id': 'c72a2b85-f87c-4f5c-b4dd-1b086a1464a8',
      'children': [{
        '_id': '2524fd03-0159-4772-8137-368b3e1869d6',
        'children': [],
        'isFolder': true,
        'isHeadline': false,
        'isProtected': false,
        'name': 'Headline subfolder',
        'parentFolderId': 'c72a2b85-f87c-4f5c-b4dd-1b086a1464a8',
        'position': 4,
        'scope': 'business',
      }],
      'isFolder': true,
      'isHeadline': false,
      'isProtected': false,
      'name': 'Headline folder',
      'parentFolderId': 'a1a78b86-5923-4f78-a780-00992866c466',
      'position': 3,
      'scope': 'business',
    }, {
      '_id': '2524fd03-0159-4772-8137-368b3e1869d6',
      'children': [],
      'isFolder': true,
      'isHeadline': false,
      'isProtected': false,
      'name': 'Headline subfolder',
      'parentFolderId': 'c72a2b85-f87c-4f5c-b4dd-1b086a1464a8',
      'position': 4,
      'scope': 'business',
    }];

    let modifiedFolders = [{
      '_id': '9a89552f-e024-4fa1-aef3-a3e2babdd744',
      'children': [{
        '_id': '001d2465-070c-4f04-8800-f00caf4d1a52',
        'children': [],
        'isFolder': true,
        'isHeadline': false,
        'isProtected': false,
        'name': 'Subfolder',
        'parentFolderId': '9a89552f-e024-4fa1-aef3-a3e2babdd744',
        'position': 1,
        'scope': 'business',
      }],
      'isFolder': true,
      'isHeadline': false,
      'isProtected': false,
      'name': 'Folder',
      'parentFolderId': '90c9b1c4-5a1a-4cff-82f8-a2eecdc70d08',
      'position': 0,
      'scope': 'business',
    }, {
      '_id': 'c72a2b85-f87c-4f5c-b4dd-1b086a1464a8',
      'children': [{
        '_id': '2524fd03-0159-4772-8137-368b3e1869d6',
        'children': [],
        'isFolder': true,
        'isHeadline': false,
        'isProtected': false,
        'name': 'Headline subfolder',
        'parentFolderId': 'c72a2b85-f87c-4f5c-b4dd-1b086a1464a8',
        'position': 4,
        'scope': 'business',
      }],
      'isFolder': true,
      'isHeadline': false,
      'isProtected': false,
      'name': 'Headline folder',
      'parentFolderId': 'a1a78b86-5923-4f78-a780-00992866c466',
      'position': 3,
      'scope': 'business',
    }];

    component.rootFolder._id = '90c9b1c4-5a1a-4cff-82f8-a2eecdc70d08';

    component['setRootTree'](folders);
    expect(component.rootTree).toEqual(modifiedFolders);
  });
});
