import { Directive, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PeDestroyService } from '@pe/common';
import { SnackbarService } from '@pe/snackbar';

@Directive({
  providers: [
    PeDestroyService,
  ],
})
export abstract class BaseSettingsComponent implements OnInit {

  isModal: boolean;
  protected activatedRoute: ActivatedRoute = this.injector.get(ActivatedRoute);
  protected router: Router = this.injector.get(Router);
  protected snackBarService: SnackbarService = this.injector.get(SnackbarService);
  protected destroyed$: PeDestroyService = this.injector.get(PeDestroyService);

  constructor(protected injector: Injector) {
  }

  ngOnInit(): void {
    this.isModal = this.activatedRoute?.snapshot.data['modal'] || this.activatedRoute?.parent?.snapshot.data['modal'];
  }

  backToModal(): void {
    // TODO pass payments,settings as param somehow
    this.router.navigate([ '../../panel-settings' ], { relativeTo: this.activatedRoute });
  }

  protected showError(error: string): void {
    this.snackBarService.toggle(true, {
      content: error || 'Unknown error',
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24,
    });
  }
}
