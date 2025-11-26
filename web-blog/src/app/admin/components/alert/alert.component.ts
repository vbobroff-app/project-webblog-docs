import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AlertService } from '../../shared/services/alert.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { flash } from 'src/app/core/animation';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  animations: [flash]
})
export class AlertComponent implements OnInit, OnDestroy {

  @Input() delay = 2000;

  private readonly destroy$ = new Subject();

  public text: string;
  public boldMark: string;
  public type = 'success';

  public show: boolean;

  constructor(private alertService: AlertService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.alertService.alert$.pipe(takeUntil(this.destroy$)).subscribe((alert) => {
      this.text = alert.text;
      this.type = alert.type;
      this.boldMark = alert.boldMark;
      this.show = true;

      const timeout = setTimeout(() => {
        clearTimeout();
        this.show = false;
      }, this.delay);
    });

    this.show = false;
    this.cd.detectChanges();

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
