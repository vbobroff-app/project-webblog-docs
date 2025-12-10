import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { HubService } from 'src/app/admin/shared/services/hub.service';
import { buttonState, enterLeave, fadeOut } from 'src/app/core/animation';
import { ModalService } from 'src/app/core/services/modal.service';
import { RefDirective } from '../ref.directive';
import { ConfirmDeleteModalComponent } from '../shared/components/confirm-delete-modal/confirm-delete-modal.component';
import { Hub, Post } from '../shared/interfaces';
import { AlertService } from '../shared/services/alert.service';
import { PostService } from '../shared/services/posts.service';


@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
  animations: [buttonState, fadeOut, enterLeave],
})
export class DashboardPageComponent implements OnInit, OnDestroy {

  @ViewChild(RefDirective, { static: false }) refDirective: RefDirective;

  public posts: Post[] = [];
  public searchStr = '';
  public searchTheme = '';
  private readonly destroy$ = new Subject();
  public hubs: Hub[] = [];
  public selected: Hub;

  public deleteEnable: boolean;
  public loading: boolean;

  public form: FormGroup;
  public nameControl: FormControl = new FormControl('', [Validators.required]);

  public spinnerMessage = 'Сохранение...';

  constructor(private postService: PostService,
    private router: Router,
    private alertService: AlertService,
    private hubService: HubService,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private modalService: ModalService<void>) { }

  ngOnInit(): void {

    this.loading = true;
    this.hubService.getAll().pipe(
      takeUntil(this.destroy$),
      switchMap((hubs: Hub[]) => {
        this.hubs = hubs;
        return this.postService.getAllPosts(15);
      })).subscribe((posts) => {
        this.posts = posts;
        this.loading = false;
      });

    this.hubService.close$.pipe(takeUntil(this.destroy$)).subscribe((theme) => {
      const deleted = this.hubs.find(h => h.name == theme);

      if (deleted) {

        const confirmModal = this.modalService.createModal(ConfirmDeleteModalComponent, this.refDirective, 'admin-dashboard-confirm-hub-delete');
        confirmModal.text = `Удалить тему "${deleted.name}"из всех постов (2) и списка тем?`;

        confirmModal.submit.pipe(
          takeUntil(this.destroy$),
          switchMap(()=>this.hubService.remove(this.selected))
          ).subscribe(() => {

            confirmModal.finalize();
            this.alertService.success(`успешно удалена`, `Тема "${this.selected.name}"`);

            const index = this.hubs.indexOf(deleted, 0);
            if (index > -1) {
              this.hubs.splice(index, 1);
            }

            if (this.hubs.length) {
              this.hubClick(this.hubs[0]);
            }
        });
      }
      else {
        this.selected = null;
        this.form.reset();
      }
    })

    this.form = this.fb.group({
      name: this.nameControl,
      description: new FormControl('', [Validators.required])
    })
  }

 addClick(){
  this.router.navigate(['/admin', 'create']);
 }

  submit() {
    if (this.form.invalid || !this.selected) {
      return;
    }
    this.loading = true;
    this.selected.name = this.nameControl.value;
    this.selected.description = this.form.get('description').value;
    this.spinnerMessage = 'Сохранение...';
    this.spinner.show();
    this.hubService.put(this.selected).pipe(takeUntil(this.destroy$)).subscribe((post) => {
      this.loading = false;
      this.spinner.hide();
      this.alertService.success('успешно обновлена', `Тема "${post.name}"`);
    })
  }

  hubClick(hub: Hub) {
    if (this.selected && this.form.invalid) {
      this.form.markAsTouched();
      return;
    }
    this.form.reset();
    this.selected = hub;
    this.cd.detectChanges();
    this.nameControl.setValue(hub.name);
    this.form.get('description').setValue(hub.description);
  }

  onClick(){
    // this.postService.refPostByHubName(this.selected.name).subscribe(

    //   (response)=>console.log(response));

    //this.postService.refPostByHubName(this.selected.name).subscribe(
    // this.postService.setSome(this.selected.name).pipe(takeUntil(this.destroy$)).subscribe(

    //     (response)=>console.log(response));
  }


  remove(post: Post) {
      const confirmModal = this.modalService.createModal(ConfirmDeleteModalComponent, this.refDirective, 'admin-dashboard-confirm-post-delete');
      var name = post.title && post.title.length>255? post.title.substring(0,255) + '...' : post.title;
      confirmModal.text = `Удалить пост " ${name} "?`;
      confirmModal.submit.pipe(
        takeUntil(this.destroy$),
        switchMap(()=>this.postService.remove(post))
      ).subscribe(() => {

       confirmModal.finalize();
       this.posts = this.posts.filter(p => p.id != post.id);
       this.alertService.success(`успешно удален`, `Пост "${name}"`);
      });
  }

  edit(id: string) {
    this.router.navigate(['/admin', 'post', id, 'edit'])
  }


  onNameEnter(event) {

  }

  onDescriptionEnter(event) {

  }

  touch(control: FormControl) {
    if (!control.touched) {
      control.markAsTouched();
    }
  }

  onDeleteEnabledChange(value) {
    this.deleteEnable = value.checked;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
