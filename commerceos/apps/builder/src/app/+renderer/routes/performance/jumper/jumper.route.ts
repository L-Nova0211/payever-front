import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { cloneDeep, random } from 'lodash';
import { BehaviorSubject, EMPTY, iif, interval, of, Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import { generateChessBoard } from './../functions';

@Component({
  selector: 'peb-jumper',
  templateUrl: './jumper.route.html',
  styleUrls: ['./jumper.route.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SandboxRendererPerformanceJumperRoute implements OnInit, OnDestroy {

  public content$ = new BehaviorSubject<any>(null);
  public startSubject$ = new BehaviorSubject(false);
  public clearSubject$ = new BehaviorSubject(false);
  public generateChessBoard = generateChessBoard;

  private destroyed$ = new Subject<boolean>();
  private pawnCoords: { rows: number, cols: number } | null = null;

  chessBoardParameters = { rows: 10, cols: 10, interval: 300 };

  ngOnInit() {

    this.startSubject$.pipe(
      switchMap(started =>
        iif(() => started, interval(this.chessBoardParameters.interval), EMPTY),
      ),
      tap(() => this.changePawnCoordinates()),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.clearSubject$.pipe(
      switchMap(clear => clear ? of(true) : EMPTY),
      tap(() => this.changePawnCoordinates(true)),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.content$.next(generateChessBoard(this.chessBoardParameters.cols, this.chessBoardParameters.rows));
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private changePawnCoordinates(clear = false) {

    const randRows = random(0, this.chessBoardParameters.rows - 1);
    const randCols = random(0, this.chessBoardParameters.cols - 1);
    const content = cloneDeep(this.content$.getValue());

    if (!clear) {
      content.element.children[randRows].children[randCols].children = [{ id: 'pawn', type: 'block' }];
    }

    if (
      this.pawnCoords != null &&
      content.element &&
      content.element.children[this.pawnCoords.rows] &&
      content.element.children[this.pawnCoords.rows].children[this.pawnCoords.cols]
    ) {
      delete content.element.children[this.pawnCoords.rows].children[this.pawnCoords.cols].children;
    }
    this.pawnCoords = !clear ? { rows: randRows, cols: randCols } : null;

    this.content$.next(content);
  }

  onRenderingCycle(event) {
    // console.log(event);
  }

}
