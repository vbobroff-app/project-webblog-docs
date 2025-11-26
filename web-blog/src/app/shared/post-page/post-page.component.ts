import { Component, OnDestroy, OnInit } from '@angular/core';
import { Post } from '../../admin/shared/interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InfoService } from 'src/app/core/services/info.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-post-page',
  templateUrl: './post-page.component.html',
  styleUrls: ['./post-page.component.scss']
})
export class PostPageComponent implements OnInit, OnDestroy {

  public post: Post;
  public image: any;
  private readonly destroy$ = new Subject();

  constructor(
    private activatedRouter: ActivatedRoute, 
    private router: Router, 
    private infoService: InfoService, 
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.activatedRouter.data.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.post = data.target;

      if (this.post && this.post.icon) {
        this.image = this.sanitizer.bypassSecurityTrustUrl(this.post.icon);
      }

      this.trackView(this.post);
    })
  }

  /**
   * Увеличить счётчик просмотров поста
   */
  private trackView(post: Post): void {
    if (!post?.id) {
      return;
    }

    this.infoService.incrementView(post.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
