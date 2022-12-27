import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { omit } from 'lodash';
import { Observable } from 'rxjs';
import { first, map, switchMap, tap } from 'rxjs/operators';

import { PEB_EDITOR_API_PATH } from '@pe/builder-api';
import {
  generateUniqueIdsForPage,
  PebAction,
  PebContextSchemaEffect,
  PebEffectTarget,
  pebGenerateId,
  PebPage,
  PebPageEffect,
  PebPageType,
  PebPageVariant,
  PebScreen,
  PebShopEffect,
  PebShopThemeId,
  PebShopThemeSnapshot,
  PebStylesheetEffect,
  PebTemplateEffect,
} from '@pe/builder-core';

@Component({
  selector: 'sandbox-add-page-to-theme-dialog',
  templateUrl: './add-page-to-theme.dialog.html',
  styleUrls: ['./add-page-to-theme.dialog.scss'],
})
export class SandboxAddPageToThemeDialog implements OnInit {

  themeId: string;

  nextShopName: string;

  token = localStorage.getItem('TOKEN');

  apiPaths = [
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

  private initialApiPathFrom = this.injector.get(PEB_EDITOR_API_PATH);
  private initialApiPathTo = this.apiPaths[2]?.value;

  form: FormGroup;

  pages: Array<PebPage & { control: FormControl }> = [];

  constructor(
    private injector: Injector,
    private http: HttpClient,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      token: [this.token, [Validators.required]],
      fromThemeId: ['58387f4b-a428-4d98-b755-f239f062bb0f', [Validators.required]],
      toThemeId: ['58387f4b-a428-4d98-b755-f239f062bb0f', [Validators.required]],
      pages: this.formBuilder.array([]),
      apiPathFrom: [this.initialApiPathFrom, [Validators.required]],
      apiPathTo: [this.initialApiPathTo, [Validators.required]],
      markAllPagesAsMaster: [false, [Validators.required]],
    });
  }

  get validPagesControl(): boolean {
    return this.pageIdsArray?.value.find((v: boolean) => !!v);
  }

  get pageIdsArray() {
    return this.form.get('pages') as FormArray;
  }

  getPages() {
    if (this.form.value.token) {
      localStorage.setItem('TOKEN', this.form.value.token);
    }

    const { apiPathFrom, fromThemeId } = this.form.value;

    this.getSnapshot(apiPathFrom, fromThemeId).pipe(
      first(),
      tap((snapshot) => {
        this.pages = Object.values(snapshot.pages).map(p => ({
          id: p.id,
          name: p.name,
          variant: p.variant === PebPageVariant.Front ? PebPageVariant.Default : p.variant,
          // variant: PebPageVariant.Front,
          type: p.type,
          master: null,
          data: p.data,
          lastActionId: null,
          template: snapshot.templates[p.templateId],
          stylesheets: Object.entries(p.stylesheetIds).reduce(
            (acc, [screen, id]) => ({
              ...acc,
              [screen]: snapshot.stylesheets[id],
            }),
            {},
          ),
          context: snapshot.contextSchemas[p.contextId],
          control: this.formBuilder.control(''),
        }));

        this.pages.forEach(page => this.pageIdsArray.push(page.control));
      }),
    ).subscribe();
  }

  onSubmit() {
    this.form.disable();

    if (this.form.value.token) {
      localStorage.setItem('TOKEN', this.form.value.token);
    }

    const { apiPathTo, toThemeId, markAllPagesAsMaster } = this.form.value;

    const pages = this.form.value.pages
      .map((checked, index) => checked
        ? ({
          ...omit(this.pages[index], ['control']),
        })
        : null,
      )
      .filter(p => !!p);

    this.getSnapshot(apiPathTo, toThemeId).pipe(
      first(),
      map((snapshot) => {
        const actions = pages
          .map(page => ({
            ...page,
            ...generateUniqueIdsForPage(page),
            name: `${page.name}-copy`,
            type: markAllPagesAsMaster ? PebPageType.Master : page.type,
          }))
          .map(page => this.createAction(page));

        return {
          ...actions[0],
          effects: actions.reduce((acc, curr) => ([...acc, ...curr.effects]), []),
        };
      }),
      switchMap((action) => {
        console.log(action);

        return this.addAction(apiPathTo, toThemeId, action);
        // return EMPTY;
      }),
    ).subscribe();
  }


  private getSnapshot(apiPathFrom: string, themeId: PebShopThemeId): Observable<PebShopThemeSnapshot> {
    return this.http.get<PebShopThemeSnapshot>(`${apiPathFrom}/api/theme/${themeId}/snapshot`);
  }

  private addAction(apiPathTo: string, shopId: string, action: PebAction): Observable<any> {
    return this.http.post(`${apiPathTo}/api/theme/${shopId}/action`, action);
  }

  private createAction(pageSource: PebPage) {
    const pageId = pebGenerateId('page');
    const templateId = pebGenerateId('template');
    const stylesIds = {
      [PebScreen.Desktop]: pebGenerateId('stylesheet'),
      [PebScreen.Tablet]: pebGenerateId('stylesheet'),
      [PebScreen.Mobile]: pebGenerateId('stylesheet'),
    };
    const contextId = pebGenerateId('context');

    return {
      id: pebGenerateId('action'),
      createdAt: new Date(),
      targetPageId: pageId,
      affectedPageIds: [pageId],
      effects: [
        {
          type: PebTemplateEffect.Init,
          target: `${PebEffectTarget.Templates}:${templateId}`,
          payload: pageSource.template,
        },
        ...Object.values(PebScreen).map(screen => ({
          type: PebStylesheetEffect.Init,
          target: `${PebEffectTarget.Stylesheets}:${stylesIds[screen]}`,
          payload: pageSource.stylesheets[screen],
        })),
        {
          type: PebContextSchemaEffect.Init,
          target: `${PebEffectTarget.ContextSchemas}:${contextId}`,
          payload: pageSource.context,
        },
        {
          type: PebPageEffect.Create,
          target: `${PebEffectTarget.Pages}:${pageId}`,
          payload: {
            templateId,
            contextId,
            id: pageId,
            variant: pageSource.variant,
            type: pageSource.type,
            master: pageSource.master,
            name: pageSource.name,
            data: pageSource.data,
            stylesheetIds: {
              [PebScreen.Desktop]: `${stylesIds[PebScreen.Desktop]}`,
              [PebScreen.Tablet]: `${stylesIds[PebScreen.Tablet]}`,
              [PebScreen.Mobile]: `${stylesIds[PebScreen.Mobile]}`,
            },
          },
        },
        {
          type: PebShopEffect.AppendPage,
          target: PebEffectTarget.Shop,
          payload: pageId,
        },
      ],
    };
  }

}
