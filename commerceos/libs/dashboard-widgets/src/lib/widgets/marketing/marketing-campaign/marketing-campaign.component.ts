import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { CampaignInterface } from '../../../interfaces';

@Component({
  selector: 'marketing-campaign',
  templateUrl: './marketing-campaign.component.html',
  styleUrls: ['./marketing-campaign.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketingCampaignComponent {
  // TODO Remove this component
  @Input() campaigns: CampaignInterface[];
  @Input() selectedCampaign: CampaignInterface;

  @Output() onClick: EventEmitter<CampaignInterface> = new EventEmitter<CampaignInterface>();
}
