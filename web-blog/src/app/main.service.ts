import { Injectable, OnDestroy } from '@angular/core';
import { RoutePage } from './core/types';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, fromEvent } from 'rxjs';
import { filter, map, skipWhile, takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class MainService implements OnDestroy {

  private readonly destroy$ = new Subject();
  public home$= new Subject<RoutePage >();
  public header$ = new Subject<boolean>();
  public pinHeader$ = new Subject<boolean>();

  public $isMobileDevice = new Subject<boolean>();
  public $hasTouchScreen = new Subject<boolean>();

  public currentPage:RoutePage = 'home';

  public isMobileDevice: boolean;
  public hasTouchScreen: boolean;

  public isTouch = ()=> !!('ontouchstart' in window || window.navigator.maxTouchPoints || 'ontouchstart' in document);

  constructor(private router:Router) {

    this.hasTouchScreen = this.isTouch();
    this.isMobileDevice = (navigator as any).userAgentData.mobile;

    this.router.events.pipe(
      takeUntil(this.destroy$),
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.url.split('/')[1];
      this.currentPage = !!url? url as RoutePage : 'home';
    });

    fromEvent(window, 'resize').pipe(
      takeUntil(this.destroy$),
      map(()=> this.isTouch()),
      skipWhile((val)=>val == this.hasTouchScreen),
    ).subscribe((isTouch)=>{

      this.hasTouchScreen = isTouch;
      this.$hasTouchScreen.next(isTouch);
      window.scroll({top: 0, behavior: 'smooth'});

      if(!isTouch){
        this.showHeader();
      }

    });

    fromEvent(window, 'resize').pipe(
      takeUntil(this.destroy$),
      map(()=> !!(navigator as any).userAgentData.mobile ),
      skipWhile((val)=>val == this.isMobileDevice),
    ).subscribe((isMobile)=>{

      this.isMobileDevice = isMobile;
      this.$isMobileDevice.next(isMobile);

    });

  }

  hideHeader(){
    this.header$.next(false);
  }

  showHeader(){
    this.header$.next(true)
  }

  pinHeader(){
    this.pinHeader$.next(true);
  }

  unPinHeader(){
    this.pinHeader$.next(false)
  }

  homeClick(){
    this.home$.next(this.currentPage);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
