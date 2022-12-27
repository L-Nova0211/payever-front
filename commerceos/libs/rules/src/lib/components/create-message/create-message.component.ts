import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'pe-rule-create-message',
  templateUrl: './create-message.component.html',
  styleUrls: ['./create-message.component.scss'],
})

export class RuleCreateMessageComponent implements OnInit{
  @Input() channel: string;

  isCreated = false;

  messageForm: FormGroup;

  ngOnInit(): void {
    this.createForm();
  }

  onCreateMessage(): void {
    this.isCreated = true;
  }

  onDelete(): void {
    this.isCreated = false;
  }

  private createForm(): void {
    this.messageForm = new FormGroup({
      subject: new FormControl('', Validators.required),
    })
  }
}
