export class TimestampEvent {
  _timestamp: number;

  constructor() {
    this._timestamp = +new Date();
  }
}
