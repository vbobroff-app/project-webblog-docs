import { Component, OnInit, Input } from '@angular/core';
import { HubService } from '../../../admin/shared/services/hub.service';

@Component({
  selector: 'app-hub',
  templateUrl: './hub.component.html',
  styleUrls: ['./hub.component.scss']
})
export class HubComponent implements OnInit {

  @Input() name: string;
  @Input() editable: boolean;
  @Input() selected: boolean;
  @Input() template = 'tab';

  constructor(private hubService: HubService ) { }

  ngOnInit(): void {
  }

  click(){
    this.hubService.close(this.name);
  }

}
