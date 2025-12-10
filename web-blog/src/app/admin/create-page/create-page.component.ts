import { Component, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Post, Hub } from '../shared/interfaces';
import { PostService } from '../shared/services/posts.service';
import { AlertService } from '../shared/services/alert.service';
import { HubService } from 'src/app/admin/shared/services/hub.service';
import { Subject, Observable } from 'rxjs';
import { takeUntil, startWith, map, switchMap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { fadeOut, enterLeave, buttonState } from 'src/app/core/animation'
import { CreateModalComponent } from '../shared/components/create-modal/create-modal.component';
import { RefDirective } from '../ref.directive';
import { PostModalComponent } from '../shared/components/post-modal/post-modal.component';
import { ModalService } from 'src/app/core/services/modal.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-create-page',
  templateUrl: './create-page.component.html',
  styleUrls: ['./create-page.component.scss'],
  animations: [
    fadeOut, enterLeave, buttonState
  ]
})
export class CreatePageComponent implements OnInit, OnDestroy {

  @ViewChild(RefDirective, { static: false }) refDirective: RefDirective;

  private readonly destroy$ = new Subject();
  public iconURL: string;
  public loading: boolean;
  public blur: boolean;
  public form: FormGroup;
  public hubForm: FormGroup;
  public image: any;
  public hubs: Hub[] = [];
  public themes: string[] = [];

  filteredHubs: Observable<Hub[]>;
  public hubControl = new FormControl();

  constructor(private postService: PostService,
    private alertService: AlertService,
    private hubService: HubService,
    private sanitizer: DomSanitizer,
    private postModalService: ModalService<Post>,
    private hubModalService: ModalService<string[]>,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {

    this.createHubList();

    this.form = new FormGroup({
      title: new FormControl(null, [Validators.required]),
      description: new FormControl(null, [Validators.required]),
      text: new FormControl(null, [Validators.required]),
      author: new FormControl(null, [Validators.required]),
      icon: new FormControl(null)
    });
    this.hubForm = new FormGroup({
      hub: this.hubControl
    })
    this.hubService.close$.pipe(takeUntil(this.destroy$)).subscribe((theme) => {
      const index = this.themes.indexOf(theme, 0);
      if (index > -1) {
        this.themes.splice(index, 1);
      }
    })
  }

  createHubList() {
    this.hubService.getAll().pipe(
      takeUntil(this.destroy$),
    ).subscribe((hubs: Hub[]) => {
      this.hubs = hubs;
      this.filteredHubs = this.hubControl.valueChanges
        .pipe(
          takeUntil(this.destroy$),
          startWith(''),
          map(value => typeof value === 'string' ? value : value.name),
          map(name => name ? this.filter(name) : this.hubs.slice())
        );
    });
  }

  onLoadImage(imageUrl) {
    this.iconURL = imageUrl;
    this.image = this.sanitizer.bypassSecurityTrustUrl(this.iconURL);
  }

  onResetImage() {
    this.iconURL = null;
  }

  private filter(name: string): Hub[] {
    const filterValue = name.toLowerCase();
    return this.hubs.filter(hub => hub.name.toLowerCase().indexOf(filterValue) === 0);
  }

  displayHub(hub: Hub): string {
    return hub?.name ? hub.name : '';
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

  showCreateModal() {
    const createModal = this.hubModalService.createModal(CreateModalComponent, this.refDirective, 'admin-create-hub');
    createModal.themes = this.themes;
    createModal.submit
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.hubService.getAll()),
        switchMap((hubs: Hub[]) => {
          this.hubs = hubs;
          this.filteredHubs = this.hubControl.valueChanges
            .pipe(
              takeUntil(this.destroy$),
              startWith(''),
              map(value => typeof value === 'string' ? value : value.name),
              map(name => name ? this.filter(name) : this.hubs.slice())
            );
          const postModal = this.postModalService.createModal(PostModalComponent, this.refDirective, 'admin-post-create')
          let post: Post = {
            title: this.form.value.title,
            description: this.form.value.description,
            text: this.form.value.text,
            author: this.form.value.author,
            hubs: this.themes
          }
          if (this.iconURL?.length > 0) {
            post.icon = this.iconURL;
          }
          postModal.post = post;

          return postModal.submit
        }),
        switchMap((post: Post) => {
          if (this.iconURL?.length > 0) {
            post.icon = this.iconURL;
          }
          this.spinner.show('postCreateSpinner');
          return this.postService.create(post)
        })
      )
      .subscribe((response: Post) => {
        this.clearUp();
        this.spinner.hide('postCreateSpinner')
        var name = response.title.substring(0, 20) + '...';
        this.alertService.success(`успешно создан`, `Новый пост ${name}`);
      });
  }

  hubSubmit() {
    if (this.hubForm.invalid) {
      return;
    }
    const value: string = typeof this.hubControl.value === 'string' ? this.hubControl.value : this.hubControl.value.name;
    this.themes.push(value);
    this.hubControl.setValue('');
  }

  clearUp() {
    this.form.reset();
    this.iconURL = null;
    this.image = null;
    this.themes = [];
    this.refDirective.containerRef.clear();
  }

  showPostModal() {
    const postModal = this.postModalService.createModal(PostModalComponent, this.refDirective, 'admin-post-create')
    let post: Post = {
      title: this.form.value.title,
      description: this.form.value.description,
      text: this.form.value.text,
      author: this.form.value.author,
      hubs: this.themes
    }

    if (this.iconURL && this.iconURL.length > 0) {
      post.icon = this.iconURL;
    }
    postModal.post = post;

    postModal.submit
      .pipe(
        takeUntil(this.destroy$),
        switchMap((post) => {
          if (this.iconURL?.length > 0) {
            post.icon = this.iconURL;
          }
          this.spinner.show('postCreateSpinner');

          return this.postService.create(post)
        })
      )
      .subscribe((response: Post) => {
        this.clearUp();
        this.spinner.hide('postCreateSpinner')
        var name = response.title.substring(0, 20) + '...';
        this.alertService.success(`успешно создан`, `Новый пост ${name}`);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
