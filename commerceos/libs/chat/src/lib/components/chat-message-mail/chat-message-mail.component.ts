import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { delay, takeUntil, tap } from 'rxjs/operators';

import { PebLanguage, PebScreen, pebScreenDocumentWidthList } from '@pe/builder-core';
import { MessageBus } from '@pe/common';

@Component({
  selector: 'pe-chat-message-mail',
  templateUrl: './chat-message-mail.component.html',
  styleUrls: ['./chat-message-mail.component.scss'],
})
export class PeChatMessageMailComponent implements AfterViewInit, OnDestroy {

  @Input() content: any;
  @Input() width: number;

  @ViewChild('renderer', { static: false }) renderer: ElementRef<HTMLElement>;

  readonly pebScreen = PebScreen;
  readonly defaultLanguage = PebLanguage.English;

  scale$ = new BehaviorSubject<number>(1);

  get snapshot(): any {
    let snapshot = null;
    try {
      snapshot = JSON.parse(this.content.replace('<span class="sign">sign name</span>', ''));
    } catch (e) {}

    return snapshot;
  }

  readonly destroy$ = new Subject<void>();
  readonly language$ = new BehaviorSubject<PebLanguage>(this.defaultLanguage);

  constructor(
    private cdr: ChangeDetectorRef,
    private messageBus: MessageBus,
  ) { }

  ngAfterViewInit(): void {
    this.language$.next(this.snapshot?.application?.data?.defaultLanguage ?? PebLanguage.English);
    const scale = () => {
      this.snapshot && this.scale$
        .next(this.renderer.nativeElement.clientWidth / pebScreenDocumentWidthList[PebScreen.Desktop]);
      this.cdr.detectChanges();
    };

    this.messageBus.listen('message.toggle.sidebar').pipe(
      delay(350),
      tap(scale)
    ).subscribe();

    setTimeout(scale, 0);

    fromEvent(window, 'resize').pipe(
      tap(scale),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
