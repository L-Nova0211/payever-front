import { CdkPortal } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectionStrategy, Component, Injector, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';

import { PebEditorApi, PEB_EDITOR_API_PATH } from '@pe/builder-api';
import { applyMigrations, PebTheme } from '@pe/builder-core';

import { SandboxMockBackend } from '../../dev/editor.api-local';
import { SandboxRootComponent } from '../root/root.component';

//git1
@Component({
  selector: 'sandbox-editor-route',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SandboxEditorRootComponent implements AfterViewInit, OnDestroy {
  @ViewChild(CdkPortal) editorTools: CdkPortal;

  data$ = this.route.data.pipe(
    map(data  => data.shop),
    switchMap(async (value) => {
      value.snapshot = await applyMigrations(value.snapshot);

      return value;
    }),
  );

  constructor(
    public route: ActivatedRoute,
    public root: SandboxRootComponent,
    public api: PebEditorApi,
    private http: HttpClient,
    private injector: Injector,
  ) {}

  ngAfterViewInit() {
    if (this.api instanceof SandboxMockBackend) {
      return;
    }

    this.root.customToolsPortal = this.editorTools;
    this.root.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.root.customToolsPortal = null;
  }

  get theme(): PebTheme {
    return (this.route.data as any).value.shop.theme;
  }

  get themeType() {
    const themeType = this.theme.type;

    return themeType || 'not-set';
  }

  setTemplateThemeType() {
    if (this.theme.type) {
      return;
    }

    if (!confirm(`
      This will transform theme type to template.
      Do you want to continue?
    `)) {
      return;
    }

    const TOKEN = localStorage.getItem('TOKEN');

    const apiPath = this.injector.get(PEB_EDITOR_API_PATH);
    this.http.post(
      `${apiPath}/api/${this.theme.id}/template`,
      {
        codeGroup: 'BUSINESS_PRODUCT_RETAIL_B2C',
        codeItem: 'BRANCHE_FASHION',
        order: 1,
        type: 'product',
      },
      { headers: { Authorization: `Bearer ${TOKEN}` } },
    ).toPromise().then(() => {
      location.reload();
    });
  }
}
