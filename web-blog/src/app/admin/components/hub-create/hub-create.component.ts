import { Component, OnInit, Input, ChangeDetectorRef, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Hub } from '../../shared/interfaces';
import { HubService } from 'src/app/admin/shared/services/hub.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { buttonState, fadeOut, enterLeave, flash } from 'src/app/core/animation';
import { NgxSpinnerService } from "ngx-spinner";
import { AlertService } from '../../shared/services/alert.service';


@Component({
  selector: 'app-hub-create',
  templateUrl: './hub-create.component.html',
  styleUrls: ['./hub-create.component.scss'],
  animations: [buttonState, fadeOut, enterLeave]
})
export class HubCreateComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject();

  @Output() action = new EventEmitter<void>();
  @Input() themes: string[] = [];
  public base: string[] = [];
  public hubs: Hub[] = [];
  public selected: Hub;

  public loading: boolean;

  public form: FormGroup;
  public nameControl: FormControl = new FormControl('', [Validators.required]);

  constructor(private readonly hubService: HubService,
    private alertService: AlertService,
    private cd: ChangeDetectorRef,
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.hubService.getAll().pipe(takeUntil(this.destroy$)).subscribe((hubs: Hub[]) => {
      this.base = hubs.map(h => h.name);
      this.hubs = this.themes.filter(t => !hubs.find(h => h.name == t)).map(t => {
        const hub: Hub = { name: t, posts: [] };
        return hub;
      });
      if (this.hubs.length) {
        this.hubClick(this.hubs[0]);
      }
      else{
        this.action.emit();
      }
    });

    this.form = new FormGroup({
      name: this.nameControl,
      description: new FormControl('', [Validators.required])
    });
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

  submit() {
    if (this.form.invalid) {
      return;
    }
    this.loading = true;
    this.spinner.show('hubCreateSpinner');

    this.hubService.create(this.selected).pipe(takeUntil(this.destroy$)).subscribe((hub)=>{

      const index = this.hubs.indexOf(this.selected, 0);
      if (index > -1) {
        this.hubs.splice(index, 1);
      }
     this.cd.detectChanges();
     this.selected = null;
      this.form.reset();
      if (this.hubs.length) {
        this.hubClick(this.hubs[0]);
      }
      this.spinner.hide('hubCreateSpinner');
      this.loading = false;
      this.alertService.success(`успешно сохранена`,`Тема "${hub.name}"`);

      if(!this.selected) {
        this.action.emit();
     }
    })
  }

  onDescriptionEnter(event) {
    if (!this.selected) {
      return;
    }
    this.selected.description = event.srcElement.value;
  }

  touch(control: FormControl) {
    if (!control.touched) {
      control.markAsTouched();
    }
  }

  onNameEnter(event) {
    if (!this.selected || this.nameControl.invalid) {
      return;
    }
    this.selected.name = event.srcElement.value;
    this.themes = this.hubs.map(h => h.name);
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
