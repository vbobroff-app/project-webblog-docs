import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter } from '@angular/material/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { fromEvent, Observable, Subject } from 'rxjs';
import { filter, map, skip, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { buttonState, enterLeave, fadeOut } from 'src/app/core/animation';
import { ModalService } from 'src/app/core/services/modal.service';
import { RefDirective } from '../ref.directive';
import { Hub, Post, postClone } from '../shared/interfaces';
import { AlertService } from '../shared/services/alert.service';
import { PostService } from '../shared/services/posts.service';

import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import * as _moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { HubService } from 'src/app/admin/shared/services/hub.service';
import { CreateModalComponent } from '../shared/components/create-modal/create-modal.component';
import { PostModalComponent } from '../shared/components/post-modal/post-modal.component';
import { RefreshModalComponent } from '../shared/components/refresh-modal/refresh-modal.component';
// tslint:disable-next-line:no-duplicate-imports
//import {default as _rollupMoment} from 'moment';

type Position = 'middle' | 'top' | 'bottom' | 'unknown';

const moment = _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.component.html',
  styleUrls: ['./edit-page.component.scss'],
  animations: [
    fadeOut, enterLeave, buttonState
  ],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class EditPageComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject();

  public defaultPost: Post;

  public form: FormGroup;
  private post: Post;
  public submitted = true;

  public toggled = false;

  public imageUrl: string;
  public image: any;

  public hubForm: FormGroup;
  public hubs: Hub[] = [];
  public themes: string[] = [];

  filteredHubs$: Observable<Hub[]>;
  formInit$: Subject<boolean> = new Subject();
  public hubControl = new FormControl();

  public isHiddenHeader = false;
  public isHiddenFooter = false;
  private scrollOffset = 25;

  public position: Position = 'unknown';

  private editorElement: HTMLDivElement;
  private scrollBottom: number;
  public scrollPosition: Position = 'top';

  @ViewChild(RefDirective, { static: false }) refDirective: RefDirective;


  @ViewChild('container')
  container: ElementRef<HTMLDivElement>;

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isHiddenFooter = (window.scrollY > this.scrollOffset);
    this.isHiddenHeader = this.isHiddenFooter;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private postService: PostService,
    private hubService: HubService,
    private alertService: AlertService,
    private sanitizer: DomSanitizer,
    private modalService: ModalService<void>,
    private hubModalService: ModalService<string[]>,
    private postModalService: ModalService<Post>,
    private spinner: NgxSpinnerService,
    private cd: ChangeDetectorRef) { }


  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$),
      switchMap((params: Params) => {
        return this.postService.getById(params['id']);
      }),
      switchMap((post: Post) => {
        this.defaultPost = postClone(post);
        this.post = post;
        this.form = new FormGroup({
          author: new FormControl(post.author, Validators.required),
          created: new FormControl(this.defaultPost.created.toISOString().slice(0, -1), Validators.required),
          title: new FormControl(post.title, Validators.required),
          description: new FormControl(post.description, Validators.required),
          text: new FormControl(post.text, Validators.required)
        });
        this.imageUrl = this.post.icon;
        if (post.hubs) {
          this.themes = post.hubs;
        }

        this.formInit$.next();

        return this.hubService.getAll();
      })

    ).subscribe((hubs: Hub[]) => {
      this.hubs = hubs;
      this.filteredHubs$ = this.hubControl.valueChanges
        .pipe(
          takeUntil(this.destroy$),
          startWith(''),
          map(value => typeof value === 'string' ? value : value.name),
          map(name => name ? this.filter(name) : this.hubs.slice())
        );
    });

    this.formInit$.pipe(
      switchMap(() => this.form.valueChanges),
      skip(1),
    ).subscribe(() => this.submitted = false);

    this.hubForm = new FormGroup({
      hub: this.hubControl
    });

    this.hubService.close$.pipe(takeUntil(this.destroy$)).subscribe((theme) => {
      const index = this.themes.indexOf(theme, 0);
      if (index > -1) {
        this.themes.splice(index, 1);
      }
    })

    fromEvent(document, 'mousemove')
      .pipe(
        takeUntil(this.destroy$),
        filter(() => !!this.container?.nativeElement),
        map((e: MouseEvent) => {
          let pos: Position = 'middle';
          if (e.clientY < 50) {
            pos = 'top';
          } else if (e.clientY - this.container.nativeElement.clientHeight > -220) {
            pos = 'bottom'
          };
          return pos;

        }),
        filter((pos) => pos != this.position)
      )
      .subscribe((pos) => {

        this.position = pos;
        this.isHiddenFooter = pos != 'bottom';
      });

  }



  private filter(name: string): Hub[] {

    const filterValue = name.toLowerCase();
    return this.hubs.filter(hub => hub.name.toLowerCase().indexOf(filterValue) === 0);
  }

  clearClick(){
    this.hubControl.setValue('');

  }

  someButtonClick() {
    this.cd.detectChanges();
    var value = this.form.get('created').value;
    var v = new Date(value);

    this.cd.detectChanges();
    //x.setValue(this.post.created);
    // debugger;
  }

  onToggle() {
    this.toggled = !this.toggled;
    window.scroll({ top: 0, behavior: 'smooth' })
  }

  backOnClick() {
    this.router.navigate(['/admin']);
  }

  onEditorCreated($event){
    if(!this.editorElement){
      this.getEditorElement();
    }
  }

  getEditorElement() {
    const element = document.getElementsByClassName("ql-container");
    this.editorElement = element?.item(1) as HTMLDivElement;
    if (!this.editorElement) {
      return;
    };

    this.scrollBottom = this.editorElement.scrollHeight -  this.editorElement.offsetHeight;

    fromEvent(this.editorElement, 'scroll').pipe(
      takeUntil(this.destroy$),
      map((e: Event)=> (e.target as Element).scrollTop),
      map((scrollTop)=> {
        let position: Position = 'middle';
        if( scrollTop< 1){
          position = 'top';
        }
        if(scrollTop> this.scrollBottom) {
          position = 'bottom';
        }
        return position;
        }
      ),
      filter((pos)=>pos!=this.scrollPosition),
    ).subscribe((pos)=>this.scrollPosition =  pos);

  }

  onScrollUp() {
    if(!this.editorElement){
      this.getEditorElement();
    }
    if(!this.editorElement){
      return;
    }

    this.editorElement.scroll({ top: 0, behavior: 'smooth' });


  }

  onScrollDown() {
    if(!this.editorElement){
      this.getEditorElement();
    }
    if(!this.editorElement){
      return;
    }
    this.editorElement.scroll({ top: this.editorElement.scrollHeight, behavior: 'smooth' });
    window.scroll({top: this.container.nativeElement.scrollHeight, behavior: 'smooth'})

  }

  refreshClick() {
    const confirmModal = this.modalService.createModal(RefreshModalComponent, this.refDirective, 'admin-edit-confirm-refresh');

    confirmModal.submit.pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.postService.getById(this.post.id))
    ).subscribe((post: Post) => {
      this.post = post;
      this.form.get('created').setValue(this.post.created.toISOString().slice(0, -1));

      this.imageUrl = this.post.icon;

      this.themes = this.post.hubs ? [...this.post.hubs] : [];
      this.form.get('author').setValue(this.post.author);
      this.form.get('title').setValue(this.post.title);
      this.form.get('description').setValue(this.post.description);
      this.form.get('text').setValue(this.post.text);

      if(!!post && this.form.valid){
        this.submitted = true;
      }

      confirmModal.finalize();
    });


  }

  submit() {
    if (this.form.invalid) {
      return;
    }
    let existNew = this.hubs && this.themes.filter(t => !this.hubs.find(h => h.name == t)).length > 0;
    if (existNew) {
      this.showCreateModal();
    }
    else {
      this.showPostModal();
    }

  }

  showPostModal() {
    const postModal = this.postModalService.createModal(PostModalComponent, this.refDirective, 'admin-post-create')
    let post: Post = {
      ...this.post,
      title: this.form.value.title,
      description: this.form.value.description,
      text: this.form.value.text,
      author: this.form.value.author,
      hubs: this.themes
    }
    if (this.imageUrl?.length > 0) {
      post.icon = this.imageUrl;
    }
    postModal.post = post;
    postModal.submit
      .pipe(
        takeUntil(this.destroy$),
        switchMap((post: Post) => {
          this.spinner.show('postUpdateSpinner');
          return this.postService.update(post)
        })
      )
      .subscribe((response) => {
        this.submitted = false;
        this.spinner.hide('postUpdateSpinner');
        this.postModalService.closeAll();
        var name = response.title.substring(0, 20) + '...';
        this.alertService.success(`был успешно обновлен`, `Пост ${name}`);
      });
  }

  showCreateModal() {
    const createModal = this.hubModalService.createModal(CreateModalComponent, this.refDirective, 'admin-edit-create-hub');
    createModal.themes = this.themes;
    createModal.submit
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.hubService.getAll()),
        switchMap((hubs: Hub[]) => {
          this.hubs = hubs;
          this.filteredHubs$ = this.hubControl.valueChanges
            .pipe(
              takeUntil(this.destroy$),
              startWith(''),
              map(value => typeof value === 'string' ? value : value.name),
              map(name => name ? this.filter(name) : this.hubs.slice())
            );
          const postModal = this.postModalService.createModal(PostModalComponent, this.refDirective, 'admin-edit-post-create')
          let post: Post = {
            ...this.post,
            title: this.form.value.title,
            description: this.form.value.description,
            text: this.form.value.text,
            author: this.form.value.author,
            hubs: this.themes
          }
          if (this.imageUrl?.length > 0) {
            post.icon = this.imageUrl;
          }
          postModal.post = post;

          return postModal.submit
        }),
        switchMap((post: Post) => {
          if (this.imageUrl?.length > 0) {
            post.icon = this.imageUrl;
          }
          this.spinner.show('postUpdateSpinner');

          return this.postService.update(post)
        })
      )
      .subscribe((response) => {
        this.submitted = false;
        this.spinner.hide('postUpdateSpinner')
        this.postModalService.closeAll();
        var name = response.title.substring(0, 20) + '...';
        this.alertService.success(`был успешно обновлен`, `Пост ${name}`);
      });
  }

  onLoadImage(imageUrl) {
    this.imageUrl = imageUrl;
    this.image = this.sanitizer.bypassSecurityTrustUrl(this.imageUrl);
    this.submitted = false;
  }

  onResetImage() {
    this.imageUrl = null;
    this.submitted= false;
  }


  hubSubmit() {
    if (this.hubForm.invalid) {
      return;
    }
    this.submitted = false;
    const value: string = typeof this.hubControl.value === 'string' ? this.hubControl.value : this.hubControl.value.name;
    this.themes.push(value);
    this.hubControl.setValue('');
  }

  displayHub(hub: Hub): string {
    return hub && hub.name ? hub.name : '';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
