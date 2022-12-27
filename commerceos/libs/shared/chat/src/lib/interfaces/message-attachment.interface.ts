import { SafeStyle, SafeUrl } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

import { PeChatAttachMenuItem } from '../enums';

export interface PeChatMessageAttachment {
  _id?: string;
  data: {
    url: string;
  };
  mimeType: string;
  size?: number;
  title: string;
  type?: string;
  url: string;

  createdAt?: string;
  updatedAt?: string;
};

export interface PeChatMessageFileInterface extends Omit<
  PeChatMessageAttachment,
  'data' | 'url' | 'createdAt' | 'updatedAt'
> {
  action: () => void;
  isImage: boolean;
  isMedia: boolean;
  loaded$: BehaviorSubject<string>;
  loadProgress$: BehaviorSubject<number>;
  safeUrl: SafeUrl;
  url: string;
  urlStyle: SafeStyle;
};

export interface PeChatAttachFileUpload {
  files: File[];
  text: string;
  type: PeChatAttachMenuItem;
  url: string;
}

export interface PeChatAttachMedia extends PeChatAttachFileUpload {
  compressed: boolean;
}

export interface PeChatAttachMenu {
  data?: Object | PeChatAttachFileUpload;
  type: PeChatAttachMenuItem;
}
