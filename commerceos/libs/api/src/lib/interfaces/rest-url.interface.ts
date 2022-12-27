export interface RestUrlInterface {
  [propName: string]: (param1?: string | number, param2?: string | number, param3?: string | number) => string;
}
