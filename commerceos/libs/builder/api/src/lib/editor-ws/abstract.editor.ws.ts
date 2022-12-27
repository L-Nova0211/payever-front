import { Observable } from 'rxjs';

import { PebAction, PebPaginationParams } from '@pe/builder-core';

import { PebEditorWsEvents, PebEditorWsPublishRequestDto, PebEditorWsResponseMessage } from './editor.ws.constants';

export abstract class PebEditorWs {
  abstract readonly messages$: Observable<any>;

  abstract connect(): Promise<void>;
  abstract close(): void;
  abstract on(event: string): Observable<PebEditorWsResponseMessage>;

  abstract sendMessage(event: PebEditorWsEvents | string, params: any): Promise<string>;
  abstract preInstallFinish(appId: string): Promise<string>;
  abstract getShapeAlbums(params?: {
    parent?: string, type?: string, pagination?: PebPaginationParams,
  }): Promise<string>;

  abstract getShapes(params?: { album?: string, type?: string, pagination?: PebPaginationParams }): Promise<string>;
  abstract publish(params: PebEditorWsPublishRequestDto): Promise<string>;
  abstract addAction(params: { action: PebAction, themeId: string }): Promise<string>;
  abstract deleteAction(params: { actionId: string, themeId: string }): Promise<string>;
  abstract getShapesWithFilter(params?: { album?: string, type?: string, pagination?: PebPaginationParams }): void;
  abstract deleteShape(params?: { shapeId?: string }): void;
  abstract createMasterPage(params: { themeId: string, action: any }, id?: string);
}
