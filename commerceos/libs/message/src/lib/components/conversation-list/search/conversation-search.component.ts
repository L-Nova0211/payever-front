import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'pe-message-conversation-search',
  templateUrl: './conversation-search.component.html',
  styleUrls: ['./conversation-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageConversationSearchComponent {
  @Input() mobileView: boolean;
  @Input() set isLoading(loading) {
    this.isLoading$.next(loading);
  }

  @Output() filter = new EventEmitter<string>();

  public readonly isLoading$ = new BehaviorSubject<boolean>(false);
  public readonly searchFilter = new FormGroup({
    filter: new FormControl(),
  });

  @HostBinding('style.display')
  private get hideIsOnLoading(): string {
    return this.isLoading$.value ? 'none' : 'block';
  }

  public readonly setFilter$ = this.searchFilter.controls.filter.valueChanges
    .pipe(
      tap((filter: string) => {
        this.filter.emit(filter);
      }));

  public resetFilter(): void {
    this.searchFilter.controls.filter.patchValue('');
  }
}
