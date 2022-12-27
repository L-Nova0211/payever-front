import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { forkJoin, from, Observable, of } from 'rxjs';
import { first, map, switchMap, tap } from 'rxjs/operators';

import { CreateShopThemeDto, CreateShopThemePayload, PEB_EDITOR_API_PATH } from '@pe/builder-api';
import {
  pebCloneShopTheme,
  pebCreateEmptyPage,
  PebEnvService,
  pebGenerateId,
  PebLanguage,
  PebPageType,
  PebPageVariant,
  PebScreen,
  PebShop,
  PebShopThemeId,
  PebShopThemeSnapshot,
} from '@pe/builder-core';


import { SandboxMockBackend } from '../../../../dev/editor.api-local';

@Component({
  selector: 'sandbox-add-theme-from-themes-dialog',
  templateUrl: './add-theme-from-themes.dialog.html',
  styleUrls: ['./add-theme-from-themes.dialog.scss'],
})
export class SandboxAddThemeFromThemesDialog implements OnInit {

  themeId: string;

  nextShopName: string;

  token = localStorage.getItem('TOKEN');

  fromApiPaths = [
    {
      key: 'production',
      value: 'https://builder-shops.payever.org',
    },
    {
      key: 'staging',
      value: 'https://builder-shops.staging.devpayever.com',
    },
    {
      key: 'test',
      value: 'https://builder-shops.test.devpayever.com',
    },
  ];

  toApiPaths = [
    ...this.fromApiPaths,
    {
      key: 'sandbox',
      value: 'sandbox',
    },
  ];

  private initialApiPathFrom = this.injector.get(PEB_EDITOR_API_PATH);
  private initialApiPathTo = 'sandbox';

  form: FormGroup;

  private ids = [
    '3a8e0ddb-fdf9-47cd-b2d1-e0c684b41f10',
    // 'aace75c6-46e1-45c5-af3e-99fa53807cc9', // PRODUCTS 1
    // 'd115324d-7f61-443e-86e4-88c673ef3853',
    // 'eaff895d-aecc-45e6-84ac-ac6db48ddf51',
    // 'bb6702a4-1daf-4ffb-b4a2-14f5645f05ca',
    // '302e50bb-108f-4dce-8cee-214ef0174837',
    // '5bf7d4cf-1990-42d0-b00a-61cc7aa86775',
    // '48eab69a-de2e-47ac-a591-b7261b3da89d',
    // 'fa77b530-0a48-43e4-954a-b85d738e71e9',
    // '934c08b8-8d68-4e5c-a2da-b4cda785c982',
    // 'd924d080-216b-4eb1-b0b3-b584b7420c8f',
    // '464a863d-b5ed-479b-85c7-d5fcbe85e1d1',
  ];

  themeIds = [
    ...this.ids.map(id => this.formBuilder.control(id)),
  ];

