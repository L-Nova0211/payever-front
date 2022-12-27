import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Inject,
  OnInit,
  Output,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

import { WallpaperService } from '@pe/wallpaper';

import { Headings, HEADINGS_DATA, PeConfirmationScreenIconTypesEnum } from './confirm-screen-heading.model';

@Component({
  selector: 'pe-confirm-dialog',
  templateUrl: './confirm-screen.component.html',
  styleUrls: ['./confirm-screen.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationOverlayScreenComponent implements OnInit {
  @Output() confirmation = new EventEmitter<boolean>();

  public readonly iconTypes = PeConfirmationScreenIconTypesEnum;

  constructor(
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    private wallpaperService: WallpaperService,
    @Inject(HEADINGS_DATA) public headingsData: Headings
  ) {
    this.matIconRegistry.addSvgIcon(
      'warning-icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/warning-icon.svg'),
    );
  }

  public get confirmLoading$(): BehaviorSubject<boolean> {
    return this.headingsData?.confirmLoading$;
  }

  public get confirmBtnClass(): string {
    return this.headingsData?.confirmBtnType === 'confirm'
      ? 'confirmation-screen__content-button_confirm'
      : 'confirmation-screen__content-button_warn';
  }

  ngOnInit(): void {
    this.wallpaperService.showDashboardBackground(false);
  }

  /** Closes confirm dialog with true */
  onConfirm(): void {
    if (this.confirmLoading$?.value) {
      return;
    }

    this.confirmLoading$?.next(true);
    this.confirmation.emit(true);
  }

  /** Closes confirm dialog with false */
  onDecline(): void {
    if (this.confirmLoading$?.value) {
      return;
    }

    this.headingsData?.confirmLoading$?.next(false);
    this.confirmation.emit(false);
  }

  @HostListener('keydown.esc')
  public onEsc() {
    this.onDecline();
  }
}
