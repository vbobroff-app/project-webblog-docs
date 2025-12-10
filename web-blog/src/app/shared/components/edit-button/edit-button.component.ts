import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-edit-button',
  templateUrl: './edit-button.component.html',
  styleUrls: ['./edit-button.component.scss']
})
export class EditButtonComponent implements OnInit {

  @Output() edit = new EventEmitter<void>();
  
  constructor() { }

  ngOnInit(): void {
  }

}
