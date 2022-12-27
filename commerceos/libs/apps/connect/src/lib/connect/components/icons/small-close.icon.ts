import { Component, Input } from '@angular/core';

@Component({
  selector: 'small-close-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <g fill="none" fill-rule="evenodd">
        <g>
          <g>
            <path fill="#636363" d="M8 0c4.418 0 8 3.582 8 8s-3.582 8-8
            8-8-3.582-8-8 3.582-8 8-8zm3.53 4.47c-.266-.267-.683-.29-.976-.073l-.084.073L8 
            6.939l-2.47-2.47-.084-.072c-.293-.218-.71-.194-.976.073-.293.293-.293.767 
            0 1.06L6.939 8l-2.47 2.47-.072.084c-.218.293-.194.71.073.976.266.267.683.29.976.073l.084-.073L8 
            9.061l2.47 2.47.084.072c.293.218.71.194.976-.073.293-.293.293-.767 
            0-1.06L9.061 8l2.47-2.47.072-.084c.218-.293.194-.71-.073-.976z" 
            transform="translate(-1387 -95) translate(1387 95)"/>
          </g>
        </g>
      </g>
    </svg>
  `,
  styles: [
    `:host {
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }`,
  ],
})
export class SmallCloseIconComponent {
  @Input() rotation = 0;
}
