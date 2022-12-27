export enum LoginErrorReasons {
  DisplayCaptcha = 'REASON_DISPLAY_CAPTCHA',
  NoCaptcha = 'REASON_NO_CAPTCHA',
  EmailLoginBan = 'REASON_EMAIL_BAN_LOGIN',
  EmailRegisterBan = 'REASON_EMAIL_BAN_REGISTER',
  WrongPassword = 'REASON_WRONG_PASSWORD',
  TwentyMinutesBan = 'REASON_20_MINUTES_BAN',
  ThreeHoursBan = 'REASON_3_HOURS_BAN',
  PermanentBan = 'REASON_PERMANENT_BAN',
}
