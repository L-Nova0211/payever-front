import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { IntegrationsStateService, IntegrationCategory, IntegrationInfoWithStatusInterface } from '../../../shared';
import { PaymentsStateService } from '../../../shared';

@Component({
  selector: 'integration-button',
  templateUrl: './integration-button.component.html',
  styleUrls: ['./integration-button.component.scss'],
})
export class IntegrationButtonComponent implements OnDestroy {

  @Input() size = 'xs';
  @Input() integration: IntegrationInfoWithStatusInterface;
  @Output() saveReturn: EventEmitter<IntegrationCategory> = new EventEmitter();

  isInstallingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isInstalling$: Observable<boolean> = this.isInstallingSubject.asObservable();
  protected destroyed$: Subject<boolean> = new Subject();

  constructor(private _location: Location,
              private integrationsStateService: IntegrationsStateService,
              private paymentsStateService: PaymentsStateService
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  get name(): string {
    return this.integration && this.integration.name;
  }

  get installed(): boolean {
    return this.integration && this.integration._status && this.integration._status.installed;
  }

  installIntegration(event: Event): void {
    event.stopPropagation();

    this.saveReturn.emit(this.integration.category);

    if (this.installed) {
      this.paymentsStateService.openInstalledIntegration(this.integration);
    } else {
      if (!this.isInstallingSubject.getValue()) {
        this.isInstallingSubject.next(true);
        this.paymentsStateService.installIntegrationAndGoToDone(true, this.integration).subscribe(() => {
        }, (error) => {
          console.error('Cant install/uninstall', error);
          this.paymentsStateService.handleError(error, true);
          this.isInstallingSubject.next(false);
        });
      }
    }
  }
}
