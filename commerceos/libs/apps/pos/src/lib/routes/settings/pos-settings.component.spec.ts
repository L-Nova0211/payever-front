import { NO_ERRORS_SCHEMA, Pipe } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, of, Subject } from 'rxjs';

import { EnvService, MessageBus, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeOverlayWidgetService } from '@pe/overlay-widget';

import { PosApi } from '../../services/pos/abstract.pos.api';
import { PosEnvService } from '../../services/pos/pos-env.service';

import { PebPosSettingsComponent } from './pos-settings.component';

@Pipe({
  name: 'translate',
})
class TranslatePipeMock {

  transform() { }

}

describe('PebShopSettingsComponent', () => {

  let fixture: ComponentFixture<PebPosSettingsComponent>;
  let component: PebPosSettingsComponent;
  let api: jasmine.SpyObj<PosApi>;
  let overlay: jasmine.SpyObj<PeOverlayWidgetService>;
  let messageBus: jasmine.SpyObj<MessageBus>;
  let envService: jasmine.SpyObj<PosEnvService>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let route: any;

  beforeEach(waitForAsync(() => {

    const destroyServiceMock = new Subject<void>();

    const apiSpy = jasmine.createSpyObj<PosApi>('PosApi', [
      'patchIsLive',
      'getSinglePos',
      'getPosList',
    ]);
    apiSpy.getPosList.and.returnValue(EMPTY);

    const overlaySpy = jasmine.createSpyObj<PeOverlayWidgetService>('PeOverlayWidgetService', [
      'close',
      'open',
    ]);

    envService = {
      posId: 'pos-001',
      businessId: 'b-001',
      businessData: undefined,
    } as any;

    const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', {
      translate: 'translated',
    });

    const messageBusSpy = jasmine.createSpyObj<MessageBus>('MessageBus', ['emit']);

    const routeMock = {
      snapshot: {
        queryParams: null,
        parent: {
          parent: {
            data: {
              terminal: undefined,
            },
          },
        },
      },
    };

    TestBed.configureTestingModule({
      declarations: [
        PebPosSettingsComponent,
        TranslatePipeMock,
      ],
      providers: [
        { provide: PosApi, useValue: apiSpy },
        { provide: PeOverlayWidgetService, useValue: overlaySpy },
        { provide: EnvService, useValue: envService },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: PeDestroyService, useValue: destroyServiceMock },
        { provide: MessageBus, useValue: messageBusSpy },
        { provide: ActivatedRoute, useValue: routeMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebPosSettingsComponent);
      component = fixture.componentInstance;

      api = TestBed.inject(PosApi) as jasmine.SpyObj<PosApi>;
      route = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
      overlay = TestBed.inject(PeOverlayWidgetService) as jasmine.SpyObj<PeOverlayWidgetService>;
      messageBus = TestBed.inject(MessageBus) as jasmine.SpyObj<MessageBus>;
      envService = TestBed.inject(EnvService) as jasmine.SpyObj<PosEnvService>;
      translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set theme on construct', () => {

    /**
     * envService.businessData is null
     */
    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings is null
     */
    envService.businessData = { themeSettings: null };

    fixture = TestBed.createComponent(PebPosSettingsComponent);
    component = fixture.componentInstance;

    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings.theme is set
     */
    envService.businessData.themeSettings = { theme: 'light' };

    fixture = TestBed.createComponent(PebPosSettingsComponent);
    component = fixture.componentInstance;

    expect(component.theme).toEqual('light');

  });

  it('should get business id', () => {

    expect(component.businessId).toEqual(envService.businessId);

  });

  it('should get pos id', () => {

    expect(component.posId).toEqual(envService.posId);

  });

  it('should handle ng init', () => {

    const getListSpy = spyOn(component, 'getPosList').and.returnValue(of(null));

    /**
     * component.onSavedSubject$.value is null as default
     */
    component.ngOnInit();

    expect(getListSpy).toHaveBeenCalledTimes(1);
    expect(messageBus.emit).not.toHaveBeenCalled();

    /**
     * component.onSavedSubject$.value is set with openTerminal prop
     */
    getListSpy.calls.reset();
    component.onSavedSubject$.next({
      openTerminal: true,
      terminal: { _id: 'pos-001' },
    });

    expect(getListSpy).not.toHaveBeenCalled();
    expect(route.snapshot.parent.parent.data).toEqual({
      terminal: { _id: 'pos-001' },
    });
    expect(messageBus.emit).toHaveBeenCalledWith('pos.navigate.dashboard', 'pos-001');

    /**
     * component.onSavedSubject$.value is set with updatePosList prop
     */
    messageBus.emit.calls.reset();
    component.onSavedSubject$.next({ updatePosList: true });

    expect(getListSpy).toHaveBeenCalled();
    expect(messageBus.emit).not.toHaveBeenCalled();

  });

  it('should get pos list', () => {

    const openSpy = spyOn(component, 'openOverlay');
    const markSpy = spyOn(component[`cdr`], 'markForCheck');
    const terminals = [
      { _id: 'pos-001', active: false },
      { _id: 'pos-002', active: false },
      { _id: 'pos-003', active: true },
    ];
    const terminal = terminals[0];

    api.getPosList.and.returnValue(of(terminals));
    api.getSinglePos.and.returnValue(of(terminal));

    /**
     * route.snapshot.queryParams is null
     */
    component.terminalList = null;
    component.openedTerminal = null;
    component.isOpenEdit = true;
    component.getPosList().subscribe();

    expect(api.getPosList).toHaveBeenCalled();
    expect(component.terminalList).toEqual(terminals);
    expect(component.isOpenEdit).toBeUndefined();
    expect(openSpy).not.toHaveBeenCalled();
    expect(markSpy).toHaveBeenCalledTimes(2);
    expect(api.getSinglePos).toHaveBeenCalledWith(envService.posId);
    expect(component.openedTerminal).toEqual(terminal);

    /**
     * route.snapshot.queryParams.isEdit is TRUE
     */
    route.snapshot.queryParams = { isEdit: true };

    component.getPosList().subscribe();

    expect(component.isOpenEdit).toBe(true);
    expect(openSpy).toHaveBeenCalledWith(component.components.createApp, terminals[2]);

  });

  it('should handle copy', fakeAsync(() => {

    const markSpy = spyOn(component[`cdr`], 'markForCheck');

    component.onCopy('test');

    expect(component.copyButtons['test']).toEqual('pos-app.actions.copied');
    expect(markSpy).not.toHaveBeenCalled();

    tick(2000);

    expect(component.copyButtons['test']).toEqual('pos-app.actions.copy');
    expect(markSpy).toHaveBeenCalled();

  }));

  it('should open overlay', () => {

    const terminal = { _id: 'pos-001' };
    const item = {
      component: { test: true },
      header: 'test',
    };
    const itemData = { _id: 'pos-002', active: true };

    translateService.translate.and.callFake((key: string) => `${key}.translated`);

    /**
     * argument itemData is null
     */
    component.openedTerminal = terminal;
    component.openOverlay(item, null);

    expect(overlay.open).toHaveBeenCalled();
    let config = overlay.open.calls.argsFor(0)[0];
    expect(config.hasBackdrop).toBe(true);
    expect(config.component).toEqual(item.component);
    expect(config.data).toEqual({
      ...terminal,
      onSved$: component.onSavedSubject$,
    });
    expect(config.backdropClass).toEqual('settings-backdrop');
    expect(config.panelClass).toEqual('settings-widget-panel');
    expect(config.headerConfig.theme).toEqual('dark');
    expect(config.headerConfig.title).toEqual('test.translated');
    expect(config.headerConfig.backBtnTitle).toEqual('pos-app.actions.cancel.translated');
    expect(config.headerConfig.doneBtnTitle).toEqual('pos-app.actions.done.translated');
    expect(translateService.translate).toHaveBeenCalledTimes(3);
    expect(translateService.translate.calls.all().map(c => c.args[0])).toEqual([
      'test',
      'pos-app.actions.cancel',
      'pos-app.actions.done',
    ]);

    config.headerConfig.doneBtnCallback();
    expect(overlay.close).not.toHaveBeenCalled();

    config.headerConfig.cancelBtnCallback();
    expect(overlay.close).not.toHaveBeenCalled();

    config.headerConfig.backBtnCallback();
    expect(overlay.close).toHaveBeenCalled();

    /**
     * argument itemData is set
     */
    translateService.translate.calls.reset();

    component.openOverlay(item, itemData);

    config = overlay.open.calls.argsFor(1)[0];
    expect(config.data).toEqual({
      ...itemData,
      onSved$: component.onSavedSubject$,
    });
    expect(config.headerConfig.title).toEqual('pos-app.settings.edit_terminal.translated');
    expect(translateService.translate).toHaveBeenCalledWith('pos-app.settings.edit_terminal');

  });

});
