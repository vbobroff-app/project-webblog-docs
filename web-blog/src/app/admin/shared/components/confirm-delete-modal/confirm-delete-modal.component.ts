import { Component, OnInit, Output, EventEmitter, ViewContainerRef, Input } from '@angular/core';
import { Modal } from 'src/app/core/interfaces/modal.interface';
import { NgxSpinnerService } from 'ngx-spinner';
import { buttonState } from 'src/app/core/animation';

@Component({
  selector: 'app-confirm-delete-modal',
  templateUrl: './confirm-delete-modal.component.html',
  styleUrls: ['./confirm-delete-modal.component.scss'],
  animations: [buttonState]
})
export class ConfirmDeleteModalComponent implements OnInit, Modal<void> {
  
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
