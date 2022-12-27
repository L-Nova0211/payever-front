import { Injectable } from '@angular/core';

@Injectable()
export class PeHelpfulService {
  public isValidImgUrl(url: string): Promise<any> {
    const myRequest = new Request(url);

    return fetch(myRequest);
  }
}
