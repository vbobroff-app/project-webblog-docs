import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-close-button',
  templateUrl: './close-button.component.html',
  styleUrls: ['./close-button.component.scss']
})
export class CloseButtonComponent implements OnInit {
  
  @Output() close = new EventEmitter<void>();
  @Input() disabled: boolean = false; 

  constructor() { }

  ngOnInit(): void {
    
  }

  closeClick(){
    if(this.disabled){
      return;
    }
    this.close.emit();
  }

}
