export abstract class PebEditorAuthTokenService {
  abstract readonly token: string;
  abstract access?: string;
}
