import { animate, state, style, transition, trigger } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'pe-search-animated',
  animations: [
    trigger('enterSearchAnimation', [
      state('open', style({
        width: '75px',
        fontSize: '14px',
      })),
      state('closed', style({
        width: '0%',
        fontSize: '0px',
      })),
      transition('open => closed', [
        animate('0.25s'),
      ]),
      transition('closed => open', [
        animate('0.3s'),
      ]),
    ]),
    trigger('animateText', [
      state('focus', style({
        position: 'relative',
        left: '0',
      })),
      state('unFocus', style({
        position: 'relative',
        left: '0',
      })),
      transition('unFocus => focus', [
        animate('0.6s'),
      ]),
      transition('focus => unFocus', [
        animate('0.5s'),
      ]),
    ]),
  ],
  styleUrls: ['./search-animated.component.scss'],
  templateUrl: './search-animated.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeSearchAnimatedComponent implements OnInit {

  theme = 'default';

  isSearchFocused = false;

  searchText: string;
  @Output() searchString = new EventEmitter<any>();
  searchStringSubject$ = new BehaviorSubject<string>('');

  ngOnInit(){
    (window as any).PayeverStatic.IconLoader.loadIcons(['widgets']);
  }

  onSearchClicked() {
    this.isSearchFocused = true;
  }

  outOfFocus() {
    if(!this.searchText) {
      this.isSearchFocused = false;
    }
  }

  clearSearch() {
    this.searchText = '';
    this.searchString.emit(null);
    this.isSearchFocused = false;
  }

  goToSearch(event:any) {
   this.searchString.emit(event.target.value);
  }
}
