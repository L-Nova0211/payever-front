import { OverlayRef } from '@angular/cdk/overlay';
import { FormGroup } from '@angular/forms';

import { PeChatAttachMenuItem } from '@pe/shared/chat';

export interface ChatFormFieldAction {
  title: string;
  iconId?: string;
  iconSize?: number;
  iconColor?: string;
  onClick: () => void;
}

export interface AttachMenu {
  overlayRef: OverlayRef;
  backdropClass: string;
  width: string;
  height?: string;
  trigger: boolean;
  form?: FormGroup;
  image?: string;
  submitted?: boolean;
}
export interface DropBoxItems {
  icon: string,
  height: string,
  width: string,
  subtitle: string,
  type: PeChatAttachMenuItem,
  compression: boolean,
}
