import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { BreakpointService, Layout } from '../../services/breakpoint.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-paginator-adaptive',
  templateUrl: './paginator-adaptive.component.html',
  styleUrls: ['./paginator-adaptive.component.scss']
})
export class PaginatorAdaptiveComponent implements OnInit, OnDestroy {

  @Output() page = new EventEmitter<void>();
  @Input() public show: boolean;
  @Input() public showFirstLastButtons: boolean = true;
  @Input() public pageSize: number = 5;
  @Input() public length: number = 100;
  @Input() public pageSizeOptions: number[] = [5, 10, 25, 100];
  @Input() public isRightAlign: boolean;



  private readonly destroy$ = new Subject();




  constructor() { }

  ngOnInit(): void {

  }



  emitPagination($event){
    this.page.emit($event);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
