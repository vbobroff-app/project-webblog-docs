import { Component, OnInit, Input, EventEmitter, Output, ViewContainerRef } from '@angular/core';
import { Post } from '../../interfaces';
import { DomSanitizer } from '@angular/platform-browser';
import { Modal } from 'src/app/core/interfaces/modal.interface';

@Component({
  selector: 'app-post-modal',
  templateUrl: './post-modal.component.html',
  styleUrls: ['./post-modal.component.scss']
})
export class PostModalComponent implements OnInit, Modal<Post> {

  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<Post>();
  @Input()  post: Post;

  public image: any;

  public id: any;
  public name?: string;
  public options?: any;
  public viewRef?: ViewContainerRef;

  constructor(private sanitizer: DomSanitizer) { }


  strip(html){
    var doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body.textContent || "").substr(0,255) + "...";
 }

 closeClick(){

 }

  ngOnInit(): void {
    if(this.post && this.post.icon){
      this.image = this.sanitizer.bypassSecurityTrustUrl(this.post.icon);
    }
  }

}
