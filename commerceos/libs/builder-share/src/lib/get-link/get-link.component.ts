import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import { PeDestroyService } from '@pe/common';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';

import { PeBuilderShareApi } from '../builder-share.api';
import { getShareLink, PeBuilderShareAccess } from '../builder-share.constants';

@Component({
  selector: 'pe-get-link',
  templateUrl: './get-link.component.html',
  styleUrls: ['./get-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeBuilderShareGetLinkComponent implements OnInit {

  readonly link$ = new BehaviorSubject<string>('');

  constructor(
    private clipboard: Clipboard,
    @Inject(PE_OVERLAY_DATA) private data: any,
    private destroy$: PeDestroyService,
    private snackbarService: SnackbarService,
    private api: PeBuilderShareApi,
    private pebEnvService: PebEnvService,
  ) { }

  ngOnInit(): void {
    this.api.customAccess(PeBuilderShareAccess.Editor).pipe(
      tap((access) => {
        this.link$.next(getShareLink(access?.id, this.pebEnvService.businessId, this.pebEnvService.applicationId, this.data.appType));
      }),
    ).subscribe();
    this.data?.done$?.pipe(
      tap(() => {
        if (this.link$.value && this.clipboard.copy(this.link$.value)) {
          this.snackbarService.toggle(true, {
            content: 'Link is copied',
          });
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

}
