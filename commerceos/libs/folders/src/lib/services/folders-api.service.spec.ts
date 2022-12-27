import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApmService } from '@elastic/apm-rum-angular';

import { PeAuthService } from '@pe/auth';
import { CosEnvService } from '@pe/base';
import { EnvService } from '@pe/common';
import { PeGridSearchDataInterface, PeGridSortingDirectionEnum } from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { SnackbarService } from '@pe/snackbar';

import { PE_FOLDERS_API_PATH } from '../tokens/folders-path.token';

import { PeFoldersApiService } from './folders-api.service';

describe('PeFoldersApiService', () => {

  let api: PeFoldersApiService;
  let env: CosEnvService;
  const folderPath = 'PE_FOLDERS_API_PATH';

  beforeEach(() => {

    const envServiceMock = {
      businessId: '000-111',
    };

    const cosServiceMock = {
      isPersonalMode: true,
    };

    const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', {
			translate: 'translated',
		});

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PeFoldersApiService,
        { provide: EnvService, useValue: envServiceMock },
        { provide: CosEnvService, useValue: cosServiceMock },
        { provide: ApmService, useValue: {} },
        { provide: PeAuthService, useValue: {
					getUserData: () => ({ uuid: '10101010' }),
				} },
        { provide: SnackbarService, useValue: {} },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: PE_FOLDERS_API_PATH, useValue: folderPath },
      ],
    });

    api = TestBed.inject(PeFoldersApiService);
    env = TestBed.inject(CosEnvService);

  });

  it('should be defined', () => {

    expect(api).toBeDefined();

  });

  it('should get url in personal mode', () => {

    env.isPersonalMode = true;
    expect(api.foldersBusinessPath).toEqual('PE_FOLDERS_API_PATH/folders/user/10101010');
  });

  it('should get url not in personal mode', () => {

    env.isPersonalMode = false;
    expect(api.foldersBusinessPath).toEqual('PE_FOLDERS_API_PATH/folders/business/000-111');
  });
 it('should make correct httpParams', () => {

    let searchData: PeGridSearchDataInterface = {
      configuration: null,
      direction: PeGridSortingDirectionEnum.Ascending,
      orderBy: 'content.raw',
      page: 1,
      perPage: 25,
    };

    expect(api['getSearchParams'](searchData)['updates']).toEqual([
      { param: 'sort[0][field]', value: 'content.raw', op: 's' },
      { param: 'sort[0][direction]', value: 'asc', op: 's' },
      { param: 'limit', value: '25', op: 's' },
      { param: 'page', value: '1', op: 's' },
      { param: 'filters[isHeadline][0][condition]', value: 'isNot', op: 's' },
      { param: 'filters[isHeadline][0][value][0]', value: 'true', op: 's' },
    ]);

    searchData = {
      configuration: {
        'content:raw': [
          { condition: 'contains', value: ['abc'] },
          { condition: 'doesNotContain', value: ['bcd'] },
        ],
      },
      direction: PeGridSortingDirectionEnum.Descending,
      orderBy: 'content.raw',
      page: 1,
      perPage: 25,
    };

    expect(api['getSearchParams'](searchData)['updates']).toEqual([
      { param: 'sort[0][field]', value: 'content.raw', op: 's' },
      { param: 'sort[0][direction]', value: 'desc', op: 's' },
      { param: 'limit', value: '25', op: 's' },
      { param: 'page', value: '1', op: 's' },
      { param: 'filters[isHeadline][0][condition]', value: 'isNot', op: 's' },
      { param: 'filters[isHeadline][0][value][0]', value: 'true', op: 's' },
      { param: 'filters[content.raw][0][condition]', value: 'contains', op: 's' },
      { param: 'filters[content.raw][0][value][0]', value: 'abc', op: 's' },
      { param: 'filters[content.raw][1][condition]', value: 'doesNotContain', op: 's' },
      { param: 'filters[content.raw][1][value][0]', value: 'bcd', op: 's' },
    ]);

    searchData = {
      configuration: {
        updatedAt: [
          { condition: 'afterDate', value: [new Date('Tue Sep 13 2022 03:00:00 GMT+0300 (Eastern European Summer Time)')] },
          { condition: 'beforeDate', value: [new Date('Tue Sep 20 2022 03:00:00 GMT+0300 (Eastern European Summer Time)')] },
        ],
      },
      direction: PeGridSortingDirectionEnum.Ascending,
      orderBy: 'updatedAt',
      page: 1,
      perPage: 25,
    };
 
    expect(api['getSearchParams'](searchData)['updates']).toEqual([
      { param: 'sort[0][field]', value: 'updatedAt', op: 's' },
      { param: 'sort[0][direction]', value: 'asc', op: 's' },
      { param: 'limit', value: '25', op: 's' },
      { param: 'page', value: '1', op: 's' },
      { param: 'filters[isHeadline][0][condition]', value: 'isNot', op: 's' },
      { param: 'filters[isHeadline][0][value][0]', value: 'true', op: 's' },
      { param: 'filters[updatedAt][0][condition]', value: 'afterDate', op: 's' },
      { param: 'filters[updatedAt][0][value][0]',
        value: new Date('Tue Sep 13 2022 03:00:00 GMT+0300 (Eastern European Summer Time)'),
        op: 's',
      },
      { param: 'filters[updatedAt][1][condition]', value: 'beforeDate', op: 's' },
      { param: 'filters[updatedAt][1][value][0]',
        value: new Date('Tue Sep 20 2022 03:00:00 GMT+0300 (Eastern European Summer Time)'),
        op: 's',
      },
    ]);

    searchData = {
      configuration: {
        type: [
          { condition: 'is', value: ['media'] },
          { condition: 'isNot', value: ['product'] },
        ],
      },
      direction: PeGridSortingDirectionEnum.Descending,
      orderBy: 'updatedAt',
      page: 1,
      perPage: 25,
    };
 
    expect(api['getSearchParams'](searchData)['updates']).toEqual([
      { param: 'sort[0][field]', value: 'updatedAt', op: 's' },
      { param: 'sort[0][direction]', value: 'desc', op: 's' },
      { param: 'limit', value: '25', op: 's' },
      { param: 'page', value: '1', op: 's' },
      { param: 'filters[isHeadline][0][condition]', value: 'isNot', op: 's' },
      { param: 'filters[isHeadline][0][value][0]', value: 'true', op: 's' },
      { param: 'filters[type][0][condition]', value: 'is', op: 's' },
      { param: 'filters[type][0][value][0]',
        value: 'media',
        op: 's',
      },
      { param: 'filters[type][1][condition]', value: 'isNot', op: 's' },
      { param: 'filters[type][1][value][0]',
        value: 'product',
        op: 's',
      },
    ]);

    searchData = {
      configuration: {
        status: [
          { condition: 'is', value: ['draft','postnow' ] },
          { condition: 'isNot', value: ['schedule'] },
        ],
      },
      direction: PeGridSortingDirectionEnum.Ascending,
      orderBy: 'updatedAt',
      page: 1,
      perPage: 25,
    };
 
    expect(api['getSearchParams'](searchData)['updates']).toEqual([
      { param: 'sort[0][field]', value: 'updatedAt', op: 's' },
      { param: 'sort[0][direction]', value: 'asc', op: 's' },
      { param: 'limit', value: '25', op: 's' },
      { param: 'page', value: '1', op: 's' },
      { param: 'filters[isHeadline][0][condition]', value: 'isNot', op: 's' },
      { param: 'filters[isHeadline][0][value][0]', value: 'true', op: 's' },
      { param: 'filters[status][0][condition]', value: 'is', op: 's' },
      { param: 'filters[status][0][value][0]', value: 'draft', op: 's' },
      { param: 'filters[status][0][value][1]', value: 'postnow', op: 's' },
      { param: 'filters[status][1][condition]', value: 'isNot', op: 's' },
      { param: 'filters[status][1][value][0]', value: 'schedule', op: 's' },
    ]);
  });

  it('should make correct httpParams (sorting)', () => {  
    let searchData = {
      configuration: null,
      direction: PeGridSortingDirectionEnum.Ascending,
      orderBy: 'content.raw',
      page: 1,
      perPage: 25,
    };
 
    expect(api['getSearchParams'](searchData)['updates']).toEqual([
      { param: 'sort[0][field]', value: 'content.raw', op: 's' },
      { param: 'sort[0][direction]', value: 'asc', op: 's' },
      { param: 'limit', value: '25', op: 's' },
      { param: 'page', value: '1', op: 's' },
      { param: 'filters[isHeadline][0][condition]', value: 'isNot', op: 's' },
      { param: 'filters[isHeadline][0][value][0]', value: 'true', op: 's' },
    ]);

    searchData = {
      configuration: null,
      direction: PeGridSortingDirectionEnum.Descending,
      orderBy: 'updatedAt',
      page: 1,
      perPage: 25,
    };
 
    expect(api['getSearchParams'](searchData)['updates']).toEqual([
      { param: 'sort[0][field]', value: 'updatedAt', op: 's' },
      { param: 'sort[0][direction]', value: 'desc', op: 's' },
      { param: 'limit', value: '25', op: 's' },
      { param: 'page', value: '1', op: 's' },
      { param: 'filters[isHeadline][0][condition]', value: 'isNot', op: 's' },
      { param: 'filters[isHeadline][0][value][0]', value: 'true', op: 's' },
    ]);
  });
});