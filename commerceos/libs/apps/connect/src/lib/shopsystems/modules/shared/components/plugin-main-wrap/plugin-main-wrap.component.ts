import {
  AfterViewChecked,
  Component, HostBinding,
  Injector,
  Input, OnInit, QueryList, ViewChildren, ViewEncapsulation,
} from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';


import { AuthTokenInterface } from '../../../../../shared';
import { ShopsystemsBaseAccordionComponent } from '../base-accordion.component';

@Component({
  selector: 'plugin-main-wrap',
  templateUrl: './plugin-main-wrap.component.html',
  styleUrls: ['./plugin-main-wrap.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PluginMainWrapComponent extends ShopsystemsBaseAccordionComponent implements OnInit, AfterViewChecked {
  @HostBinding('class') class = 'plugin-main-wrap';

  @ViewChildren('panel') panels: QueryList<MatExpansionPanel>;

  @Input('name') set setName(name: string) {
    if (this.name !== name) {
      this.name = name;
      this.apiKeys$ = this.stateService.getPluginApiKeys(name).pipe(takeUntil(this.destroyed$));
    }
  }

  @Input() maxKeys = 999;
  @Input() title: string = null;
  @Input() forceHideSectionApiKeys = false;
  @Input() forceHideSectionDownloads = false;

  name: string = null;
  apiKeys$: Observable<AuthTokenInterface[]> = of(null);
  isAddingKey$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private showFirstPanelRequired = true;


  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.isAddingKey$.pipe(takeUntil(this.destroyed$)).subscribe();
  }

  ngAfterViewChecked() {
    if (this.panels && this.showFirstPanelRequired) {
      this.showFirstPanelRequired = false;
      timer(100).pipe(
        tap(() => {
          this.showFirstPanel(this.panels);
        }),
        takeUntil(this.destroyed$)
      ).subscribe();
    }
  }
}
