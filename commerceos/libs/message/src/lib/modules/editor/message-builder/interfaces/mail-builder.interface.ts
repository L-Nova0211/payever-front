import { PeMessageSchedule } from '../../../../enums/message-schedule.enum';
import { PeMessageChannel } from '../../../../interfaces';

export interface PeMailConfig {
  recipients: string[];
  subject: string;
  sender: string;
  testMailRecipient: string;
}

export interface PeForwardConfig {
  subject: string;
  mailTheme?: any;
}

export interface MailScheduleData {
  themeId: string;
  contacts: string[];
  date: string;
  from: string;
  name: string;
  schedules: { type: string }[];
  status: string;
}

export interface PeMailEntity {
  mail: PeMailForm;
  isTestMail: boolean;
}

export interface PeMailForm {
  mailConfig: PeMailConfig;
  schedule: { date?: Date; type: PeMessageSchedule | string }[];
  channel: PeMessageChannel;
  attachments: [];
}
