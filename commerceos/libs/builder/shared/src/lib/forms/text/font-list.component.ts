import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { merge, Observable, Subject } from 'rxjs';
import { map, scan, startWith } from 'rxjs/operators';

import { pebFontFamilies } from '@pe/builder-core';
import { PeDestroyService } from '@pe/common';

import { ListItem, PebFontFamilyItem } from './font-list';


@Component({
  selector: 'peb-font-list',
  template: `
    <cdk-virtual-scroll-viewport itemSize="35" class="font-list scrollbar" pebAutoHideScrollBar>
      <ng-container *cdkVirtualFor="let item of items$ | async; trackBy: trackByIndex">
        <ng-container [ngSwitch]="item.collapsed !== undefined">
          <div
            *ngSwitchCase="true"
            [class.font__item--collapsed]="item.collapsed"
            class="font__item"
            (click)="toggleCollapse(item)"
          >
            <mat-icon svgIcon="triangle-right" class="font__item__icon font__item__icon--arrow"></mat-icon>
            <span class="font__item__title" [ngStyle]="item.style">{{ item.title }}</span>
            <mat-icon
              *ngIf="item.selected && item.collapsed" svgIcon="checkmark"
              class="font__item__icon font__item__icon--checkmark"
            ></mat-icon>
          </div>

          <label *ngSwitchCase="false" class="font__item">
            <span class="font__item__title" [ngStyle]="item.style">{{ item.title }}</span>
            <mat-icon
              *ngIf="item.selected" svgIcon="checkmark"
              class="font__item__icon font__item__icon--checkmark"
            ></mat-icon>
            <input type="radio" [formControl]="formControl" [value]="item.value" hidden/>
          </label>
        </ng-container>
      </ng-container>
    </cdk-virtual-scroll-viewport>
    <div class="redraw-fix"></div>
  `,
  styleUrls: [
    './font-list.component.scss',
  ],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebFontListComponent implements OnInit {

  @Input() formControl: FormControl;

  collapse$ = new Subject<PebFontFamilyItem>();

  fontList = pebFontFamilies.sort((a, b) => a.name.localeCompare(b.name))
    .map(fontFamily => new PebFontFamilyItem(fontFamily));

  items$: Observable<ListItem[]>;

  @HostBinding('class.font-list') hostClass = true;

  constructor(public readonly destroy$: PeDestroyService) {
  }

  ngOnInit(): void {
    this.items$ = merge(
      this.collapse$.pipe(
        map(item => ({ ...item, collapsed: !item.collapsed })),
      ),
      this.formControl.valueChanges,
    ).pipe(
      startWith(this.formControl.value),
      scan((acc, value) => {
        if (!Array.isArray(value.fontFamily)) {
          const index = acc.findIndex(item => item.fontFamily === value.fontFamily);

          if (value.collapsed !== undefined) {
            acc[index].collapsed = value.collapsed;
          }

          acc[index].selected = index !== -1;
        }

        return acc;
      }, this.fontList),
      map(fontList => fontList.reduce((acc, fontFamily) => {
        fontFamily.selected = fontFamily.fontFamily === this.formControl.value.fontFamily;
        acc.push(fontFamily);
        if (!fontFamily.collapsed) {
          fontFamily.variants.forEach((v) => {
            v.selected = fontFamily.selected
              ? v.value.fontWeight === this.formControl.value.fontWeight
                && v.value.italic === this.formControl.value.italic
              : false;
          });
          acc.push(...fontFamily.variants);
        }

        return acc;
      }, [])),
    );
  }

  trackByIndex(index: number): any {
    return index;
  }

  toggleCollapse(item: any) {
    this.collapse$.next(item);
  }
}
