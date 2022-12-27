import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Injector, OnDestroy, OnInit, Output } from '@angular/core';
import { assign, forEach } from 'lodash-es';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SnackBarService } from '@pe/forms';
import { TranslateService } from '@pe/i18n';

import {
  IntegrationCategory, IntegrationInfoWithStatusInterface,
} from '../../interfaces';
import { PaymentsStateService, IntegrationsStateService } from '../../services';

interface GroupInterface {
  group?: string;
  icon?: string;
  title?: string;
  integrations: IntegrationInfoWithStatusInterface[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'install-payments-list',
  templateUrl: './install-payments-list.component.html',
  styleUrls: ['./install-payments-list.component.scss'],
})
export class InstallPaymentsListComponent implements OnInit, OnDestroy {

  items: GroupInterface[] = [];
  installings: {[key: string]: boolean} = {};

  @Output() onLoadings: EventEmitter<number> = new EventEmitter();
  @Output() onInstalledCount: EventEmitter<number> = new EventEmitter();
  @Output() onOpenIntegration: EventEmitter<IntegrationInfoWithStatusInterface> = new EventEmitter();

  private readonly groupsPrefixes = {
    santander_: 'santander',
    payex_: 'payex',
    stripe: 'stripe',
  };

  private readonly groupTitles = {
    payex: 'integrations.payments.groups.payex',
    stripe: 'integrations.payments.groups.stripe',
    santander: 'integrations.payments.groups.santander',
  };

  private cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);
  private snackBarService: SnackBarService = this.injector.get(SnackBarService);
  private integrationsStateService: IntegrationsStateService = this.injector.get(IntegrationsStateService);
  private translateService: TranslateService = this.injector.get(TranslateService);
  private paymentsStateService: PaymentsStateService = this.injector.get(PaymentsStateService);

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject();

  constructor(private injector: Injector) {
  }

  get numLoadings(): number {
    let count = 0;
    forEach(this.installings, value => count += value ? 1 : 0);

    return count;
  }

  get numInstalled(): number {
    let count = 0;
    forEach(this.items, (item) => {
      forEach(item.integrations, (integration) => {
        count += (integration && integration._status && integration._status.installed) ? 1 : 0;
      });
    });

    return count;
  }

  ngOnInit(): void {
    this.integrationsStateService.getCategoriesIntegrations(false, [IntegrationCategory.Payments]).pipe(
      takeUntil(this.destroyed$)
    ).subscribe((data: IntegrationInfoWithStatusInterface[]) => {
      forEach(data, (integration) => {
        let group: string = null;
        forEach(this.groupsPrefixes, (v: string, k: string) => {
          if (integration.name.indexOf(k) === 0) {group = v;}
        });

        let item: GroupInterface = this.items.find((it) => {
          return (group && it.group === group) || it.integrations.find(int => int.name === integration.name)
        });
        if (!item) {
          item = {
            group: group,
            icon: group ? integration.displayOptions.icon : null,
            title: group ? this.groupTitles[group] : null,
            integrations: [],
          };
          this.items.push(item);
        }

        if (group) {
          const inGroup = item.integrations.find(int => int.name === integration.name);
          if (inGroup) {
            assign(inGroup, integration);
          } else {
            item.integrations.push(integration);
          }
        } else {
          item.integrations = [integration];
        }
      });
      this.emitInstalledCount();
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  install(integration: IntegrationInfoWithStatusInterface): void {
    if (this.numLoadings > 0) {
      return;
    }
    this.setLoadings(integration.name, true);
    this.integrationsStateService.installIntegration(integration.name, true).subscribe(() => {
      const title = this.translateService.translate(integration.displayOptions.title);
      this.snackBarService.show(
        this.translateService.translate('integrations.statuses.integration_was_installed', { integration: title })
      );
      // this.setLoadings(integration.name, false);
      this.emitInstalledCount();
      this.onOpenIntegration.emit(integration);
    }, (err) => {
      this.snackBarService.show(err.message || 'Unknown error');
      this.setLoadings(integration.name, false);
    });
  }

  isInstalling(integration: IntegrationInfoWithStatusInterface): boolean {
    return !!this.installings[integration.name];
  }

  openIntegration(integration: IntegrationInfoWithStatusInterface, queryParams: object = {}): void {
    this.setLoadings(integration.name, true);
    this.onOpenIntegration.emit(integration);
  }

  private setLoadings(name: string, value: boolean): void {
    this.installings[name] = value;
    this.onLoadings.emit(this.numLoadings);
  }

  private emitInstalledCount(): void {
    this.onInstalledCount.emit(this.numInstalled);
  }
}
