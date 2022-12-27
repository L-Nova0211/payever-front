import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

import { SnackbarConfig } from './snackbar.model';


@Component({
  selector: 'cos-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss'],
})
export class SnackbarComponent implements OnInit{
  @Output() action = new EventEmitter<any>();
  content: string;
  boldContent: string;
  iconId: string;
  iconSize: number;
  iconColor: string;
  useShowButton: boolean;
  hideButtonColor: string;
  showButtonAction: () => any;
  pending: boolean;

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public snackbarData: SnackbarConfig,
  ) {}

  ngOnInit() {
    this.content = this.snackbarData.content || '';
    this.iconId = this.snackbarData.iconId || 'icon-alert-24';
    this.iconSize = this.snackbarData.iconSize || 24;
    this.iconColor = this.snackbarData.iconColor || '#636363';
    this.useShowButton = this.snackbarData.useShowButton;
    this.showButtonAction = this.snackbarData.showButtonAction;
    this.pending = this.snackbarData.pending;
    this.boldContent = this.snackbarData.boldContent;
    this.hideButtonColor = this.snackbarData.hideButtonColor;
  }

  onActionClick(action: string) {
    this.action.emit(action);
    if (action === 'hide') { this.snackbarData.hideCallback(); }
  }
}
