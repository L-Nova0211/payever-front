import { Component, ElementRef, Output, EventEmitter, AfterViewInit, Input, ViewChild, NgZone, Inject, OnChanges, ChangeDetectorRef } from '@angular/core';

import { API_KEY } from '../settings';
import { ReCaptchaService } from '../services';
import { ReCaptchaThemeEnum, ReCaptchaSizeEnum } from '../interfaces';

@Component({
  selector: 'pe-recaptcha',
  templateUrl: './recaptcha.component.html'
})
export class ReCaptchaComponent implements AfterViewInit, OnChanges {

  @Input() key: string = null;
  @Input() theme: ReCaptchaThemeEnum = ReCaptchaThemeEnum.Light;
  @Input() size: ReCaptchaSizeEnum = ReCaptchaSizeEnum.Compact;
  @Output() verified: EventEmitter<string | false> = new EventEmitter<string | false>();

  @ViewChild('captchaRef2') captchaRef2: ElementRef;

  isShowing: boolean = true;
  isReady: boolean = false;
  readonly defaultKey = API_KEY;
  private reCaptchaId: string = null;

  constructor(
    private reCaptchaService: ReCaptchaService,
    private elementRef: ElementRef,
    @Inject('RECAPTCH_KEY') private recaptchaKey,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    @Inject('Window') private window: Window,
  ) {
    this.window = this.window || window;
  }

  ngAfterViewInit(): void {
    this.reCaptchaService.initialized$().subscribe(() => {
      this.isReady = true;
      this.redraw();
    });
  }

  ngOnChanges(): void {
    this.redraw();
  }

  redraw(): void {
    if (this.isReady) {
      const grecaptcha = (window as any).grecaptcha;
      if ( grecaptcha ) {
        // We always hide before showing to avoid error:
        // ERROR Error: reCAPTCHA has already been rendered in this element
        this.isShowing = false;
        this.cdr.detectChanges();
        this.isShowing = true;
        this.cdr.detectChanges();
        if (this.captchaRef2 && this.captchaRef2.nativeElement) {
          this.reCaptchaId = grecaptcha.render(this.captchaRef2.nativeElement, {
            sitekey: this.key || this.recaptchaKey || this.defaultKey,
            callback: (token: string) => this.verified.emit(token),
            'expired-callback': () => this.verified.emit(false)
          });
        }
      }
    }
  }

}
