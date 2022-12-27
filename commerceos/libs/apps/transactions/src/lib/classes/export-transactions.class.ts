import { HttpResponse } from '@angular/common/http';
import { Injector } from '@angular/core';
import uniqBy from 'lodash-es/uniqBy';

import { EnvService } from '@pe/common';
import { FolderItem } from '@pe/folders';
import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { ApiService } from '../services/api.service';
import { ActiveColumnInterface } from '../shared/interfaces';

import { FilterTransactionsClass } from './filter-transactions.class';

export class ExportTransactionsClass extends FilterTransactionsClass {
  protected apiService = this.injector.get(ApiService);
  protected envService = this.injector.get(EnvService);
  protected snackbarService = this.injector.get(SnackbarService);
  protected translateService = this.injector.get(TranslateService);

  constructor(
    protected injector: Injector
  ) {
    super(injector);
  }

  onExport(format: string, selectedColumns: ActiveColumnInterface[], selectFolder: FolderItem): void {
    const toggle = this.snackbarService.toggle(true, {
      content: this.translateService.translate('transactions.export.preparing_was_started'),
      duration: 300000,
    });

    const columns: ActiveColumnInterface[] = uniqBy([...this.activeColumns, ...selectedColumns], 'name');

    this.apiService.exportTransactions(format, columns, this.envService?.businessData.name, this.getSearchData(), selectFolder)
      .subscribe(
        (resp: HttpResponse<any>) => {
          toggle.dismiss();
          if (resp.status === 202) {
            this.snackbarService.toggle(true, {
              content: this.translateService.translate('transactions.export.preparing_was_queued'),
              duration: 3000,
            });
          } else {
            let fileName: string;
            const contentDisposition: string = resp.headers.get('content-disposition');
            if (contentDisposition) {
              fileName = contentDisposition.substring(contentDisposition.indexOf('=') + 1);
            } else {
              fileName = `unnamed.${format}`;
            }

            if (window.navigator.msSaveOrOpenBlob) {
              // Internet Explorer
              window.navigator.msSaveOrOpenBlob(new Blob([resp.body], { type: resp.headers.get('content-type') }), fileName);
            } else {
              const el: HTMLAnchorElement = document.createElement('a');
              document.body.appendChild(el);
              el.href = window.URL.createObjectURL(resp.body);
              el.download = fileName;
              el.click();
              el.remove();
            }
          }
        }, error => {
          toggle.dismiss();
          this.snackbarService.toggle(true, {
            content: this.translateService.translate('transactions.export.errors.unknown'),
            duration: 3000,
            iconId: 'icon-alert-24',
            iconSize: 24,
          });
        }
      );
  }
}
