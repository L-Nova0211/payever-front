import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Actions, NgxsModule, ofActionDispatched } from '@ngxs/store';
import { BehaviorSubject, of, Subject } from 'rxjs';

import { APP_TYPE, AppType, EnvService, MessageBus, PeDestroyService, PePreloaderService } from '@pe/common';
import {
  FolderItem,
  FolderService,
  PeFoldersActionsEnum,
  PeFoldersActionsService,
  PeFoldersApiService,
} from '@pe/folders';
import {
  PeFoldersActions,
  PeGridQueryParamsService,
  PeGridService,
  PeGridSidenavService,
  PeGridState,
  PeGridViewportService,
} from '@pe/grid';
import { TranslateService } from '@pe/i18n';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderService } from '@pe/platform-header';
import { SnackbarService } from '@pe/snackbar';
import { WelcomeScreenService } from '@pe/welcome-screen';

import { PeCouponsApiService } from '../../services';
import { PeCouponsEnvService } from '../../services';
import { PeCouponsGridService } from '../../services';
import { PeCouponsHeaderService } from '../../services/coupons-header.service';

import { PeCouponsGridComponent } from './coupons-grid.component';

@Pipe({ name: 'translate' })
class TranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('PeCouponsGridComponent', () => {
  let component: PeCouponsGridComponent;
  let fixture: ComponentFixture<PeCouponsGridComponent>;

  const initialState = {
    loaded: false,
  };

  const peCouponsApiServiceSpy = jasmine.createSpyObj<PeCouponsApiService>('PeCouponsApiService', ['getChannels']);

  const peCouponsGridServiceSpy = jasmine.createSpyObj<PeCouponsGridService>('PeCouponsGridService', ['backdropClick']);
  const peCouponsEnvServiceSpy = jasmine.createSpyObj<PeCouponsEnvService>('PeCouponsEnvService', ['generateCode']);

  const platformHeaderSpy = jasmine.createSpyObj<PePlatformHeaderService>('PePlatformHeaderService', [
    'setConfig',
    'assignConfig',
  ]);

  const peCouponsHeaderServiceSpy = jasmine.createSpyObj<PeCouponsHeaderService>('PeCouponsHeaderService', [
    'onSidebarToggle',
    'init',
  ]);

  const peFoldersApiServicesSpy = jasmine.createSpyObj<PeFoldersApiService>('PeFoldersApiService', {
    getFoldersTree: of(),
  });

  const peFoldersActionsServiceSpy = jasmine.createSpyObj<PeFoldersActionsService>(
    'PeFoldersActionsService',
    {
      folderAction: of(),
    },
    {
      folderChange$: new Subject<{ folder: FolderItem; action: PeFoldersActionsEnum }>(),
    },
  );

  const pePreloaderServiceSpy = jasmine.createSpyObj<PePreloaderService>('PePreloaderService', [
    'startLoading',
    'initFinishObservers',
  ]);

  const peGridQueryParamsServiceSpy = jasmine.createSpyObj<PeGridQueryParamsService>('PeGridQueryParamsService', [
    'getQueryParamByName',
    'destroy',
  ]);

  const messageBusSpy = jasmine.createSpyObj<MessageBus>('MessageBus', {
    listen: of(),
  });

  const peGridViewportServiceSpy = jasmine.createSpyObj<PeGridViewportService>(
    'PeGridViewportService',
    {},
    {
      deviceTypeChange$: new BehaviorSubject<{
        isMobile: boolean;
      }>({ isMobile: false }),
    },
  );

  const peGridSidenavServiceSpy = jasmine.createSpyObj<PeGridSidenavService>(
    'PeGridSidenavService',
    {},
    {
      toggleOpenStatus$: new BehaviorSubject<boolean>(true),
    },
  );

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PeCouponsGridComponent, TranslatePipe],
      imports: [RouterTestingModule, HttpClientTestingModule, NgxsModule.forRoot([PeGridState])],
      providers: [
        TranslatePipe,
        { provide: APP_TYPE, useValue: AppType.Coupons },
        { provide: EnvService, useValue: {} },
        { provide: MessageBus, useValue: messageBusSpy },
        { provide: PeFoldersActionsService, useValue: peFoldersActionsServiceSpy },
        { provide: PeFoldersApiService, useValue: peFoldersApiServicesSpy },
        { provide: FolderService, useValue: {} },
        { provide: PeGridService, useValue: {} },
        { provide: PeGridSidenavService, useValue: peGridSidenavServiceSpy },
        { provide: PeGridQueryParamsService, useValue: peGridQueryParamsServiceSpy },
        { provide: PeOverlayWidgetService, useValue: {} },
        { provide: PePreloaderService, useValue: pePreloaderServiceSpy },
        { provide: SnackbarService, useValue: {} },
        { provide: TranslateService, useValue: {} },
        { provide: PeDestroyService, useValue: {} },
        { provide: PeGridViewportService, useValue: peGridViewportServiceSpy },
        { provide: PeCouponsHeaderService, useValue: peCouponsHeaderServiceSpy },
        { provide: PePlatformHeaderService, useValue: platformHeaderSpy },
        { provide: PeCouponsApiService, useValue: peCouponsApiServiceSpy },
        { provide: PeCouponsGridService, useValue: peCouponsGridServiceSpy },
        { provide: PeCouponsEnvService, useValue: peCouponsEnvServiceSpy },
        { provide: WelcomeScreenService, useValue: {} },
        provideMockStore({ initialState: { ...initialState } }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(PeCouponsGridComponent);
    component = fixture.componentInstance;
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('should call peFoldersActionsService and dispatch store action on folder actions', done => {
    const actions$ = TestBed.inject(Actions);

    actions$.pipe(ofActionDispatched(PeFoldersActions.Delete)).subscribe(_ => {
      done();
    });

    component.folderAction({ data: '' as any }, PeFoldersActionsEnum.Delete);
    expect(component.folderAction).toBeDefined();
    expect(peFoldersActionsServiceSpy.folderAction).toHaveBeenCalled();
  });
});
