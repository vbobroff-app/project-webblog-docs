import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-drop-button',
  templateUrl: './drop-button.component.html',
  styleUrls: ['./drop-button.component.scss']
})
export class DropButtonComponent implements OnInit {

  public toggled: boolean;
  @Output() toggle = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
    this.toggled = false;
  }

  click(){
    this.toggled = !this.toggled;
    this.toggle.emit();
  }

}
