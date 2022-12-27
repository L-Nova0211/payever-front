export enum PreloaderActions {
  StartLoading = '[Preloader] StartLoading',
  StopLoading = '[Preloader] StopLoading',
}

export class StartLoading {
  static type = PreloaderActions.StartLoading;

  constructor(public payload: string) {}
}

export class StopLoading {
  static type = PreloaderActions.StopLoading;

  constructor(public payload: string) {}
}
