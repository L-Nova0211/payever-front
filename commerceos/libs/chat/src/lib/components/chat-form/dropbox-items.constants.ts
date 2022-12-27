import { PeChatAttachMenuItem } from '@pe/shared/chat';

export const PE_CHAT_DROPBOX_FILE = {
  icon: '#icon-files',
  height: '23px',
  width: '18px',
  subtitle: 'message-app.chat.drop_box.files.subtitle',
  type: PeChatAttachMenuItem.File,
  compression: false,
}

export const PE_CHAT_DROPBOX_RAW_IMAGE = {
  icon: '#icon-files',
  height: '23px',
  width: '18px',
  subtitle: 'message-app.chat.drop_box.images_raw.subtitle',
  type: PeChatAttachMenuItem.PhotoOrVideo,
  compression: false,
}

export const PE_CHAT_DROPBOX_COMPRESSED_IMAGE = {
  icon: '#icon-media',
  height: '18px',
  width: '23px',
  subtitle: 'message-app.chat.drop_box.images_compressed.subtitle',
  type: PeChatAttachMenuItem.PhotoOrVideo,
  compression: true,
}
