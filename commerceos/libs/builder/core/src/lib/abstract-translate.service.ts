export abstract class PebTranslateService {

  abstract translate(key: string, args?: any): string;

  abstract hasTranslation(key: string): boolean;

}
