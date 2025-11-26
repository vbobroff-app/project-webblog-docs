import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewContainerRef } from "@angular/core";
import { ProgressSpinnerMode } from "@angular/material/progress-spinner";
import { from, of, Subject } from "rxjs";
import { concatMap, delay, finalize, takeUntil } from "rxjs/operators";
import { Modal } from "src/app/core/interfaces/modal.interface";

const cnt: number[] = Array(101).fill(0).map((v, index) => index).reverse();

@Component({
  selector: 'app-refresh-modal',
  templateUrl: './refresh-modal.component.html',
  styleUrls: ['./refresh-modal.component.scss'],
})
export class RefreshModalComponent implements OnInit, Modal<void>, OnDestroy {

  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();

  public id;
  public name?: string;
  public options?: any;
  public viewRef?: ViewContainerRef;

  public timeout: number = 20;

  mode: ProgressSpinnerMode = 'determinate';

  public value = 100;
  public digit = 5;

  private readonly destroy$ = new Subject();

  constructor() { }


  ngOnInit(): void {
    from(cnt).pipe(
      takeUntil(this.destroy$),
      concatMap(x => of(x).pipe(delay(this.timeout))),
      finalize(() => {
        this.digit = 0;
        this.submit.emit();
      }),
    ).subscribe((v) => {
      this.value = v;
      const digit = Math.trunc(v / 20.0) + 1;
      if (digit < this.digit) {
        this.digit = digit;
      }
    });
  }

  cancelClick() {
    this.close.emit();
  }

  finalize() {
    this.close.emit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
