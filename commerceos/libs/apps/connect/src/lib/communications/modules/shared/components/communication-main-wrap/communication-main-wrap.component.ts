import { Component, Injector, Input, QueryList, ViewChildren, AfterViewChecked } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


import { BaseAccordionComponent } from '../base-accordion.component';

@Component({
  selector: 'communication-main-wrap',
  templateUrl: './communication-main-wrap.component.html',
  styleUrls: ['./communication-main-wrap.component.scss'],
})
export class CommunicationMainWrapComponent extends BaseAccordionComponent implements AfterViewChecked {

  @ViewChildren('panel') panels: QueryList<MatExpansionPanel>;

  @Input('name') set setName(name: string) {
    if (this.name !== name) {
      this.name = name;
    }
  }

  @Input() title: string = null;

  name: string = null;
  private showFirstPanelRequired = true;

  constructor(injector: Injector) {
    super(injector);
  }

  ngAfterViewChecked() {
    if (this.panels && this.showFirstPanelRequired) {
      this.showFirstPanelRequired = false;
      timer(100).pipe(takeUntil(this.destroyed$)).subscribe(() => {
        this.showFirstPanel(this.panels);
      });
    }
  }
}
