import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { MessageBus } from '@pe/builder-core';
import { TranslatePipe } from '@pe/i18n';

import { PEB_SITE_HOST } from '../../constants';
import { AbstractSiteBuilderApi } from '../../services/builder/abstract.builder.api';
import { PebSitesApi } from '../../services/site/abstract.sites.api';

import { PebSiteDashboardComponent } from './site-dashboard.component';

describe('PebSiteDashboardComponent', () => {

  let fixture: ComponentFixture<PebSiteDashboardComponent>;
  let component: PebSiteDashboardComponent;
  let messageBus: jasmine.SpyObj<MessageBus>;
  let api: jasmine.SpyObj<PebSitesApi>;
  let builderApi: any;
  let route: any;

  const entityName = 'entity.name';

  beforeEach(async(() => {

    const messageBusSpy = jasmine.createSpyObj<MessageBus>('MessageBus', ['emit']);

    const apiSpy = jasmine.createSpyObj<PebSitesApi>('PebSitesApi', ['getSingleSite']);

    const builderApiSpy = jasmine.createSpyObj<AbstractSiteBuilderApi>('AbstractSiteBuilderApi', ['getSitePreview']);
    builderApiSpy.getSitePreview.and.returnValue(of({ id: 'preview-001' }) as any);

    const routeMock = {
      snapshot: {
        params: {
          siteId: 'site-001',
        },
      },
      parent: {
        snapshot: {
          params: {
            siteId: 'site-001',
          },
        },
      },
    };

    TestBed.configureTestingModule({
      imports: [
        MatMenuModule,
      ],
      declarations: [
        PebSiteDashboardComponent,
        TranslatePipe,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: MessageBus, useValue: messageBusSpy },
        { provide: AbstractSiteBuilderApi, useValue: builderApiSpy },
        { provide: PebSitesApi, useValue: apiSpy },
        { provide: 'PEB_ENTITY_NAME', useValue: entityName },
        { provide: PEB_SITE_HOST, useValue: 'host.com' },
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebSiteDashboardComponent);
      component = fixture.componentInstance;

      messageBus = TestBed.inject(MessageBus) as jasmine.SpyObj<MessageBus>;
      api = TestBed.inject(PebSitesApi) as jasmine.SpyObj<PebSitesApi>;
      builderApi = TestBed.inject(AbstractSiteBuilderApi);
      route = TestBed.inject(ActivatedRoute);

      api.getSingleSite.and.returnValue(of({
        id: 'site-001',
        accessConfig: {
          internalDomain: 'internal.domain',
        },
      }) as any);

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set site on init', () => {

    const markSpy = spyOn(component[`cdr`], 'markForCheck');
    const site = { id: 'site-001' };

    api.getSingleSite.and.returnValue(of(site) as any);

    component.ngOnInit();

    expect(component.site).toEqual(site as any);
    expect(markSpy).toHaveBeenCalled();

  });

  it('should emit on edit click', () => {

    const markSpy = spyOn(component[`cdr`], 'markForCheck');

    component.onEditClick();

    expect(markSpy).toHaveBeenCalled();
    expect(messageBus.emit).toHaveBeenCalledWith('entity.name.navigate.edit', 'site-001');

  });

  it('should handle open click', () => {

    component.site = { id: 'site-001' };

    component.onOpenClick();

    expect(messageBus.emit).toHaveBeenCalledWith('entity.name.open-site', { id: 'site-001' });

  });

});
