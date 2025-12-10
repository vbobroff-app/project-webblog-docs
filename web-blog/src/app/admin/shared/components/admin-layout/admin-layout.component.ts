import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/core/services/firebase.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  private scrollOffset: number = 25;
  public isHidden: boolean = false;

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isHidden = (window.scrollY > this.scrollOffset);
  }


  constructor(private router: Router, public authService: AuthService, private fbService: FirebaseService) { }

  ngOnInit(): void {
  }

  logOut(event: Event) {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/admin', 'login'])
  }

}
