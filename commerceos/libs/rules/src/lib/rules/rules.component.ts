import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { cloneDeep, debounce } from 'lodash-es';
import { BehaviorSubject, combineLatest, EMPTY, fromEvent, merge, Observable } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { ConfirmScreenService } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA, PeOverlayWidgetService } from '@pe/overlay-widget';


import { AddRuleComponent } from '../add-rule/add-rule.component';
import { BaseRules } from '../classes/rules.class';
import { Headings } from '../models/rule-confirm-heading.model';
import { ActionCallback, ActionModel, ActionType, RuleModel, RuleOverlayData } from '../models/rules.model';
import { RuleObservableService } from '../services/rule-observable.service';



@Component({
  selector: 'pe-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss'],
  providers: [PeDestroyService],
  encapsulation: ViewEncapsulation.None,
})
export class RulesComponent extends BaseRules implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('scrollBox') scrollRef: ElementRef;

  onSaveSubject$ = new BehaviorSubject(null);
  onSave$ = this.onSaveSubject$.asObservable();
  isScrolling = false;
  scrollDebounce = debounce(() => {
    this.isScrolling = false;
    this.cdr.detectChanges();
  }, 2000);

  private deleteHeadings: Headings = {
    title: this.translateService.translate('rules.delete.title'),
    subtitle: this.translateService.translate('rules.delete.subtitle'),
    confirmBtnText: this.translateService.translate('rules.remove'),
    declineBtnText: this.translateService.translate('rules.cancel'),
  }

  private exitHeadings: Headings = {
    title: this.translateService.translate('rules.exit.title'),
    subtitle: this.translateService.translate('rules.exit.subtitle'),
    confirmBtnText: this.translateService.translate('rules.yes'),
    declineBtnText: this.translateService.translate('rules.no'),
  }

  private callbackAction$ = new BehaviorSubject({});

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: RuleOverlayData,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
    private overlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private observableService: RuleObservableService,
    private cdr: ChangeDetectorRef,
    private destroy$: PeDestroyService,
    private confirmScreenService: ConfirmScreenService
  ) {
    super();
  }

  ngOnInit(): void {
    this.init(this.overlayData.rules);

    combineLatest([
      this.observableService.rule$.pipe(
        tap((data: ActionModel) => {
          if (data?.ruleData) {
            this.createAction(data.action, data.ruleData);
          }
        })
      ),
      this.callbackAction$.pipe(
        tap((data: ActionCallback) => {
          if (data.action) {
            if (data.action === ActionType.Add) {
              this.insertItem(data.rule);
            } else if(data.action === ActionType.Delete) {
              this.deleteItem(data.rule);
            } else if(data.action === ActionType.Edit) {
              this.updateItem(data.rule);
            } else if(data.action === ActionType.Duplicate) {
              this.insertItem(data.rule);
            }
            this.cdr.detectChanges();
          }
        })
      ),
    ]).pipe(takeUntil(this.destroy$))
    .subscribe()
  }

  ngAfterViewInit(): void {
    merge(
      fromEvent(this.scrollRef.nativeElement, 'scroll'),
      fromEvent(this.scrollRef.nativeElement, 'mouseover'),
    ).pipe(
      tap(() => {
        this.isScrolling = true;
        this.scrollDebounce();
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onActionClick(action: ActionType, data?: RuleModel) {
    switch (action) {
      case ActionType.Add:
      case ActionType.Edit:
      case ActionType.Duplicate:
        this.openOverlay(data, action)
        break;
      case ActionType.Delete:
        this.showConfirmDialogForDelete(this.deleteHeadings, data)
        break;
    }
  }

  onAddClick() {
    this.onActionClick(ActionType.Add);
  }

  ngOnDestroy(): void {
    this.observableService.rule = null;
    this.observableService.actions = null;
  }

  private prepereRule(action: ActionType, rule: RuleModel): RuleModel {
    const ruleData = cloneDeep(rule);
    if( action === ActionType.Add) {
      delete ruleData._id;
    }

    return ruleData;
  }

  private createAction(action: ActionType, rule: RuleModel) {
    const ruleData = this.prepereRule(action, rule);
    const actionData: ActionModel = { action, ruleData, callback$: this.callbackAction$ };
    this.observableService.actions = actionData;
  }

  private openOverlay(ruleData?: RuleModel, action?: ActionType) {
    const headerConfig = {
      theme: this.overlayData.theme,
      onSaveSubject$: this.onSaveSubject$,
      title: this.translateService.translate(`rules.${action}-rule`),
      backBtnTitle: this.translateService.translate('rules.cancel'),
      backBtnCallback: () => {
        this.showConfirmDialogForExit(this.exitHeadings, true)
      },
      doneBtnTitle: this.translateService.translate('rules.done'),
      doneBtnCallback: () => {
        this.onSaveSubject$.next(true);
      },
      onSave$: this.onSave$,
    } as any;

    return this.overlayWidgetService.open({
      headerConfig,
      data: {
        ...this.overlayData,
        rule: cloneDeep(ruleData),
        action,
      },
      panelClass: 'add-rule-overlay-panel',
      component: AddRuleComponent,
      backdropClick: () => {
        this.showConfirmDialogForExit(this.exitHeadings, false)

        return EMPTY;
      },
    });
  }

  private showConfirmDialogForDelete(headings: Headings, data: RuleModel) {
    const confirmObservable: Observable<boolean> = this.confirmScreenService.show(headings, true);
    confirmObservable.pipe(
      take(1)
    ).subscribe(confirmation => {
      if (confirmation) {
        this.createAction(ActionType.Delete, data);
        this.cdr.detectChanges();
      }
    })
  }

  private showConfirmDialogForExit(headings, useObservable = false) {
    const confirmObservable: Observable<boolean> = this.confirmScreenService.show(headings, true);
    confirmObservable.pipe(
      take(1)
    ).subscribe(confirmation => {
      if (confirmation) {
        if (useObservable) {
          this.onSaveSubject$.next(false);
        }
        this.overlayWidgetService.close();
      }
    })
  }
}
