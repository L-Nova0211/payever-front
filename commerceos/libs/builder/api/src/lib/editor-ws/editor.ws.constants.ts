export enum PebEditorWsEvents {
  GetShapeAlbum = 'get.shape.album',
  GetShape = 'get.shape',
  GetShapeWithFilter = 'get.shape.filter',
  Publish = 'publish',
  BuilderThemePublished = 'builder-theme-published',
  CreateMasterPage = 'add.action',
  DeleteShape = 'delete.shape',
  AddAction = 'add.action',
  DeleteAction = 'delete.action',
  PreInstallFinished = 'pre.install.finished',
}

export interface PebEditorWsRequestMessage {
  event: string;
  data: ({ token: string } | { access }) & {
    params?: any,
    id?: string,
  };
}

export interface PebEditorWsResponseMessage {
  id: string;
  name: string;
  result: boolean;
  data?: any;
}

export interface PebEditorWsPublishRequestDto {
  themeId: string;
  dto?: any;
}
