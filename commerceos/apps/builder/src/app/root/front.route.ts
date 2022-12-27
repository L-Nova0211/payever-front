import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as yaml from 'js-yaml';
import { BehaviorSubject, combineLatest, EMPTY, forkJoin, from, Observable, of } from 'rxjs';
import { map, share, switchMap, tap } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder-api';
import { PebEnvService, pebGenerateId, PebShop, PebShopData } from '@pe/builder-core';

import { RawTheme, SandboxDBService } from '../../dev/sandbox-idb.service';
import { SandboxSettingsService } from '../shared/settings/settings.service';

import { SandboxAddPageToThemeDialog } from './dialogs/add-page-to-theme/add-page-to-theme.dialog';
import { SandboxAddThemeFromThemesDialog } from './dialogs/add-theme-from-themes/add-theme-from-themes.dialog';
import { SandboxCloneThemeDialog } from './dialogs/clone-theme/clone-theme.dialog';


interface ThemeFiles {
  [name: string]: string;
}

@Component({
  selector: 'peb-sandbox-root',
  templateUrl: './front.route.html',
  styleUrls: ['./front.route.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SandboxFrontRoute {
  @ViewChild('shopImportInput') shopImportInput: ElementRef;
  @ViewChild('rawThemeImportInput') rawThemeImportInput: ElementRef;

  refresh$ = new BehaviorSubject<boolean>(true);

  shops$: Observable<any> = this.refresh$.pipe(
    switchMap(() => this.api.getAllAvailableThemes()),
    share(),
  );

  rawThemes$: Observable<any> = this.refresh$.pipe(
    switchMap(() => this.dbService.getAllRawThemes()),
    share(),
  );

  templates$: Observable<any> = this.loadYml('/fixtures/index.yml');

  trackShopFn = (e) => e.id;

  constructor(
    private api: PebEditorApi,
    private dbService: SandboxDBService,
    private http: HttpClient,
    private settingsService: SandboxSettingsService,
    private router: Router,
    private envService: PebEnvService,
    private dialog: MatDialog,
  ) {}

  openSettings(): void {
    this.settingsService.open();
  }

  addThemeFromThemesDialog() {
    return this.dialog.open(SandboxAddThemeFromThemesDialog);
  }

  cloneThemeDialog() {
    return this.dialog.open(SandboxCloneThemeDialog);
  }

  addPageToThemeDialog() {
    return this.dialog.open(SandboxAddPageToThemeDialog);
  }

  async resetLocalDB() {
    await this.settingsService.resetLocalDB();
  }

  private loadYml(path) {
    return this.http.get(path, {
      responseType: 'text',
    }).pipe(
      map((content) => (yaml as any).safeLoad(content)),
    );
  }

  @HostListener('document:keydown.control.shift.c', ['$event'])
  @HostListener('document:keydown.meta.shift.c', ['$event'])
  handleCreateThemeHotkey(e: KeyboardEvent) {
    e.preventDefault();
    this.router.navigate(['editor/new']).then(/* do nothing */);
  }

  onShopThemeImport($event: Event): void {
    const target = $event.target as HTMLInputElement;

    this.getThemeFiles(target.files).pipe(
      tap(() => this.shopImportInput.nativeElement.value = ''),
      switchMap((themeFiles: ThemeFiles) => {
        return this.fetchFixtureShop(themeFiles).pipe(
          map(shopData => ({ name: shopData.name, content: shopData.shop })),
        );
      }),
      switchMap((data: any) => {
        return data
          ? this.api.createShopTheme({
            name: data.name,
            content: data.content,
          })
          : of(null);
      }),
      map((shop: any) => {
        return this.router.navigate(shop ? ['editor', shop.id] : ['/']);
      }),
    ).subscribe();
  }

  pickShop(shop): void {
    this.router.navigate(['editor', shop.id]).then(() => this.envService.shopId = shop.id);
  }

  onRawThemeImport($event: Event): void {
    const target = $event.target as HTMLInputElement;

    this.getThemeFiles(target.files).pipe(
      tap(() => this.rawThemeImportInput.nativeElement.value = ''),
      switchMap((themeFiles: ThemeFiles) => this.fetchRawTheme(themeFiles)),
      switchMap((rawTheme: RawTheme) => this.dbService.saveRawTheme(rawTheme)),
      map((theme: any) => {
        return this.router.navigate(theme ? ['source-editor', theme.id] : ['/']);
      }),
    ).subscribe();
  }

  private fetchFixtureShop(themeFiles: ThemeFiles): Observable<{ name: string, shop: PebShop }> {
    return combineLatest(Object.keys(themeFiles).map(fileName => this.fetchYml<any>(themeFiles, fileName))).pipe(
      map((pages: any) => {
        const nextPages = pages.map(p => ({ ...p, id: pebGenerateId() }));

        return {
          name: 'Theme',
          shop: {
            id: pebGenerateId(),
            data: {} as PebShopData,
            routing: nextPages.map((p, index) => ({ routeId: pebGenerateId(), url: `/${index}`, pageId: p.id })),
            context: {},
            pages: nextPages,
          },
        };
      }),
    );
  }

  private fetchRawTheme(themeFiles: ThemeFiles): Observable<RawTheme> {
    return this.fetchYml<any>(themeFiles, `theme.yml`).pipe(
      map(theme => {
        const pages = {};
        theme.pages.forEach(pageName => {
          pages[pageName] = themeFiles[`${pageName}.yml`];
        });

        return {
          id: pebGenerateId(),
          info: theme,
          pages,
        };
      }),
    );
  }

  private fetchYml<T>(themeFiles: ThemeFiles, filename: string): Observable<T> {
    return of(themeFiles[filename]).pipe(
      map(v => (yaml as any).safeLoad(v) as T),
    );
  }

  private getThemeFiles(files: FileList): Observable<ThemeFiles> {
    if (files && files.length) {
      return forkJoin(Array.from(files).map(file => {
        return from(file.text()).pipe(
          map(content => ({
            name: file.name,
            content,
          })),
        );
      })).pipe(
        map(themes => {
          const themeFiles: ThemeFiles = {};
          themes.forEach(theme => {
            themeFiles[theme.name] = theme.content;
          });

          return themeFiles;
        }),
      );
    }

    return EMPTY;
  }
}
