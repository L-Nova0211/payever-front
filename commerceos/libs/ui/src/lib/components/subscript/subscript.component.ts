import { Component, Input } from '@angular/core';

@Component({
  selector: 'pe-subscript',
  template: `
  <div class="pe-subscript">
    <span>{{ content }}</span>
  </div>
`,
  styleUrls: ['subscript.component.scss'],
})
export class PeSubscriptComponent {
  @Input() public content: string;
}
