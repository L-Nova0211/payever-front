export class AbstractGradientIconComponent {
  id: string;
  constructor(id: string) {
    this.id = id;
  }

  get fillUrl(): string {
    return `url(${document.URL}#${this.id})`;
  }
}
