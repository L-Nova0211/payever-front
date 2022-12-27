import { Injectable } from '@angular/core';
import { ApmService } from '@elastic/apm-rum-angular';
import { forkJoin, Observable, of, OperatorFunction, Subject } from 'rxjs';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, PeDestroyService } from '@pe/common';
import { FolderItem, PeFoldersApiService } from '@pe/folders';
import {
  RuleObservableService,
  RulesService,
  ActionModel,
  ActionType,
  RuleModel,
  RuleValues,
  RuleOverlayData,
  PeRulesApiService,
} from '@pe/rules';

@Injectable()
export class AppointmentsRuleService {
  onSaveSubject$ = new Subject<any>();

  constructor(
    private apmService: ApmService,

    private peFoldersApiService: PeFoldersApiService,
    private peRulesApiService: PeRulesApiService,
    private ruleObservableService: RuleObservableService,
    private ruleService: RulesService,
    private readonly destroy$: PeDestroyService,
  ) {
    this.onSaveSubject$.pipe(
      takeUntil(this.destroy$)
    ).subscribe()
  }

  openRules(theme: string): void {
    forkJoin([
      this.peRulesApiService.getRulesValues(),
      this.peRulesApiService.getRules(),
      this.peFoldersApiService.getFolders().pipe(
        map((folders) => {
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
      takeUntil(this.destroy$),
    ).subscribe()

  }

  initRuleListener(): Observable<ActionModel> {
    return this.ruleObservableService.actions$.pipe(
      tap((action) => {
        if (action) {
          this.ruleAction(action);
        }
      }));
  }

  private errorHandler(): OperatorFunction<any, any> {
    return catchError((error) => {
      this.apmService.apm.captureError(error.error.message)

      return of(error);
    });
  }

  private createRule(action: ActionModel): void {
    this.peRulesApiService.createRule(action.ruleData).pipe(
      tap((rule: RuleModel) => action?.callback$.next({
        action: action.action,
        rule,
      })),
      this.errorHandler(),
      takeUntil(this.destroy$)
    ).subscribe()
  }

  private deleteRule(action: ActionModel): void {
    this.peRulesApiService.deleteRule(action.ruleData._id).pipe(
      tap(() => {
        action?.callback$.next({
          action: ActionType.Delete,
          rule: action.ruleData,
        });
      }),
      this.errorHandler(),
      takeUntil(this.destroy$)
    ).subscribe()
  }

  private updateRule(action: ActionModel): void {
    this.peRulesApiService.updateRule(action.ruleData, action.ruleData._id).pipe(
      tap((rule: RuleModel) => action?.callback$.next({
        action: ActionType.Edit,
        rule,
      })),
      this.errorHandler(),
      takeUntil(this.destroy$)
    ).subscribe()
  }

  private ruleAction(action: ActionModel): void {
    switch (action.action) {
      case ActionType.Duplicate:
      case ActionType.Add:
        this.createRule(action);
        break
      case ActionType.Delete:
        this.deleteRule(action);
        break
      case ActionType.Edit:
        this.updateRule(action);
        break
    }
  }

  private folderTreeFlatten(tree: FolderItem[]): FolderItem[] {
    return tree.reduce((acc, folder) => {
      if (folder?.children?.length) {
        return acc.concat([folder, ...this.folderTreeFlatten(folder.children)]);
      }

      return acc.concat(folder);
    }, [])
  }
}
