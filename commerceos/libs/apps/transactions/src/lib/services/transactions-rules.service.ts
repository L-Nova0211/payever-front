
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, of, OperatorFunction, Subject } from 'rxjs';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum } from '@pe/common';
import { PeFilterType } from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import {
  RuleObservableService,
  RulesService,
  ActionModel,
  ActionType,
  RuleModel,
  RuleValues,
  RuleOverlayData,
} from '@pe/rules';
import { SnackbarService } from '@pe/snackbar';

import { PeFolder } from '../shared/interfaces/folder.interface';

import { ApiService } from './api.service';
import { ValuesService } from './values.service';


@Injectable()
export class TransactionsRuleService {
  onSaveSubject$ = new Subject<any>();

  unsubscribe$ = new Subject<any>();
  loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private ruleObservableService: RuleObservableService,
    private ruleService: RulesService,
    private apiService: ApiService,
    private snackbarService: SnackbarService,
    private valuesService: ValuesService,
    private translateService: TranslateService
  ) {
    this.onSaveSubject$.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe()
  }

  openRules(theme: string): void {
    if (this.loading$.value) {
      // disable reopening
      return;
    }

    forkJoin([
      this.apiService.getRulesValues().pipe(
        map((values: RuleValues) => {
          const filters = this.valuesService.filters.reduce((acc, item) => ({
            ...acc,
            [item.fieldName]: item,
          }), {});

          values.fields = values.fields.map(item => {
            if (filters.hasOwnProperty(item.fieldName)) {
              return {
                ...item,
                type: filters[item.fieldName]?.type,
                options: filters[item.fieldName]?.options,
              }
            }

            return {
              ...item,
              type: PeFilterType.String,
            };
          })

          return values;
        })
      ),
      this.apiService.getRules(),
      this.apiService.getFolders().pipe(
        map(folders => {
          return this.folderTreeFlatten(folders);
        }),
      ),
    ]).pipe(
      tap(([values, rules, folders]) => {
        const { conditions, fields, actions, channels } = values as RuleValues;
        const data: RuleOverlayData = { conditions, fields, rules, folders, actions, channels };
        this.ruleService.show(this.onSaveSubject$, data, theme as AppThemeEnum);
      }),
      this.errorHandler(),
      takeUntil(this.unsubscribe$),
    ).subscribe({
      complete: () => {
        this.loading$.next(false);
      },
    })
    this.loading$.next(true);
  }

  initRuleListener(): void {
    this.ruleObservableService.actions$.pipe(
      tap(action => {
        if (action) {
          this.ruleAction(action);
        }
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe()
  }

  private errorHandler(): OperatorFunction<any, any> {
    return catchError(error => {
      const message = error.error?.message ?? error.statusText;
      this.snackbarService.toggle(true, {
        content: this.translateService.hasTranslation(message)
          ? this.translateService.translate(message)
          : message,
      });

      return of(error);
    });
  }

  private createRule(action: ActionModel): void {
    this.apiService.createRule(action.ruleData).pipe(
      tap((rule: RuleModel) => action?.callback$.next({
        action: action.action,
        rule,
      })),
      this.errorHandler(),
    ).subscribe()
  }

  private deleteRule(action: ActionModel): void {
    this.apiService.deleteRule(action.ruleData._id).pipe(
      tap(() => {
        action?.callback$.next({
          action: ActionType.Delete,
          rule: action.ruleData,
        });
      }),
      this.errorHandler(),
    ).subscribe()
  }

  private updateRule(action: ActionModel): void {
    this.apiService.updateRule(action.ruleData, action.ruleData._id).pipe(
      tap((rule: RuleModel) => action?.callback$.next({
        action: ActionType.Edit,
        rule,
      })),
      this.errorHandler(),
    ).subscribe()
  }

  private ruleAction(action: ActionModel): void {
    if (action.action === ActionType.Add || action.action === ActionType.Duplicate) {
      this.createRule(action);
    } else if (action.action === ActionType.Delete) {
      this.deleteRule(action);
    } else if (action.action === ActionType.Edit) {
      this.updateRule(action);
    }
  }

  private folderTreeFlatten(tree: PeFolder[]): PeFolder[] {
    return tree.reduce((acc, folder) => {
      if (folder?.children?.length) {
        return acc.concat([folder, ...this.folderTreeFlatten(folder.children)]);
      }

      return acc.concat(folder);
    }, [])
  }
}
