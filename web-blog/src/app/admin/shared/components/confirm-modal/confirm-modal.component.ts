import { Component, OnInit, EventEmitter, Output, Input, ViewContainerRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { buttonState, buttonCancelState } from 'src/app/core/animation';
import { Modal } from 'src/app/core/interfaces/modal.interface';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
  animations: [buttonState, buttonCancelState]
})
export class ConfirmModalComponent implements OnInit, Modal<void> {

  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();

  @Input() loading: boolean = false;
  @Input() text: string;
  
  public id: any;
  public name?: string;
  public options?: any;
  public viewRef?: ViewContainerRef;

  public timeout:number = 10000;

  constructor(private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
  }

  onClick(){
    this.loading = true;
    this.submit.emit();
    this.spinner.show('confirmDeleteSpinner');
    setTimeout(() => {
      if(this.loading){
        this.loading = false;
        this.spinner.hide('confirmDeleteSpinner');    
        console.error('Ошибка удаления: превышение таймаута');
      }
    }, this.timeout);
  }

  finalize(){
    this.loading = false;
    this.spinner.hide('confirmDeleteSpinner');
    this.close.emit();
  }

}
