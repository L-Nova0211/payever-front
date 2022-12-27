import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';

import { PeOverlayWidgetService } from '@pe/overlay-widget';

import { DataGridService } from './data-grid.service';
import { IntegrationsStateService } from './integrations-state.service';
import { PaymentsStateService } from './payments-state.service';


@Injectable()
export class UninstallService {

  constructor(
    private dataGridService: DataGridService,
    private integrationsStateService: IntegrationsStateService,
    private paymentsStateService: PaymentsStateService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  uninstall(integration, isLoading = null): void {
    this.peOverlayWidgetService.close();
    isLoading?.next(true);
    this.paymentsStateService.installIntegrationAndGoToDone(false, integration).pipe(
      take(1),
      tap((data) => {
        this.router.navigate(
          [this.router.url + `/${integration.category}/integrations/${integration.name}/done`],
          { relativeTo: this.route }
        ).then(() => {
          const gridItems = this.dataGridService.gridItems$.value;
          const item = gridItems?.find(i => i.id === integration._id);

          if (item) {
            item.cardItem.status.installed = data.installed;
          }

          this.dataGridService.chooseFiltersEmit.emit();
        });
        isLoading?.next(false);
      })
    ).subscribe();
  }

}
