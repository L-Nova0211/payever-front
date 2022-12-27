export function fileSize(size: number): string {
  const pow = size ? Math.floor(Math.log(size) / Math.log(1024)) : 0;

  return `${(size / Math.pow(1024, pow)).toFixed(2)} ${['B', 'KB', 'MB', 'GB', 'TB'][pow]}`;
}
