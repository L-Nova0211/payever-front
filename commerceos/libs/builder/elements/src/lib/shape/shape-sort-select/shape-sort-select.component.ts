import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { take, tap } from 'rxjs/operators';

import { PEB_DEFAULT_FONT_SIZE } from '@pe/builder-core';
import { PebAbstractStyledElement } from '@pe/builder-renderer';


@Component({
  selector: 'peb-shape-sort-select',
  templateUrl: './shape-sort-select.component.html',
  styleUrls: ['./shape-sort-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShapeSortSelectElement extends PebAbstractStyledElement {

  @Input() params: {
    label: string,
    options: Array<{ label: string, value: string, filed: string, selected?: boolean }>
  };

  @Output() interaction = new EventEmitter<{
    type: string,
    options: Array<{ label: string, value: string, filed: string, selected?: boolean }>
  }>();


  @ViewChild('filterRef') filterRef: ElementRef;
  @ViewChild('filterMenuTrigger', { read: MatMenuTrigger }) filterMenuTrigger: MatMenuTrigger;

  protected get elements(): { [p: string]: HTMLElement | HTMLElement[] } {
    return {
      host: this.nativeElement,
      filter: this.filterRef?.nativeElement,
    };
  }

  get hostClientWidth(): number {
    return this.elementRef.nativeElement.clientWidth;
  }

  protected get mappedStyles() {
    return {
      host: {
        padding: 2,
      },
      filter: {
        fontSize: PEB_DEFAULT_FONT_SIZE,
        padding: 10,
      },
    };
  }

  openMenu(): void {
    if (this.options?.interactions) {
      this.filterMenuTrigger.openMenu();
      this.filterMenuTrigger.menuClosed.pipe(
        take(1),
        tap(() => {
          this.interaction.emit({ type: 'sortSelect', options: this.params.options });
        }),
      ).subscribe();
    }
  }

  reset(e: Event): void {
    e.stopPropagation();
    this.params.options.forEach(o => o.selected = false);
  }

  selectOption(e: Event, option): void {
    e.stopPropagation();
    this.setSelected(!option.selected, option);
  }

  saveOptions(e: Event): void {
    e.stopPropagation();
    this.filterMenuTrigger.closeMenu();
  }

  setSelected(selected: boolean, option): void {
    if (selected) {
      this.params.options.forEach(o => o.selected = o === option);
    } else {
      option.selected = selected;
    }
  }

}
