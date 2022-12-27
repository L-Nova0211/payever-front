export interface PeMessageContent {
  _id?: string;
  action?: PeMessageContentAction;
  business?: string;
  icon?: string;
  steps?: [];
  translations?: PeMessageContentTranslations;
}

export interface PeMessageContentAction {
  method: string,
  url?: string,
}

export interface PeMessageContentTranslations {
  en?: string,
}
