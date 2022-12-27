export enum WorkerMessageType {
    AddAction = 'add-action',
    DeleteAction = 'delete-action',
  }
  
  export interface WorkerMessage {
    messageType: WorkerMessageType;
    messageId: string;
    data: any;
  }
  