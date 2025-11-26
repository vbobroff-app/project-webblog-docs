import { Injectable, OnDestroy } from '@angular/core';
import { combineLatest, fromEvent, Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';

export type HeightPoint = 'high' | 'standard' | 'short';
export type Layout = 'mobile' | 'tablet' | 'narrow'| 'middle' | 'desktop';


export const heightValues: Record<HeightPoint, number> = {
  short: 0,
  standard: 740,
  high: 970
};

export const breakpoints: Record<Layout, number> = {
  mobile: 0,
  tablet: 600,
  narrow: 970,
  middle: 1370,
  desktop: 1580
};

@Injectable({
  providedIn: 'root'
})
export class BreakpointService implements OnDestroy {

  private readonly destroy$ = new Subject();

  public layout$: Observable<Layout>;
  public heightState$: Observable<number>;
  public showRightPanel$ = new Subject<boolean>();
  public screenSaveMode$ = new Subject<boolean>();

  public currentLayout: Layout = 'desktop';
  public isShowRightPanel: boolean = false;
  public screenSaveMode: boolean = true;

  readonly breakpoints = breakpoints;
  readonly heightValues = heightValues;

  constructor() {

    this.layout$ = this.getResponsiveValue<Layout>({
      mobile: 'mobile',
      tablet: 'tablet',
      narrow: 'narrow',
      middle: 'middle',
      desktop: 'desktop'
    });

    this.layout$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(layout=> this.currentLayout = layout);

    this.heightState$ = this.getResponsiveHeight<number>(heightValues);

   }

  getMatchingBreakpoint(): Observable<Layout> {
    const bpNames = Object.keys(this.breakpoints) as Layout[];
    const bpValues = Object.values(this.breakpoints);
    const queries = bpValues.map(bp => `(min-width: ${bp}px)`);


    const matches$ = queries.map(query => {
      const matchMedia = window.matchMedia(query);

      return fromEvent<MediaQueryListEvent>(matchMedia, 'change').pipe(
        map(event => event.matches),
        startWith(matchMedia.matches)
      );
    });

    return combineLatest(matches$).pipe(
      map(matches => bpNames[matches.lastIndexOf(true)])
    );
  }

  getMatching<T extends string>(queryKey: string, values:Record <T,number> ):Observable<T> {
    const hNames = Object.keys(values) as T[];
    const hValues = Object.values(values);
    const queries = hValues.map(h => `(${queryKey}: ${h}px)`);

    const matches$ = queries.map(query => {
      const matchMedia = window.matchMedia(query);

      return fromEvent<MediaQueryListEvent>(matchMedia, 'change').pipe(
        map(event => event.matches),
        startWith(matchMedia.matches)
      );

    });

    return combineLatest(matches$).pipe(
      map(matches => hNames[matches.lastIndexOf(true)])
    );

  }

  getResponsiveHeight<T>(values: Record<HeightPoint, T>): Observable<T> {
    return this.getMatching<HeightPoint>('min-height', heightValues).pipe(
      map(device => values[device])
    );
  }

  getResponsiveValue<T>(values: Record<Layout, T>): Observable<T> {
    return this.getMatching<Layout>('min-width', breakpoints).pipe(
      map(breakpoint => values[breakpoint])
    );
  }

  showRightPanel(show: boolean = true){
    this.isShowRightPanel = show;
    this.showRightPanel$.next(show);
  }

  setScreenSaver(close: boolean = true){
    this.screenSaveMode = close;
    this.screenSaveMode$.next(close);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


}
