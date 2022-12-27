export const PANELS = [
  {
    name: 'settings.callbacks.sections.callbacks',
    icon: '#icon-b-spacer-32',
    key: 'callbacks',
  },
  {
    name: 'settings.callbacks.sections.webhook',
    icon: '#icon-b-spacer-32',
    key: 'webhook',
  },
];

export const CALLBACKS = [
  {
    title: 'settings.callbacks.controls.successUrl',
    controlName: 'successUrl',
    error: {
      required: 'settings.callbacks.errors.successUrl.required',
      pattern: 'settings.callbacks.errors.successUrl.pattern',
    },
  },
  {
    title: 'settings.callbacks.controls.pendingUrl',
    controlName: 'pendingUrl',
    error: {
      required: 'settings.callbacks.errors.pendingUrl.required',
      pattern: 'settings.callbacks.errors.pendingUrl.pattern',
    },
  },
  {
    title: 'settings.callbacks.controls.cancelUrl',
    controlName: 'cancelUrl',
    error: {
      required: 'settings.callbacks.errors.cancelUrl.required',
      pattern: 'settings.callbacks.errors.cancelUrl.pattern',
    },
  },
  {
    title: 'settings.callbacks.controls.failureUrl',
    controlName: 'failureUrl',
    error: {
      required: 'settings.callbacks.errors.failureUrl.required',
      pattern: 'settings.callbacks.errors.failureUrl.pattern',
    },
  },
];

export const WEBHOOKS = [
  {
    title: 'settings.callbacks.controls.noticeUrl',
    controlName: 'noticeUrl',
    error: {
      required: 'settings.callbacks.errors.noticeUrl.required',
      pattern: 'settings.callbacks.errors.noticeUrl.pattern',
    },
  },
];
