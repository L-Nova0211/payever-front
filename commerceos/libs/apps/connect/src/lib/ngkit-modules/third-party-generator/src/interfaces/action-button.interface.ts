export interface ActionInterface {
  actionId?: string; // TODO is it used?
  apiUrl?: string;
  httpMethod?: string;
  isSubmit?: boolean;
}

export interface ActionButtonInterface extends ActionInterface {
  text: string;
}
