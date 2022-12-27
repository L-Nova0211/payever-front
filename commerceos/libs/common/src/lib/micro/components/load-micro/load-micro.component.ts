import { Component, ChangeDetectionStrategy, EventEmitter, Output, Input, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MicroLoaderService } from '../../services';

/* @deprecated */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pe-load-micro',
  templateUrl: 'load-micro.component.html',
})
export class LoadMicroComponent implements OnInit, OnDestroy {

  @Input('micro') set setMicro(micro: string) {
    this.isLoadingSubject.next(true);
    this.microLoader.loadBuild(micro).subscribe(() => {
      this.isLoadingSubject.next(false);
    });
  }

  @Input('innerMicro') set setInnerMicro(data: {micro: string, innerMicro: string, subPath: string}) {
    this.isLoadingSubject.next(true);
    this.microLoader.loadInnerMicroBuildEx(data.micro, data.innerMicro, data.subPath).subscribe(() => {
      this.isLoadingSubject.next(false);
    });
  }

  @Input('bootstrapScriptUrl') set setBootstrapScriptUrl(bootstrapScriptUrl: string) {
    this.isLoadingSubject.next(true);
    this.microLoader.loadMicroByScriptUrl(bootstrapScriptUrl).subscribe(() => {
      this.isLoadingSubject.next(false);
    });
  }

  @Input() isShowLoader = true;
  @Output('isLoading') isLoadingEmitter: EventEmitter<boolean> = new EventEmitter();

  isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject();

  constructor(
    private microLoader: MicroLoaderService
  ) {
  }

  ngOnInit(): void {
    this.isLoading$.pipe(takeUntil(this.destroyed$)).subscribe(isLoading => {
      this.isLoadingEmitter.next(isLoading);
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