  constructor(
    private injector: Injector,
    private http: HttpClient,
    private dialogRef: MatDialogRef<SandboxAddThemeFromThemesDialog>,
    private sandboxMockBackend: SandboxMockBackend,
    private envService: PebEnvService,
    private router: Router,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      token: [this.token, [Validators.required]],
      themeIds: this.formBuilder.array(this.themeIds),
      nextName: ['', [Validators.required]],
      apiPathFrom: [this.initialApiPathFrom, [Validators.required]],
      apiPathTo: [this.initialApiPathTo, [Validators.required]],
      markAllPagesAsMaster: [false, [Validators.required]],
    });
  }

  get themeIdsArray() {
    return this.form.get('themeIds') as FormArray;
  }

  addItem() {
    const control = this.formBuilder.control('');
    this.themeIds.push(control);

    this.themeIdsArray.push(control);
  }

  onSubmit() {
    this.form.disable();

    if (this.form.value.token) {
      localStorage.setItem('TOKEN', this.form.value.token);
    }

    this.copy(this.form.value);
  }

  private copy({ themeIds, nextName, apiPathFrom, apiPathTo, markAllPagesAsMaster }) {

    forkJoin<PebShopThemeSnapshot>([...themeIds.filter(id => !!id).map(id => this.getSnapshot(apiPathFrom, id))]).pipe(
      map((snapshots) => {

        const emptyPage = pebCreateEmptyPage('Main page', PebPageVariant.Front);

        const shop: PebShop = {
          id: pebGenerateId(),
          data: {
            productPages: '/products/:productId',
            categoryPages: '/category/:categoryId',
            languages: [{ language: PebLanguage.English, active: true }],
            defaultLanguage: PebLanguage.English,
          },
          routing: (markAllPagesAsMaster
            ? [{ pageId: emptyPage.id, routeId: `${emptyPage.id}-route`, url: '/' }]
            : snapshots.reduce((acc, snapshot) => ([...acc, ...snapshot.shop.routing]), [])
          ),
          context: snapshots.reduce(
            (acc, snapshot) => ({ ...acc, ...snapshot.contextSchemas[snapshot.shop.contextId] }),
            {},
          ),
          pages: [
            ...(markAllPagesAsMaster ? [emptyPage] : []),
            ...snapshots.reduce(
              (acc, snapshot) => ([
                ...acc,
                ...Object.values(snapshot.pages)
                .filter(p => markAllPagesAsMaster ? p.type === PebPageType.Replica : p.type)
                .map((page: any) => ({
                  id: page.id,
                  name: page.name,
                  variant: markAllPagesAsMaster ? PebPageVariant.Default : page.variant,
                  type: markAllPagesAsMaster ? PebPageType.Master : page.type,
                  master: markAllPagesAsMaster ? null : page.master,
                  data: page.data,
                  template: snapshot.templates[page.templateId],
                  stylesheets: {
                    [PebScreen.Desktop]: snapshot.stylesheets[page.stylesheetIds[PebScreen.Desktop]],
                    [PebScreen.Tablet]: snapshot.stylesheets[page.stylesheetIds[PebScreen.Tablet]],
                    [PebScreen.Mobile]: snapshot.stylesheets[page.stylesheetIds[PebScreen.Mobile]],
                  },
                  context: snapshot.contextSchemas[page.contextId],
                })),
              ]),
              [],
            ),
          ],
        };

        console.log(shop, pebCloneShopTheme(shop));

        return [{ name: nextName, content: pebCloneShopTheme(shop) }, apiPathTo];
      }),
    ).pipe(
      switchMap(([data, toPath]) => this.createShopTheme(data, toPath).pipe(map(r => ([r, toPath])))),
      switchMap(([d, toPath]) => this.setDetails(d, toPath)),
      tap(() => this.dialogRef.close()),
      first(),
    ).subscribe();
  }

  private getSnapshot(apiPathFrom: string, themeId: PebShopThemeId): Observable<PebShopThemeSnapshot> {
    return this.http.get<PebShopThemeSnapshot>(`${apiPathFrom}/api/theme/${themeId}/snapshot`);
  }

  private createShopTheme(input: CreateShopThemePayload, apiPathTo: string): Observable<CreateShopThemeDto> {
    if (apiPathTo === 'sandbox') {
      return from(this.sandboxMockBackend.createShopTheme(input));
    }

    return this.http.post(`${apiPathTo}/api/theme`, input);
  }

  private setDetails(d: any, apiPathTo: string): Observable<any> {
    if (apiPathTo === 'sandbox') {
      this.envService.shopId = d.id;
      this.router.navigate(d ? ['editor', d.id] : ['/']);

      return of(null);
    }

    return this.http.post(
      `${apiPathTo}/api/${d.id}/template`,
      {
        codeGroup: 'BUSINESS_PRODUCT_RETAIL_B2C',
        order: 1,
        codeItem: 'BRANCHE_FASHION',
        type: 'product',
      },
    );
  }
}
