import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { flash } from 'src/app/core/animation';
import { mapIcons } from 'src/app/core/defaults';
import { MessageType } from 'src/app/core/types';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  animations: [flash]
})
export class ModalComponent implements OnInit, OnDestroy {

  @Input() title: string;
  @Input() type: MessageType;
  @Output() close = new EventEmitter<void>();

  public show: boolean = false;

  public imageSource = './assets/icons/warning-icon.svg';

  public icon: string;

  constructor() { }

  ngOnInit(): void {

   this.icon = mapIcons[this.type];
    setTimeout(()=>{this.show = true;}, 100);
  }

  ngOnDestroy() {
    this.show = false;
  }

}
