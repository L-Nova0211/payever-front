import { Injectable } from '@angular/core';
import io from 'socket.io-client';

import Socket = SocketIOClient.Socket;


@Injectable()
export class PeChatService {
  socket;
  connect(uri: string, opts?: any): Socket {
    const socket = io(uri, opts ?? {});
    this.socket = socket;

    return  socket;
  }
}
