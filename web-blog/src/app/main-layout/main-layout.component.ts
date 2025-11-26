import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, fromEvent } from 'rxjs';
import { filter, map, skipWhile, takeUntil, tap } from 'rxjs/operators';
import { MainService } from '../main.service';
import { BreakpointService, Layout } from '../shared/services/breakpoint.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject();
  private scrollOffset: number = 25;
  public isHidden: boolean = false;

  public isHiddenForce = false;
  public isPinned = false;

  public layout: Layout = 'desktop';
  public screenSaveMode = true;

  private showRight: boolean;

  @HostListener('window:scroll')
  onWindowScroll() {
    if(this.isPinned) return;
    this.isHidden = (window.scrollY > this.scrollOffset) ||  this.isHiddenForce;
  }

  constructor(private mainService: MainService, private brService: BreakpointService,  private router: Router) { }

  ngOnInit(): void {
    this.mainService.home$.pipe(
      takeUntil(this.destroy$)).subscribe(page=>{
          if(page!='home'){
            this.router.navigate(['/']);
      }
    })

    this.mainService.header$.pipe(
      takeUntil(this.destroy$))
      .subscribe((isShow)=> {
        if(isShow) {
          this.isHidden = (window.scrollY > this.scrollOffset) && !this.isPinned ;
          } else {
            this.isHidden = !this.isPinned;// true;
          }
       // this.isHiddenForce = !isShow;
      });

    this.brService.layout$.pipe(
      takeUntil(this.destroy$))
      .subscribe(layout => {
        this.layout = layout;
      });

      this.brService.showRightPanel$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(show=>{
        if(this.showRight!=show){
          this.showRight = show;
          this.isHidden = false;
        }

      });

      this.brService.screenSaveMode$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(close => this.screenSaveMode = close);

      this.mainService.pinHeader$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(isPinned =>{
        this.isPinned=isPinned;
      });

  }

  ngAfterViewInit(){
    fromEvent(document, 'touchend')
    .pipe(
      takeUntil(this.destroy$),
      map((e:TouchEvent)=> (
        {
          isOnTop: e.changedTouches[0].clientY < 50,
          isOnBottom: e.changedTouches[0].clientY - (e.target as Element).clientHeight > -100
        }) ),
      filter(({isOnTop})=> !(isOnTop && !this.isHidden))
    )
    .subscribe((open)=> {
      if(open.isOnTop){
            this.isHidden = this.showRight;
        }
    });

    fromEvent(document, 'mousemove')
    .pipe(
      takeUntil(this.destroy$),
      map((e:MouseEvent)=> (
        {
          isOnTop: e.clientY < 50,
          isOnBottom: e.clientY - (e.target as Element).clientHeight > -100
        }) ),
        filter(()=>!this.isPinned),
        filter(({isOnTop: isOpen})=> ! (isOpen && !this.isHidden))
    )
    .subscribe((open)=> {

      if(open.isOnTop){
            this.isHidden = this.showRight;
        }
    });

  }

  onClick(){
    this.mainService.pinHeader();
  }

  homeClick(){
    this.mainService.homeClick();
  }


  rightDropClick(){
     this.brService.showRightPanel(!this.showRight);
     this.isHidden =  this.showRight && !this.isPinned;
  }

  getArrow(){
    return this.showRight? 'keyboard_double_arrow_left' : 'keyboard_double_arrow_right';
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
