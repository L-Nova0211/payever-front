import {
  Component, ChangeDetectionStrategy, Input, OnInit, SimpleChanges, OnChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { PeMessageBubbleLayouts, PeMessageBubbleBrand } from '../../../enums';
import { PeMessageBubble } from '../../../interfaces';
import { PeMessageService } from '../../../services/message.service';

@Component({
  selector: 'pe-message-bubble-item',
  templateUrl: './message-bubble-item.component.html',
  styleUrls: ['./message-bubble-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageBubbleItemComponent implements OnInit, OnChanges {

  peMessageBubbleBrand = PeMessageBubbleBrand;
  peMessageBubbleLayouts = PeMessageBubbleLayouts;

  showLogo = [PeMessageBubbleLayouts.LogoText, PeMessageBubbleLayouts.Logo];
  showText = [PeMessageBubbleLayouts.LogoText, PeMessageBubbleLayouts.Text];
  showOnlyText = [PeMessageBubbleLayouts.Text];
  layout = PeMessageBubbleLayouts.Logo;

  img: SafeUrl | null = null;

  @Input() item!: PeMessageBubble;
  @Input() logo!: string;
  @Input() boxShadow!: string;
  @Input() unreadMessages?: string;
  @Input() companyName!: string;

  constructor(
    protected domSanitizer: DomSanitizer,
    private changeDetectorRef: ChangeDetectorRef,
    private peMessageService: PeMessageService,
  ) { }

  ngOnInit(): void {
    this.layout = this.item.layout ?? this.layout;
    this.peMessageService.isValidImgUrl(this.logo).then(res => {
      this.img = res.status === 200 && this.peMessageService.isValidUrl(this.logo) ?
        this.domSanitizer.bypassSecurityTrustUrl(this.logo) : null;

      this.changeDetectorRef.detectChanges();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.item) {
      this.layout = this.item.layout ?? this.layout;

      this.changeDetectorRef.detectChanges();
    }

    if (changes.logo) {
      this.peMessageService.isValidImgUrl(this.logo).then(res => {
        this.img = res.status === 200 && this.peMessageService.isValidUrl(this.logo) ?
          this.domSanitizer.bypassSecurityTrustUrl(this.logo) : null;

        this.changeDetectorRef.detectChanges();
      });
    }
  }
}
