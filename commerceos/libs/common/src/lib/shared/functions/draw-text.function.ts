import { ElementRef } from '@angular/core';

import { AppType } from '../tokens';

export function drawText(appType: AppType, canvas: ElementRef, textToDraw: string, secondText?: string) {
  const context = canvas.nativeElement.getContext('2d');
  const quality = window.innerWidth > 720 ? 2 : 1;
  canvas.nativeElement.width = 254 * quality;
  canvas.nativeElement.height = 144 * quality;
  const gradient = context.createLinearGradient(127 * quality, 0, 127 * quality, 144 * quality);
  const stopColors = getGradientStopColorByAppType(appType);
  gradient.addColorStop(0, stopColors[0]);
  gradient.addColorStop(1, stopColors[1]);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 254 * quality, 144 * quality);
  context.textAlign = 'center';
  context.fillStyle = '#ffffff';
  context.font = `${14 * quality}px Roboto`;
  secondText && context.fillText(secondText, 127 * quality, 55 * quality);
  context.font = `bold ${24 * quality}px Roboto`;
  context.fillText(textToDraw, 127 * quality, 90 * quality);

  return canvas.nativeElement.toDataURL('image/jpg');
}

function getGradientStopColorByAppType(appType: AppType): string[] {
  switch (appType) {
    case AppType.Affiliates:
      return ['#d764a5', '#e7534c'];
    case AppType.Appointments:
    case AppType.Social:
      return ['#31a1ef', '#0078d0'];
    case AppType.Coupons:
    case AppType.Shipping:
    case AppType.Subscriptions:
      return ['#fe9f04', '#fa7421'];
    default:
      return ['#fe9f04', '#fa7421'];
  }
}
