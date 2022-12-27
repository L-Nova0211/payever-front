import { Injectable } from '@angular/core';

import { PeChatMessage, PeMessageColors } from '@pe/shared/chat';

import { PeMessageIntegrationThemeItemValues } from '../interfaces';

import { PeMessageService } from './message.service';

// tslint:disable:no-bitwise
@Injectable()
export class PeMessageThemeService {
  colors: PeMessageColors = {
    message: ['', ''],
    bgChat: '',
    accent: '',
    app: '',
  };

  constructor(private peMessageService: PeMessageService) { }

  setColors(settings: PeMessageIntegrationThemeItemValues) {
    this.colors = {
      bgChat: settings?.bgChatColor || '',
      accent: settings?.accentColor || '',
      app: settings?.messageAppColor || '',
      message: [settings?.messagesBottomColor || '', settings?.messagesTopColor || ''],
    };
  }

  public setMessageTheme(message: PeChatMessage, theme?: string) {
    message.theme = this.peMessageService.isLiveChat
      ? this.setTheme(this.colors.message[message.reply ? 1 : 0])
      : theme;
  }

  messageAccentColor(message: PeChatMessage): string {
    const amt = this.setTheme(this.colors.message[0]) === 'dark' ? 135 : -135;

    return message.reply
      ? this.colors.accent
      : this.adjustBrightness(this.colors.message[0], amt);
  }

  setTheme(color: string): string {
    const rgbArr = this.hexToRGBArr(color);
    const newColor = (rgbArr[0] > 80 && rgbArr[1] > 80 && rgbArr[2] > 80) ? 'light' : 'dark';

    return newColor;
  }

  hexToRGBArr(color: string): number[] {
    const colorForParse = color.substr(1, 6);
    const rgb = colorForParse.match(/.{2}/g) || ['00', '00', '00'];
    const r = parseInt(rgb[0], 16);
    const g = parseInt(rgb[1], 16);
    const b = parseInt(rgb[2], 16);

    return [r, g, b];
  }

  adjustBrightness(col: string, amt: number): string {
    var usePound = true;

    if (col[0] == "#") {
      col = col.slice(1);
      usePound = true;
    }

    var R = parseInt(col.substring(0, 2), 16);
    var G = parseInt(col.substring(2, 4), 16);
    var B = parseInt(col.substring(4, 6), 16);

    R = Math.max(0, Math.min(255, R + amt));
    G = Math.max(0, Math.min(255, G + amt));
    B = Math.max(0, Math.min(255, B + amt));

    var RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
    var GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
    var BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));
    return (usePound ? "#" : "") + RR + GG + BB;
  }
}
