import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PeAuthService } from '@pe/auth';
import { PebEnvService } from '@pe/builder-core';
import { PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';

import {
  PeMessageApiService,
  PE_MEDIA_API_PATH,
  PE_MESSAGE_API_PATH,
  PE_PRODUCTS_API_PATH,
} from './message-api.service';

describe('PeMessageApiService', () => {
  let api: PeMessageApiService;
  const mediaPath = 'PE_MEDIA_API_PATH';
  const messagePath = 'PE_MESSAGE_API_PATH';
  const productPath = 'PE_PRODUCTS_API_PATH';
  let http: HttpTestingController;

  beforeEach(() => {
    const envServiceMock = {
      businessId: '000-111',
    };
    const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', {
      translate: 'translated',
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PeMessageApiService,
        {
          provide: PeAuthService,
          useValue: {
            getUserData: () => ({ uuid: '10101010' }),
          },
        },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: PebEnvService, useValue: envServiceMock },
        { provide: PE_ENV, useValue: {} },
        { provide: PE_MEDIA_API_PATH, useValue: mediaPath },
        { provide: PE_MESSAGE_API_PATH, useValue: messagePath },
        { provide: PE_PRODUCTS_API_PATH, useValue: productPath },
      ],
    });

    api = TestBed.inject(PeMessageApiService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should be defined', () => {
    expect(api).toBeDefined();
  });

  it('should get chat location', () => {
    const businessId = '73444665';
    const chatId = '199932423514';
    const body = { title: 'Tgfhewrget', type: 'channel' };
    const chat = {
      accentColor: '',
      businesses: [],
      length: 18,
      createdAt: '2021-03-31T09:28:20.606Z',
      liveChat: false,
      _id: '3901b5d3-95f8,-4e8f-ab55-9529db949b75',
      avatar: '',
      business: 'e01321ae-c975-48c3-baa8-d4b4ac2922cf',
      contacts: [],
      description: null,
      initials: 'T',
      integrationName: 'internal',
      locations: [
        {
          _id: '7fa76005-b594-4048-bff9-593431c9283d',
          folderId: '88e3017a-0c28-4103-b942-77641145aa42',
        },
      ],
      members: [
        {
          addMethod: 'owner',
          addedBy: '3901b5d3-95f8-4e8f-ab55-9529db949b75',
          role: 'admin',
          user: '3901b5d3-95f8-4e8f-ab55-9529db949b75',
          createdAt: '2022-09-07T07:09:24.758Z',
          updatedAt: '2022-09-07T07:09:24.758Z',
        },
      ],
      photo: null,
      pinned: [],
      signed: false,
      slug: 'GmHCLCScHgU7SY70pMZeUgESNqPhoTF8',
      subType: 'public',
      title: 'Tgfhewrget',
      type: 'channel',
      updatedAt: new Date('2022-09-07T07:10:09.781Z'),
      usedInWidget: false,
    } as any;
    const url = `${messagePath}/api/folders/business/${businessId}/document/${chatId}/first-location`;
    api.getChatLocation(businessId, chatId, chat as any).subscribe();

    const req = http.expectOne(url);
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      ...body,
    });

    req.flush({});
  });
});
