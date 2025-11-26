import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, fromEvent } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { BreakpointService, HeightPoint, heightValues } from '../services/breakpoint.service';
import { MainService } from 'src/app/main.service';

@Component({
  selector: 'app-selfie-page',
  templateUrl: './selfie-page.component.html',
  styleUrls: ['./selfie-page.component.scss']
})
export class SelfiePageComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject();

  @Input()
  public screenSaveMode: boolean = true;

  public heightState: HeightPoint = 'standard';
  public isTouch: boolean;

  constructor(private br: BreakpointService, private ms: MainService) { }

  ngOnInit(): void {

    this.ms.$hasTouchScreen.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isTouch=> this.isTouch = isTouch);

    this.br.heightState$.pipe(
      takeUntil(this.destroy$),
    ).subscribe(h=> this.heightState =  Object.keys(heightValues).find(key=> heightValues[key] === h) as HeightPoint );

    this.br.screenSaveMode$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(close=>this.screenSaveMode = close);

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
