export const IMAGE_MIME_TYPES = 'png|jpg|jpeg|bmp';
export const VIDEO_MIME_TYPES = 'x-flv|MP2T|3gpp|quicktime|x-msvideo|x-ms-wmv|mp4|webm|ogg|avi|mov';

const mediaRegexExp = new RegExp(`(image\/(${IMAGE_MIME_TYPES}))|(video\/(${VIDEO_MIME_TYPES}))`);

export function isValidImage(type: string): boolean {
  return new RegExp(`(image\/${IMAGE_MIME_TYPES})`).test(type);
}

export function isValidVideo(type: string): boolean {
  return new RegExp(`(video\/${VIDEO_MIME_TYPES})`).test(type);
}

export function isValidMedia(type: string): boolean {
  return mediaRegexExp.test(type);
}
