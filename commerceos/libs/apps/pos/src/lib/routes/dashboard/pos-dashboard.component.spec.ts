import { NO_ERRORS_SCHEMA, Pipe } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, of } from 'rxjs';

import { FontLoaderService } from '@pe/builder-font-loader';
import { EnvService, MessageBus } from '@pe/common';

import { PEB_POS_HOST } from '../../constants/constants';
import { BuilderPosApi } from '../../services/builder/abstract.builder-pos.api';
import { PosApi } from '../../services/pos/abstract.pos.api';
import { PosEnvService } from '../../services/pos/pos-env.service';

import { PebPosDashboardComponent } from './pos-dashboard.component';

@Pipe({
  name: 'translate',
})
class TranslatePipeMock {

  transform() { }

}

describe('PebPosDashboardComponent', () => {

  let fixture: ComponentFixture<PebPosDashboardComponent>;
  let component: PebPosDashboardComponent;
  let messageBus: jasmine.SpyObj<MessageBus>;
  let api: jasmine.SpyObj<PosApi>;
  let envService: jasmine.SpyObj<PosEnvService>;
  let fontLoaderService: jasmine.SpyObj<FontLoaderService>;

  beforeEach(waitForAsync(() => {

    const messageBusSpy = jasmine.createSpyObj<MessageBus>('MessageBus', ['emit']);

    const apiSpy = jasmine.createSpyObj<PosApi>('PosApi', {
      getSinglePos: EMPTY,
    });

    const routeMock = {
      snapshot: {
        params: {
          posId: 'pos-001',
        },
      },
    };

    envService = {
      businessData: null,
    } as any;

    const fontLoaderServiceSpy = jasmine.createSpyObj<FontLoaderService>('FontLoaderService', ['renderFontLoader']);

    TestBed.configureTestingModule({
      imports: [MatMenuModule],
      declarations: [
        PebPosDashboardComponent,
        TranslatePipeMock,
      ],
      providers: [
        { provide: MessageBus, useValue: messageBusSpy },
        { provide: PosApi, useValue: apiSpy },
        { provide: BuilderPosApi, useValue: {} },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: EnvService, useValue: envService },
        { provide: FontLoaderService, useValue: fontLoaderServiceSpy },
        { provide: PEB_POS_HOST, useValue: 'pos.host' },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebPosDashboardComponent);
      component = fixture.componentInstance;

      fontLoaderService = TestBed.inject(FontLoaderService) as jasmine.SpyObj<FontLoaderService>;
      messageBus = TestBed.inject(MessageBus) as jasmine.SpyObj<MessageBus>;
      api = TestBed.inject(PosApi) as jasmine.SpyObj<PosApi>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();
    expect(fontLoaderService.renderFontLoader).toHaveBeenCalled();

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

    fixture = TestBed.createComponent(PebPosDashboardComponent);
    component = fixture.componentInstance;

    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings.theme is set
     */
    envService.businessData.themeSettings = { theme: 'light' };

    fixture = TestBed.createComponent(PebPosDashboardComponent);
    component = fixture.componentInstance;

    expect(component.theme).toEqual('light');

  });

  it('should handle edit click', () => {

    component.onEditClick();

    expect(messageBus.emit).toHaveBeenCalledWith('pos.navigate.settings_edit', 'pos-001');

  });

  it('should handle ng init', () => {

    const markSpy = spyOn(component[`cdr`], 'markForCheck');
    const terminal = { _id: 'pos-001' };

    api.getSinglePos.and.returnValue(of(terminal));

    component.terminal = null;
    component.ngOnInit();

    expect(component.terminal).toEqual(terminal);
    expect(markSpy).toHaveBeenCalled();

  });

  it('should handle open click', () => {

    const terminal = { _id: 'pos-001' };

    component.terminal = terminal;
    component.onOpenClick();

    expect(messageBus.emit).toHaveBeenCalledWith('pos.open', terminal);

  });

});
