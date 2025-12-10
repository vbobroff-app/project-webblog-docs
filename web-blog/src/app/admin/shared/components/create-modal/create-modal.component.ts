import { Component, OnInit, Input, Output, EventEmitter, ViewContainerRef } from '@angular/core';
import { buttonState, flash } from 'src/app/core/animation';
import { Modal } from 'src/app/core/interfaces/modal.interface';

@Component({
  selector: 'app-create-modal',
  templateUrl: './create-modal.component.html',
  styleUrls: ['./create-modal.component.scss'],
  animations: [buttonState]
})
export class CreateModalComponent implements OnInit, Modal<string[]> {
  
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<string[]>();
  @Input()  themes: string [] = [];

  public show: boolean;

  public id: any;
  public name?: string;
  public options?: any;
  public viewRef?: ViewContainerRef;

  constructor() { }

  ngOnInit(): void {
  }

}
