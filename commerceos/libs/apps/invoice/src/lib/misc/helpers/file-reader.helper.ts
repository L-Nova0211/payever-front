import { from, Observable } from 'rxjs';

export function readFileAsString(file: File) {
  return readFile(file);
}
export function readFileAsString$(file: File): Observable<string> {
  return from(readFileAsString(file));
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => resolve(reader.result as string) ;
    reader.onerror = error => reject(error);

    reader.readAsDataURL(file);
  });
}
