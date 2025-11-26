import { Component, OnInit, EventEmitter, Output, Input, OnDestroy } from '@angular/core';
import { Hub } from '../../shared/interfaces';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HubService } from 'src/app/admin/shared/services/hub.service';
import { AlertService } from '../../shared/services/alert.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { buttonState } from 'src/app/core/animation';


@Component({
  selector: 'app-hub-delete',
  templateUrl: './hub-delete.component.html',
  styleUrls: ['./hub-delete.component.scss'],
  animations: [buttonState]
})
export class HubDeleteComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject();

  @Input() text: string;
  @Output() action = new EventEmitter<void>();
  @Input() selected: Hub;

  public loading: boolean = false;


  constructor(private readonly hubService: HubService,
    private alertService: AlertService,
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
  }

  submit() {
    this.loading = true;
    this.spinner.show();

    this.hubService.remove(this.selected).pipe(takeUntil(this.destroy$)).subscribe(() => {

      this.spinner.hide();
      this.loading = false;
      this.alertService.success(`успешно удалена`, `Тема "${this.selected.name}"`);
      this.selected = null;
      this.action.emit();
    })
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
