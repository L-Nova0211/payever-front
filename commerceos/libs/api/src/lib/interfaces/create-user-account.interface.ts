export interface CreateUserAccountInterface {
  hasUnfinishedBusinessRegistration?: boolean;
  registrationOrigin?: { url: string; account: string, source?: string };
  language?: string;
}

export interface ResponseUserAccountInterface {
  _id: string,
}
