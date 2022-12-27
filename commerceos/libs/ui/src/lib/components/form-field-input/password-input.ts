import { Directive, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, fromEvent, ReplaySubject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PePasswordTooltipRef, PePasswordTooltipService } from './password-input-tooltip.service';

@Directive({
  selector: `input[pePasswordInput]`,
})
export class PePasswordInputDirective implements OnInit, OnDestroy {
  dialogRef: PePasswordTooltipRef;
  isFocused = new BehaviorSubject<boolean>(false);
  inputValue$ = new BehaviorSubject<string>('');
  inputEvent$;
  protected destroyed$ = new ReplaySubject<boolean>();
  constructor(private elRef: ElementRef<HTMLInputElement>, private passwordTooltip: PePasswordTooltipService) { }

  @HostListener('focus', ['$event']) onFocus(e) {
    this.isFocused.next(true);
  }

  @HostListener('blur', ['$event']) onblur(e) {
    this.isFocused.next(false);
  }

  ngOnInit() {
    fromEvent(this.elRef.nativeElement, 'input').pipe(
      tap((event: any) => {
        const value = event.target.value;

        this.inputValue$.next(value);

        if (this.mustHave(value)) {
          if (this.dialogRef.isClose()) {
            this.dialogRef = this.passwordTooltip.open(this.elRef, this.inputValue$);
          }
        } else {
          if (!this.dialogRef.isClose()) {
            this.dialogRef.close();
          }
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.isFocused.subscribe((value) => {
      if (value && this.mustHave(this.inputValue$.value)) {
        const twoCols = this.elRef.nativeElement.parentElement.parentElement.parentElement.parentElement.parentElement;
        if (twoCols) {
          this.dialogRef = this.passwordTooltip.open(twoCols, this.inputValue$);
        } else {
          this.dialogRef = this.passwordTooltip.open(this.elRef, this.inputValue$);
        }
      } else {
        if (this.dialogRef) {
          this.dialogRef.close();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private mustHave(value: string) {
    if (
      value.length >= 8 &&
      value.match(/[A-Z]/) && value.match(/[a-z]/) &&
      value.match(/\d/) &&
      value.match(/[!@#$%^&*(),.?":{}|<>]/)
    ) {
      return false;
    }

    return true;
  }
}
