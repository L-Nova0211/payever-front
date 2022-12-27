export interface WidgetTutorialInterface {
  _id: string;
  titel: string;
  icon: string;
  url: string;
  urls: [
    {
      language: string,
      url: string
    }
  ]
  type: string;
  watched: boolean;
  order?: number;
}
