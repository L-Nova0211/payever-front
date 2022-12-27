import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';


@Component({
  selector: 'password-must',
  templateUrl: './password-must.component.html',
  styleUrls: ['./password-must.component.scss'],
  animations: [
    trigger('trigger', [
      state('collapsed', style({ height: '0px' })),
      state('expanded', style({ height: '*' })),
      transition('* <=> *', [ animate('0.15s cubic-bezier(0.4, 0, 1, 1)') ]),
    ])
  ]
})
export class PasswordMustComponent implements OnInit, OnDestroy {

  destroyed$ = new Subject<boolean>();

  @Input() control: FormControl;
  @Input() focused: BehaviorSubject<boolean>;
  @Input() show = false;

  @Output() done = new EventEmitter();

  list = [
    { label: 'password.tooltip.min_length', active: false },
    { label: 'password.tooltip.letters', active: false },
    { label: 'password.tooltip.number', active: false },
    { label: 'password.tooltip.spec_char', active: false },
  ];

  ngOnInit() {
    this.focused.pipe(
      tap((value: boolean) => {
        this.show = this.list.every(item => item.active !== true) && value;
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.control.valueChanges.pipe(
      tap(value => {
        this.checkList(value);
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  checkList(value: string) {
    this.list[0].active = value.length >= 8;
    this.list[1].active = value.match(/[A-Z]/) && value.match(/[a-z]/) ? true : false;
    this.list[2].active = value.match(/\d/) ? true : false;
    this.list[3].active = value.match(/[!@#$%^&*(),.?":{}|<>]/) ? true : false;

    this.show = this.list.some(item => item.active !== true);
  }
}
