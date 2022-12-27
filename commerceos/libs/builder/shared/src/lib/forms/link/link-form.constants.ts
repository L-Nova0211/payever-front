import { PebInteractionType } from '@pe/builder-core';

import { PebLinkFormOptions } from './link-form.interface';

export const linkFormOptions: PebLinkFormOptions[] = [
  {
    name: 'None',
    value: 'none',
    payload: null,
  },
  {
    name: 'Page',
    value: PebInteractionType.NavigateInternal,
    payload: [
      {
        label: 'Link Payload',
        type: 'select',
        options: [],
        controlName: 'url',
      },
    ],
  },
  {
    name: 'Custom Link',
    value: PebInteractionType.NavigateExternal,
    payload: [
      {
        label: 'Link',
        type: 'input',
        controlName: 'url',
        changeType: 'keyup',
      },
    ],
  },
  {
    name: 'Open Overlay',
    value: PebInteractionType.OverlayOpenPage ,
    payload: [
      {
        label: 'Link Payload',
        type: 'select',
        options: [],
        controlName: 'url',
      },
    ],
  },
  {
    name: 'Close Overlay',
    value: PebInteractionType.OverlayClose,
    payload: [
      {
        label: 'Link Payload',
        type: null,
      },
    ],
  },
  {
    name: 'Email',
    value: PebInteractionType.NavigateEmail,
    payload: [
      {
        label: 'To:',
        type: 'input',
        changeType: 'keyup',
        controlName: 'to',
      },
      {
        label: 'Subject:',
        type: 'input',
        changeType: 'keyup',
        controlName: 'subject',
      },
    ],
  },
];
