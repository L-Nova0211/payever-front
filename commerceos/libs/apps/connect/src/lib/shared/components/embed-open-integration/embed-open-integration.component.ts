import { Component, Injector, Input, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';

import { TranslationLoaderService } from '@pe/i18n';

import { i18nDomains } from '../../interfaces';
import { IntegrationsStateService, PaymentsStateService, NavigationService } from '../../services';

@Component({
  selector: 'connect-embed-open-integration',
  templateUrl: './embed-open-integration.component.html',
})
export class EmbedOpenIntegrationComponent implements OnInit {

  @Input() backPath: string = null;
  @Input() integration: string = null;

  protected translationLoaderService: TranslationLoaderService = this.injector.get(TranslationLoaderService);
  protected navigationService: NavigationService = this.injector.get(NavigationService);
  protected paymentsStateService: PaymentsStateService = this.injector.get(PaymentsStateService);
  protected integrationsStateService: IntegrationsStateService = this.injector.get(IntegrationsStateService);

  constructor(protected injector: Injector) {
  }

  ngOnInit(): void {
    combineLatest([
      this.integrationsStateService.getIntegrationOnce(this.integration),
      this.translationLoaderService.loadTranslations(i18nDomains),
    ]).subscribe((data) => {
      this.saveReturn();
      this.paymentsStateService.openInstalledIntegration(data[0]);
    });
  }

  saveReturn(): void {
    this.navigationService.saveReturn(this.backPath);
  }
}
