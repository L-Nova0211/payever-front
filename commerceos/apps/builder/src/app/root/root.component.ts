import { Portal } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, takeUntil, tap } from 'rxjs/operators';

import { MessageBus, PeDestroyService } from '@pe/common';

import { SandboxSettingsService } from '../shared/settings/settings.service';

import { SandboxViewerSelectionDialog } from './dialogs/viewer-selection.dialog';

@Component({
  selector: 'peb-sandbox-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class SandboxRootComponent implements OnInit {

  constructor(
    public router: Router,
    public cdr: ChangeDetectorRef,
    public viewContainerRef: ViewContainerRef,
    private settingsService: SandboxSettingsService,
    private messageBus: MessageBus,
    private dialog: MatDialog,
    readonly destroy$: PeDestroyService,
  ) {
  }

  customToolsPortal: Portal<any> = null;

  classFrontPage$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(() => this.router.url === '/'),
  );

  ngOnInit() {
    // TODO: move to service
    this.messageBus.listen('shop.created').pipe(
      tap(shopId => this.router.navigate(['themes', shopId])),
      takeUntil(this.destroy$),
    ).subscribe();

    this.messageBus.listen('shop.open').pipe(
      tap(shopId => this.router.navigate(['editor', shopId])),
      takeUntil(this.destroy$),
    ).subscribe();

    this.messageBus.listen('shop.edit').pipe(
      tap(shopId => this.router.navigate(['editor', shopId])),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  openSettings() {
    this.settingsService.open();
  }

  openViewerDialog() {
    this.dialog.open(SandboxViewerSelectionDialog, {
      backdropClass: 'sandbox-dialog-backdrop',
      panelClass: 'sandbox-dialog-panel',
    });
  }
}
