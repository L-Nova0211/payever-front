import { Component, ChangeDetectionStrategy, OnInit, Input, Inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppThemeEnum, EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { ActionsListService } from '../../../services/actions-list.service';

@Component({
  selector: 'pe-actionable-text-section',
  templateUrl: './actionable-text.component.html',
  styleUrls: ['./actionable-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionableTextSectionComponent implements OnInit {
  @Input() theme: AppThemeEnum;

  actionableText$: Observable<string>;

  constructor(
    private actionsListService: ActionsListService,
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {}

  getWarningIcon(): string {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/icons-transactions/icon-warning.svg`) as string;
  }

  ngOnInit(): void {
    this.actionableText$ = this.actionsListService.actions$.pipe(
      // Take description of first action, as its the first chronological action to perform
      // Actions are ordered by logical next action to perform
      map(actions => actions[0]?.description ?? '')
    );
    this.loadCDNIcon();
  }

  private loadCDNIcon(): void {
    this.matIconRegistry.addSvgIcon('iconWarning', this.domSanitizer.bypassSecurityTrustResourceUrl(
      `${this.env.custom.cdn}/icons-transactions/icon-warning.svg`));
  }
}
