import { HttpClient, HttpEventType } from '@angular/common/http';
import { Injector } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { skip, takeUntil, tap } from 'rxjs/operators';

import { PeChatMessageFileInterface, PeChatMessageAttachment } from '@pe/shared/chat';
import { isValidImage } from '@pe/shared/utils/media-validators';

export class PeChatMessageFile implements PeChatMessageFileInterface {

  private readonly domSanitizer = this.injector.get(DomSanitizer);
  private readonly httpClient = this.injector.get(HttpClient);

  private readonly action$ = new Subject<void>();

  public readonly _id = this.file._id;
  public readonly isImage = isValidImage(this.file.mimeType);
  public readonly isMedia = false; //isValidMedia(this.file.mimeType);
  public readonly loaded$ = new BehaviorSubject<string>(null);
  public readonly loadProgress$ = new BehaviorSubject<number>(0);
  public readonly mimeType = this.file.mimeType;
  public readonly safeUrl = this.domSanitizer.bypassSecurityTrustUrl(this.file.url);
  public readonly size = this.file.size;
  public readonly title = this.file.data.url.split('/').pop();
  public readonly type = this.file.mimeType.split('/')[0];
  public readonly url = this.file.data.url;
  public readonly urlStyle = isValidImage(this.file.mimeType)
    ? null
    : this.domSanitizer.bypassSecurityTrustStyle(`url("${this.file.url}")`);

  constructor(
    private file: PeChatMessageAttachment,
    private injector: Injector,
  ) { }

  public action(): void {
    const { action$, loaded$ } = this;

    if (loaded$.value) {
      fetch(loaded$.value)
        .then(res => res.blob())
        .then((blob) => {
          window.open(URL.createObjectURL(blob), '_blank');
        });
    } else {
      action$.next();
    }
  }

  private createRequest(file: Partial<PeChatMessageFileInterface>): Observable<any> {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      file.loaded$.next(fileReader.result as string);
    };

    return this.httpClient
      .get(file.url, { observe: 'events', reportProgress: true, responseType: 'blob' })
      .pipe(
        tap((event) => {
          switch (event.type) {
            case HttpEventType.Response:
              fileReader.readAsDataURL(event.body);
              break;
            case HttpEventType.DownloadProgress:
              const progress = Math.ceil(event.loaded / event.total * 100);
              file.loadProgress$.next(progress);
              break;
          }
        }));
  }

  public readonly download = (): void => {
    const { action$, loaded$, loadProgress$, url } = this;
    const file = { url, loaded$, loadProgress$ };

    if (loaded$.value || !url) {
      return;
    }

    let request = this.createRequest(file).subscribe();

    action$
      .pipe(
        tap(() => {
          if (loadProgress$.value) {
            request.unsubscribe();
            loadProgress$.next(0);
          } else {
            request = this.createRequest(file).subscribe();
          }
        }),
        takeUntil(loaded$.pipe(skip(1))))
      .subscribe();
  };
}
