export interface RequestOptions {
  url: string;
  body: any;
}

export interface RequestPostResponse {
  value: string;
}

export class RequestPromise {
  public get(options: RequestOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('get', options.url);
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.responseText);
        } else {
          reject(new Error(xhr.statusText));
        }
      };
      xhr.send(options.body);
    });
  }
}
