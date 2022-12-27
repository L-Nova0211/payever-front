import { Component } from '@angular/core';

import { AbstractGradientIconComponent } from './abstract-gradient.icon';

const ID = 'peb-editor-tool-code-icon-gradient';

@Component({
  selector: 'peb-editor-tool-code-icon',
  template: `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
  <defs>
      <linearGradient [attr.id]="id" x1="50%" x2="50%" y1="0%" y2="99.826%">
          <stop offset="0%" stop-color="#988BFF"/>
          <stop offset="100%" stop-color="#C692FF"/>
      </linearGradient>
  </defs>
  <path [attr.fill]="fillUrl"  d="M12.697 5.364c.32.2.437.6.29.935l-.051.098-5.3 8.48c-.22.352-.682.459-1.033.239-.32-.2-.437-.6-.29-.935l.051-.099 5.3-8.48c.22-.35.682-.458 1.033-.238zm.773 4.106c.293-.293.767-.293 1.06 0l2 2 .073.084c.218.293.194.71-.073.976l-2 2-.084.073c-.293.218-.71.194-.976-.073l-.073-.084c-.218-.293-.194-.71.073-.976L14.939 12l-1.47-1.47-.072-.084c-.218-.293-.194-.71.073-.976zm-6.94-4c.267.266.29.683.073.976l-.073.084L5.061 8l1.47 1.47c.266.266.29.683.072.976l-.073.084c-.266.267-.683.29-.976.073l-.084-.073-2-2c-.267-.266-.29-.683-.073-.976l.073-.084 2-2c.293-.293.767-.293 1.06 0z"/>
  </svg>

  `,
})
export class PebEditorToolCodeComponent extends AbstractGradientIconComponent {
  constructor() {
    super(ID);
  }
}
