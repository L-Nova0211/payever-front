import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  OnDestroy,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BusinessInterface, BusinessState } from '@pe/business';
import { AppThemeEnum, MessageBus } from '@pe/common';
import { RulesService, RuleObservableService } from '@pe/rules';
import { PeSimpleStepperService } from '@pe/stepper';

import { PeStatisticsHeaderService } from '../statistics-header.service';

@Component({
  selector: 'cos-next-statistics-root',
  templateUrl: './next-statistics-root.component.html',
  styleUrls: ['./next-statistics-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CosNextStatisticsRootComponent implements OnInit, OnDestroy, AfterViewInit {
  @SelectSnapshot(BusinessState.businessData) businessData:BusinessInterface
  theme:AppThemeEnum

  body: HTMLElement = document.body;
  unsubscribe$ = new Subject();

  constructor(
    public router: Router,
    public peSimpleStepperService: PeSimpleStepperService,
    private statisticsHeaderService: PeStatisticsHeaderService,
    private messageBus: MessageBus,
    private rulesService: RulesService,
    private ruleObservableService: RuleObservableService,
  ) {

    this.theme = (this.businessData?.themeSettings?.theme) ? AppThemeEnum[this.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;
  }

  ngOnInit() {
    
    (window as any).PayeverStatic.IconLoader.loadIcons([
      'apps',
      'set',
      'settings',
      'statistics',
    ]);

    this.initRuleListener();
  }

  ngAfterViewInit() {
   this.statisticsHeaderService.initialize();
  }

  private initRuleListener() {
    this.messageBus.listen('open-rule')
      .pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.rulesService.show(new BehaviorSubject(null), data, this.theme)
    })
    this.ruleObservableService.actions$.pipe(takeUntil(this.unsubscribe$))
      .subscribe((actionsList) => {
        if (actionsList?.length) {
          this.messageBus.emit('rule-actions-list', actionsList)
        }
      })
  }

  ngOnDestroy() {
    this.body.classList.remove(`${this.theme}`);
    this.statisticsHeaderService.destroy();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
