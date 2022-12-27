import { PaymentMethodEnum } from '@pe/payment-widgets-sdk/types/payment-method.enum';

export enum ErrorNotificationTypesEnum {
  paymentNotificationFailed = 'payment-notification-failed',
  pspApiFailed = 'psp-api-failed',
  paymentOptionCredentialsInvalid = 'payment-option-credentials-invalid',
  apiKeysInvalid = 'api-keys-invalid',
  lastTransactionTime = 'last-transaction-time',
}

export enum SendingMethodEnum {
  sendByCronInterval = 'send-by-cron-interval',
  sendByAfterInterval = 'send-by-after-interval',
}

export enum CronUpdateIntervalEnum {
  never = 'never',
  every5minutes = 'every-5-minutes',
  everyHour = 'every-hour',
  every24Hours = 'every-24-hours',
}

export interface TimeFramesInterface {
  startDayOfWeek: number;
  startHour: number;
  startMinutes: number;

  endDayOfWeek: number;
  endHour: number;
  endMinutes: number;

  repeatFrequencyInterval: number;
  sendEmailAfterInterval: number;
}

export interface BusinessNotificationSettingsInterface {
  businessId?: string;
  isEnabled?: boolean;
  integration?: PaymentMethodEnum;
  sendingMethod?: SendingMethodEnum;
  type?: ErrorNotificationTypesEnum;
  updateInterval?: CronUpdateIntervalEnum; // For paymentNotificationFailed
  repeatFrequencyInterval?: number; // For paymentNotificationFailed
  timeFrames?: TimeFramesInterface[]; // For lastTransactionTime
}
