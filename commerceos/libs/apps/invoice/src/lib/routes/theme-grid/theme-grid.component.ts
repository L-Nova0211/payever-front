import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppThemeEnum, EnvService, MessageBus } from '@pe/common';

import { InvoiceEnvService } from '../../services/invoice-env.service';

@Component({
  selector: 'pe-theme-grid',
  templateUrl: './theme-grid.component.html',
  styleUrls: ['./theme-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PeThemeGridComponent {
  theme = this.envService.businessData?.themeSettings?.theme ?
    AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default

  constructor(
    private route: ActivatedRoute,
    private messageBus: MessageBus,
    private envService: EnvService,
    private env: InvoiceEnvService,

  ) {
 }

  onThemeInstalled() {
    this.messageBus.emit('invoice.navigate.edit', this.env.invoiceId);
  }
}
