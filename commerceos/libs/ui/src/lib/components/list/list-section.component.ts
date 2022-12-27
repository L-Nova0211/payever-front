import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { PeListSectionButtonTypesEnum } from './list-section-button-types.enum';
import { PeListSectionIntegrationInterface } from './list-section-integration.interface';

@Component({
  selector: 'pe-list-section',
  templateUrl: 'list-section.component.html',
  styleUrls: ['list-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeListSectionComponent {

  public showArrowButton = false;
  public showOpenButton = false;
  public showToggleButton = false;
  public showAfterLabelOfToggle = false;
  public showBeforeLabelOfToggle = false;

  @Input() set actionButtonType(buttonType: PeListSectionButtonTypesEnum) {
    switch (buttonType) {
      case PeListSectionButtonTypesEnum.Arrow:
        this.showArrowButton = true;
        break;
      case PeListSectionButtonTypesEnum.Open:
        this.showOpenButton = true;
        break;
      case PeListSectionButtonTypesEnum.Toggle:
        this.showToggleButton = true;
        break;
      case PeListSectionButtonTypesEnum.ToggleWithOpen:
        this.showOpenButton = true;
        this.showToggleButton = true;
        break;
      case PeListSectionButtonTypesEnum.ToggleWithAfterLabel:
        this.showToggleButton = true;
        this.showAfterLabelOfToggle = true;
        break;
      case PeListSectionButtonTypesEnum.ToggleWithBeforeLabel:
        this.showToggleButton = true;
        this.showBeforeLabelOfToggle = true;
        break;
    }
  }

  @Input() private listType = null;
  @Input() public addButtonLabel = null;
  @Input() public toggleButtonLabel = null;
  @Input() public category = null;
  @Input() public integrations: PeListSectionIntegrationInterface[] = [];
  @Input() public isInForm = false;
  @Input() public maxShowingFields = null;
  @Input() public showAddButton = false;
  @Input() public showGroupTitle = false;
  @Input() public sectionTitle = null;
  @Input() public translateItemsTitle = true;
  @Input() public upperCase = false;

  @Output() readonly navigated: EventEmitter<PeListSectionIntegrationInterface> = new EventEmitter();
  @Output() readonly hovered: EventEmitter<PeListSectionIntegrationInterface> = new EventEmitter();
  @Output() readonly switched: EventEmitter<PeListSectionIntegrationInterface> = new EventEmitter();

  public get integrationCategory(): string {
    return this.listType && this.category
      ? `${this.listType}.${this.category}.`
      : null;
  }

  public readonly isIconImage = (icon: string = ''): boolean => icon.includes('/');
  public readonly isIconXlink = (icon: string = ''): boolean => icon[0] === '#';

  public navigateToConnect(integration?: PeListSectionIntegrationInterface): void {
    this.navigated.emit(integration);
  }

  public hoverIntegration(integration: PeListSectionIntegrationInterface): void {
    this.hovered.emit(integration);
  }

  public switchConnect(integration: PeListSectionIntegrationInterface): void {
    this.switched.emit(integration);
  }
}
