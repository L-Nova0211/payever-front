import { PeSocialChannelRuleInterface } from './channel-rule.interface';

export interface PeSocialBusinessIntegrationInterface {
  channelSet: boolean;
  channelName?: string;
  channelId?: string;
  enabled: boolean;
  icon?: string;
  iconColor?: string;
  id: string;
  installed: boolean;
  maxlength?: number;
  mediaRules?: PeSocialChannelRuleInterface;
  name: string;
  title?: string;
  warning?: string;
}
