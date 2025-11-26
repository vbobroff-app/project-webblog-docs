import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Post } from 'src/app/admin/shared/interfaces';

import { BreakpointService, Layout } from '../../services/breakpoint.service';
import { PostService } from 'src/app/admin/shared/services/posts.service';

@Component({
  selector: 'app-post-lists',
  templateUrl: './post-lists.component.html',
  styleUrls: ['./post-lists.component.scss']
})
export class PostListsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject();
  public recent$: Observable<Post[]>;
  public popular$: Observable<Post[]>;

  public layout: Layout = 'desktop';

  constructor(private postService: PostService, private breakpointService: BreakpointService) { }

  ngOnInit(): void {

   this.breakpointService.layout$.pipe( takeUntil(this.destroy$)).subscribe(layout => this.layout=layout);

   this.recent$ = this.postService.getRecent()
    .pipe(
      takeUntil(this.destroy$)
    );

    this.popular$ = this.postService.getPopular()
    .pipe(
      takeUntil(this.destroy$)
    );
  }

  getAuthLength(){
    if(this.layout == 'mobile') {
      return 10;
    }
    return 14;
  }

  geTitleLength(){
    if(this.layout == 'mobile') {
      return 24;
    }
    return 28;
  }

  getShortName(name: string): string {

    const items =  name.split(' ');
    const shorts =items.map((item, index)=>{
      if(index==items.length-1){
        return item;
      }
      else {
        return item.substring(0,1)+'.';
      }
    })
    return shorts.join(' ');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
