import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { EMPTY, from, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { CreateShopThemeDto, PEB_EDITOR_API_PATH } from '@pe/builder-api';
import { PebAction, PebShopThemeId } from '@pe/builder-core';

import { SandboxMockBackend } from '../../../../dev/editor.api-local';

@Component({
  selector: 'sandbox-clone-theme-dialog',
  templateUrl: './clone-theme.dialog.html',
  styleUrls: ['./clone-theme.dialog.scss'],
})
export class SandboxCloneThemeDialog implements OnInit {

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
    // ...this.fromApiPaths,
    {
      key: 'sandbox',
      value: 'sandbox',
    },
  ];

  private initialApiPathFrom = this.injector.get(PEB_EDITOR_API_PATH);
  private initialApiPathTo = 'sandbox';

  form: FormGroup;

  constructor(
    private injector: Injector,
    private http: HttpClient,
    private dialogRef: MatDialogRef<SandboxCloneThemeDialog>,
    private sandboxMockBackend: SandboxMockBackend,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      token: [this.token, [Validators.required]],
      themeId: ['c850749e-9bef-44f9-b5dc-6a749ce4660c', Validators.required],
      nextName: ['', [Validators.required]],
      apiPathFrom: [this.initialApiPathFrom, [Validators.required]],
      apiPathTo: [this.initialApiPathTo, [Validators.required]],
    });
  }

  onSubmit() {
    this.form.disable();

    if (this.form.value.token) {
      localStorage.setItem('TOKEN', this.form.value.token);
    }

    this.copy(this.form.value);
  }

  private copy({ themeId, nextName, apiPathFrom, apiPathTo, markAllPagesAsMaster }) {

    return this.getActions(apiPathFrom, themeId).pipe(
      switchMap(actions => this.createShopTheme(nextName, actions, apiPathTo)),
      tap(result => console.log(result)),
    ).subscribe();

  }

  private getActions(apiPathFrom: string, themeId: PebShopThemeId): Observable<PebAction[]> {
    return this.http.get<PebAction[]>(
      `${apiPathFrom}/api/theme/${themeId}/actions`,
    );
  }

  private createShopTheme(name: string, actions: PebAction[], apiPathTo: string): Observable<CreateShopThemeDto> {
    if (apiPathTo === 'sandbox') {
      return from(this.sandboxMockBackend.cloneShop(name, actions));
    }

    return EMPTY;
  }

}
