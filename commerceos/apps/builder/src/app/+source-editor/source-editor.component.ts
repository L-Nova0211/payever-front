import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as yaml from 'js-yaml';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { PebShop } from '@pe/builder-core';

import 'brace';
import 'brace/mode/yaml';
import 'brace/snippets/yaml';
import 'brace/ext/language_tools';

@Component({
  selector: 'sandbox-source-editor-root',
  templateUrl: './source-editor.component.html',
  styleUrls: ['./source-editor.component.scss'],
})
export class SandboxSourceEditorComponent implements OnInit {
  editorOptions = {
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: true,
  };

  themeContent = '';

  // small hack when we are loading nike theme always for have any full theme because our viewer requires it
  private readonly editingThemeName = 'nike';
  private readonly editingThemeFrontPage = 'nike-main-page';

  private themeCompiledSubject$ = new BehaviorSubject<PebShop>(null);
  readonly themeCompiled$ = this.themeCompiledSubject$.asObservable();

  private get themeCompiled() {
    return this.themeCompiledSubject$.value;
  }

  private set themeCompiled(themeCompiled) {
    this.themeCompiledSubject$.next(themeCompiled);
  }

  // TODO: (wip code) uncomment it when work on theme opening from raw theme files
  // readonly themeCompiled$ = this.route.data.pipe(
  //   pluck('data'),
  //   map((v) => v as RawTheme),
  //   switchMap((theme: RawTheme) => {
  //     return combineLatest(
  //       theme.info.pages.map(
  //         page => {
  //           if ((page as unknown as string) === 'front') {
  //             this.themeContent = theme.pages[page as unknown as string];
  //           }
  //           return (yaml as any).safeLoad(theme.pages[page as unknown as string]);
  //         },
  //       ),
  //     ).pipe(
  //       map((pages) => ({ ...theme.info, pages })),
  //     );
  //   }),
  // );

  constructor(
    private http: HttpClient,
    public route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.loadFile(`/fixtures/${this.editingThemeName}/theme.yml`).pipe(
      map((content) => (yaml as any).safeLoad(content)),
      switchMap((theme: any) => {
        return combineLatest(
          theme.pages.map(
            page => this.loadFile(`/fixtures/${this.editingThemeName}/page.${page}.yml`).pipe(
              tap((pageContent) => {
                if (page === 'front') {
                  this.themeContent = pageContent;
                }
              }),
              map((content) => (yaml as any).safeLoad(content)),
            ),
          ),
        ).pipe(
          map((pages) => ({ ...theme, pages })),
        );
      }),
      tap(theme => this.themeCompiled = theme),
    ).subscribe();
  }

  onChange(code: string) {
    const pages = this.themeCompiled.pages.map(
      (page: any) => {
        if (page.id === this.editingThemeFrontPage) {
          const updatedFrontPage = (yaml as any).safeLoad(code);
          updatedFrontPage.id = this.editingThemeFrontPage;

          return updatedFrontPage;
        }

        return page;
      },
    );
    // HACK zero delay timeout for 100% recreating viewer component,
    // it needs for cases then we paste code from another theme
    const themeCompiled = this.themeCompiled;
    this.themeCompiled = null;
    setTimeout(() => {
      this.themeCompiled = { ...themeCompiled, pages };
    });
  }

  private loadFile(path) {
    return this.http.get(path, {
      responseType: 'text',
    });
  }

}
