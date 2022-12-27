import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { takeUntil, tap } from 'rxjs/operators';

import { EnvService, PeDestroyService } from '@pe/common';

@Component({
  selector: 'pe-message-app',
  templateUrl: './message-app.component.html',
  styleUrls: ['./message-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [PeDestroyService],
})
export class PeMessageAppComponent implements OnInit, AfterViewInit {
  theme: string;
  @ViewChild(TemplateRef) ref;
  private dialogRef: any;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    protected envService: EnvService,
    readonly destroy$: PeDestroyService,
  ) { }

  ngOnInit(){
    (window as any)?.PayeverStatic?.SvgIconsLoader?.loadIcons([
      'social-facebook-12',
      'social-instagram-12',
      'social-live-chat-12',
      'social-telegram-18',
      'social-whatsapp-12',
      'products-app-16',
      'file-14',
    ]);


  }

  ngAfterViewInit(): any {
    this.dialogRef = this.dialog.open(this.ref, {});
    this.router.events.pipe(
      tap((router: any) => {
        if (router.url && router.url.split('/').slice(-1).pop() === 'contacts') {
          this.dialogRef.close(false);
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe()
  }

  closeMessageDialog(): any {
    this.dialogRef.close(false);
    const businessId = this.envService.businessId || this.envService.businessData._id;
    this.router.navigate([
      `/business/${businessId}/contacts`,
    ]);
  }
}
