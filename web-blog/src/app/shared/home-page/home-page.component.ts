import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Observable, Subject, fromEvent } from 'rxjs';
import { debounceTime, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { MainService } from 'src/app/main.service';
import { Post } from '../../admin/shared/interfaces';
import { HubService } from '../../admin/shared/services/hub.service';
import { PostService } from '../../admin/shared/services/posts.service';
import { BreakpointService, Layout } from '../services/breakpoint.service';


interface PageData extends PageEvent {
  startIndex: number;
  endIndex: number;
}

const mainMarginTop = 50;
const descTopHeight = 970;


@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject();

  public pageData: PageData = {
    pageIndex: 0,
    pageSize: 5,
    length: 100,
    startIndex: 0,
    endIndex: 5
  };
  public pagesLength: number = 100;
  public pageSizeOptions: number[] = [5, 10, 25, 100];

  public posts: Post[];
  public selected: Post[] = [];
  public navFixed: boolean = false;
  public postScrollBottom = false;
  public showFooter = false;
  public isOnTop = false;

  public oldScrollTop = 0;
  public oldScrollLeft = 1000;

  public xBlocked = false;
  public yBlocked = false;

  private touched: boolean = false;

  public layout: Layout = 'desktop';
  public isHighDevice: boolean = true;
  public isNarrow: boolean = false;


  public hasTouchScreen: boolean;
  public isDesktop: boolean = true;
  public isMobile: boolean = false;

  public movedRightBar: boolean = false;
  public hidePanel: boolean = false;

  public layout$: Observable<Layout>;
  public heightState$: Observable<number>;

  public fakePost: Post = {
    id: '#111',
    text: 'fdsadsafds fdsafdsa;kjkl  ;lkfj;fds;  ;k;llkl;lkl;kl;  ;lk;lk  ',
    title: 'This is Post #111',
    description: 'description',
    author: 'Viktor Bobrofff'
  }

  public newPost: Post = {
    text: 'fdsadsafds fdsafdsa;kjkl  ;lkfj;fds;  ;k;llkl;lkl;kl;  ;lk;lk  ',
    title: 'Post Post post',
    description: 'fdsasdfds fdsajkl;ewqp] a[pok m; klkfgdagfs',
    author: 'Ivan Ivanov'
  }

  constructor(private paginatorIntl: MatPaginatorIntl,
    private mainService: MainService,
    private breakpointService: BreakpointService,
    private postService: PostService, private hubService: HubService,
    private cd: ChangeDetectorRef,
    private router: Router) {
    this.layout$ = breakpointService.layout$;
    this.heightState$ = breakpointService.heightState$;
  }

  @ViewChild('mainContainer')
  mainContainer: ElementRef<HTMLDivElement>;

  @ViewChild('profileContainer')
  profileContainer: ElementRef<HTMLDivElement>;

  @ViewChild('centerContainer')
  centerContainer: ElementRef<HTMLDivElement>;

  @ViewChild('postContainer')
  postContainer: ElementRef<HTMLDivElement>;

  @ViewChild('rightContainer')
  rightContainer: ElementRef;

  @ViewChild('rightScroll')
  rightScroll: ElementRef;




  ngOnInit(): void {

    this.hasTouchScreen = this.mainService.hasTouchScreen;

    this.mainService.$hasTouchScreen.pipe(
      takeUntil(this.destroy$),
    ).subscribe((isTouch) => {
      this.hasTouchScreen = isTouch;

      this.oldScrollTop = 10000;
      (this.profileContainer.nativeElement as Element).scroll({ top: 0, behavior: 'smooth' });
      this.breakpointService.setScreenSaver();

    });

    this.paginatorInit();

    this.mainService.home$.pipe(
      takeUntil(this.destroy$),
    ).subscribe(page => {
      if (page == 'home') {
        this.oldScrollTop = 10000;
        (this.profileContainer.nativeElement as Element).scroll({ top: 0, behavior: 'smooth' });
        this.breakpointService.setScreenSaver();
      }
    })

    const mouseEvents = fromEvent(document, 'mousemove');

    mouseEvents
      .pipe(
        takeUntil(this.destroy$),
        filter(() => false),
        debounceTime(10000),
      )
      .subscribe((event: MouseEvent) => {
        if (this.isMobile) {
          //this.scrollFixedMobile(this.centerContainer, this.postContainer, 'fix');

          // window.scroll({top: 0, behavior: 'smooth'});
          // this.screenSaveMode = !this.dropAction;

        }

      });


    this.layout$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(layout => {

      if (this.rightScroll?.nativeElement) {
        this.rightScroll.nativeElement.scroll({ left: 10000 });
      }


      this.mainService.showHeader();
      this.isOnTop = true;

      this.isMobile = this.isMobileDevice(layout);
      this.isDesktop = this.isLayoutDesktop(layout);
      this.isNarrow = layout == 'narrow';


      if (layout != this.layout) {

        this.breakpointService.showRightPanel(false);

        if (layout == 'desktop' || layout == 'middle') {
          this.paginatorIntl.itemsPerPageLabel = 'Постов на странице';
        } else {
          this.paginatorIntl.itemsPerPageLabel = '';
        }

        this.pageSizeOptions = [5, 10, 25, 100]; //change paginator state
      }

      this.layout = layout;

      if (!this.isDesktop && layout != 'middle') {
        this.hidePanel = true;
      }

      if (layout == 'mobile' || layout == 'tablet') {
        this.breakpointService.setScreenSaver();

        if (this.profileContainer) {
          (this.profileContainer.nativeElement as Element).scroll({ top: 0, behavior: 'smooth' });
        }

      }

      if (layout == 'narrow' || layout == 'middle') {
        this.breakpointService.setScreenSaver();
      }

    });

    this.heightState$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(height => {

      this.isHighDevice = height >= descTopHeight;

    });


    this.postService.getAllPosts().pipe(
      takeUntil(this.destroy$),
      tap(posts => {
        if (posts?.length && posts[0].hubs?.length) {
          const defaultHub = posts[0].hubs[0];
          this.hubService.select(defaultHub);
        }
      })
    ).subscribe(posts => {
      this.setPosts(posts);
    });

    this.postService.select$.pipe(
      takeUntil(this.destroy$),
      switchMap(ids => ids?.length ? this.postService.getByRange(ids) : this.postService.getAllPosts())
    ).subscribe(posts => {
      this.setPosts(posts);
    });

    this.breakpointService.showRightPanel$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(show => {
      if (show) {
        this.hidePanel = false;
        this.showFooter = false;

        this.rightScroll.nativeElement.scroll({ left: 10000 });
        this.touched = false; //important!!!
      }

      this.movedRightBar = show;
    });

  }

  ngAfterViewInit() {

    this.rightScroll.nativeElement.scroll({ left: 10000 });


    fromEvent(this.centerContainer.nativeElement, 'mousemove')
      .pipe(
        takeUntil(this.destroy$),
        filter(() => !this.mainService.hasTouchScreen),
        map((e: MouseEvent) => {
          const mainOffset = e.clientY - this.mainContainer.nativeElement.clientHeight;
          const centerOffset = e.clientY - this.centerContainer.nativeElement.clientHeight;
          return { isOnBottom: mainOffset > -100 || centerOffset > -100, isOnTop: e.clientY < 50 };
        }),
        filter((pos) => pos.isOnBottom != this.showFooter || pos.isOnTop != this.isOnTop)
      )
      .subscribe((pos) => {
        if (pos.isOnBottom) {
          this.showFooter = true;
        } else if (!pos.isOnTop) {
          this.showFooter = false;
        }


        if (pos.isOnTop) {
          this.mainService.showHeader();
        }

        if (!pos.isOnTop && this.layout != 'desktop' && this.layout != 'middle') {
          this.mainService.hideHeader();
        }

        this.isOnTop = pos.isOnTop;

      });


    fromEvent(window, 'mousemove')
      .pipe(
        takeUntil(this.destroy$),
        map((e: MouseEvent) => {
          const offset = e.clientY - this.mainContainer.nativeElement.clientHeight;
          return { isOnBottom: offset > -100, isOnTop: e.clientY < 50 };
        }),
        filter(({ isOnBottom }) => isOnBottom != this.showFooter)
      )
      .subscribe((pos) => {
        if (pos.isOnBottom) {
          if (!this.breakpointService.isShowRightPanel) {
            this.showFooter = true;
          }
        } else if (!pos.isOnTop) {
          this.showFooter = false;
        }
      });

  }

  paginatorInit(label: string = 'Постов на странице') {
    this.paginatorIntl.itemsPerPageLabel = label;
    this.paginatorIntl.firstPageLabel = '';
    this.paginatorIntl.lastPageLabel = '';
    this.paginatorIntl.nextPageLabel = '';
    this.paginatorIntl.previousPageLabel = '';

    this.paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length == 0 || pageSize == 0) { return `0 из ${length}`; }
      length = Math.max(length, 0);
      const start = page * pageSize;
      const end = start < length ?
        Math.min(start + pageSize, length) :
        start + pageSize;

      this.pageData = {
        pageIndex: page,
        pageSize: pageSize,
        length,
        startIndex: start,
        endIndex: end
      };

      return this.layout == 'mobile' ? '' : `${start + 1} - ${end} из ${length}`;
    }
  }

  getScrollLeft($event: Event) {
    const element = $event.target as Element;
    return {
      element,
      scrollLeft: element.scrollLeft,
    }
  }

  onPanelScroll($event) {
    const { scrollLeft } = this.getScrollLeft($event);
    const { scrollTop } = this.getScrollTop($event);

    if (this.touched && scrollTop != this.oldScrollTop) {
      this.xBlocked = true;
      this.cd.detectChanges();
    } else
      if (this.touched && scrollLeft != this.oldScrollLeft) {
        this.yBlocked = true;
        this.cd.detectChanges();
      }

    const isDirRight = scrollLeft < this.oldScrollLeft;

    this.oldScrollLeft = scrollLeft;
    this.oldScrollTop = scrollTop;

    if (!this.touched && isDirRight && scrollLeft < 240) {
      this.touched = true;
      this.breakpointService.showRightPanel(false);
    }

  }


  panelTouchStart($event: TouchEvent) {
    this.touched = true;

    const element = this.rightContainer.nativeElement as Element;
    const isOnBottom = $event.touches[0].clientY - element.clientHeight > -100;

    if (!isOnBottom) {
      this.mainService.hideHeader();
    }

  }


  panelTouchEnd($event) {
    this.touched = false;

    this.xBlocked = false;
    this.yBlocked = false;

  }

  onClick(close = false) {

    if (this.mainService.hasTouchScreen) {
      return;
    }


    if (!this.breakpointService.isShowRightPanel) {
      this.mainService.unPinHeader();
    }


    if (this.layout == 'desktop' || this.layout == 'middle') {
      return;
    }

    this.mainService.hideHeader();

    if (close) {
      this.breakpointService.showRightPanel(false);
    }
  }

  profileTouchStart($event) {
    this.touched = true;
  }

  profileTouchEnd($event) {
    this.touched = false;
    this.mainService.hideHeader();

    setTimeout(() => {
      if (this.breakpointService.screenSaveMode) {
        (this.profileContainer.nativeElement as Element).scroll({ top: 0, behavior: 'smooth' });
      }
    }, 50)

  }

  getScrollTop($event: Event) {
    const element = $event.target as Element;
    return {
      element,
      scrollTop: element.scrollTop,
    }
  }



  onProfileScroll($event) {
    const { scrollTop } = this.getScrollTop($event);

    const isDirUp = scrollTop > this.oldScrollTop;

    if (isDirUp && !this.touched) {
      this.breakpointService.setScreenSaver(false);
    }

    this.oldScrollTop = (scrollTop > 0) ? scrollTop : 0;
  }


  onProfileWheel($event: WheelEvent) {
    if ($event.deltaY < 0) {
      this.breakpointService.setScreenSaver();
      (this.profileContainer.nativeElement as Element).scroll({ top: 0, behavior: 'smooth' });
    }
    if ($event.deltaY > 0) {
      this.breakpointService.setScreenSaver(false);
      setTimeout(() => {
        (this.profileContainer.nativeElement as Element).scroll({ top: this.profileContainer.nativeElement.clientHeight, behavior: 'smooth' });
      }, 200)

    }
  }

  postTouchStart($event: TouchEvent) {
    const element = this.centerContainer.nativeElement as Element;
    const isOnBottom = $event.touches[0].clientY - element.clientHeight > -100;
    const isOnTop = $event.touches[0].clientY < 50;

    if (this.breakpointService.isShowRightPanel) {
      this.breakpointService.showRightPanel(false);
      return;
    }

    if (isOnBottom) {
      this.showFooter = true;
    }
    else {
      this.mainService.unPinHeader();
      this.mainService.hideHeader();
      if (!isOnTop) {
        this.showFooter = false;
      }
    }

  }

  onPostsScroll($event) {
    const { scrollTop } = this.getScrollTop($event);

    if (scrollTop == 0 && this.layout == 'desktop') {
      this.mainService.showHeader();
    }

    this.oldScrollTop = (scrollTop > 0) ? scrollTop : 0;
  }


  isLayoutDesktop(layout?: Layout) {
    return !!layout ? layout == 'desktop' : this.layout == 'desktop';
  }

  isMobileDevice(layout?: Layout) {
    const current = !!layout ? layout : this.layout;
    return current == 'mobile' || current == 'tablet';
  }

  setPosts(posts: Post[]) {
    this.posts = posts;
    this.pagesLength = posts?.length;

    this.cd.detectChanges();
    this.emitPagination(this.pageData);

  }

  setFakePosts() {
    const posts: Post[] = [];
    for (let i = 0; i < 10; i++) {
      posts.push({ ...this.newPost });
      posts.push({ ...this.fakePost });
    }

    this.posts = posts;
    this.pagesLength = posts?.length;
    this.pagination(posts);
  }

  pagination(posts: Post[]) {
    this.selected = posts?.slice(this.pageData?.startIndex, this.pageData?.endIndex);
  }

  emitPagination(pageEvent: PageEvent) {
    if (pageEvent.length == 0 || pageEvent.pageSize == 0) { return }
    length = Math.max(pageEvent.length, 0);
    const start = pageEvent.pageIndex * pageEvent.pageSize;
    const end = start < length
      ? Math.min(start + pageEvent.pageSize, length)
      : start + pageEvent.pageSize;

    this.pageData = {
      ...pageEvent,
      startIndex: start,
      endIndex: end
    };

    this.pagination(this.posts);
  }



  postClick(id: number) {
    this.router.navigate(['/post', id]);
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
