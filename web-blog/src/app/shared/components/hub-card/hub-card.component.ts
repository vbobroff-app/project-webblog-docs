import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Hub } from 'src/app/admin/shared/interfaces';

import { PostService } from 'src/app/admin/shared/services/posts.service';
import { HubService } from '../../../admin/shared/services/hub.service';

@Component({
  selector: 'app-hub-card',
  templateUrl: './hub-card.component.html',
  styleUrls: ['./hub-card.component.scss']
})
export class HubCardComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject();

  public hub: Hub;
  public isFiltered: boolean;

  public expanded = true;

  constructor(private hubService: HubService, private postService: PostService) { }

  ngOnInit(): void {
    this.hubService.select$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(hub =>{
      this.hub = hub;
      this.expanded = hub?.description?.length < 160;
    });

  }

  textClick(){
    if(this.hub.description?.length<160) return;
    this.expanded = !this.expanded;
  }

  postCount() {
    return this.hub?.posts?.length;
  }

  postsClick() {
    this.isFiltered = !this.isFiltered;
    if (this.isFiltered) {
      this.postService.select(this.hub.posts);
    }
    else {
      this.postService.resetAll();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
