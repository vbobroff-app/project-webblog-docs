import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { AuthService } from '../auth/auth.service';
import { FirebaseService } from 'src/app/core/services/firebase.service';


@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private auth: AuthService, private fbService: FirebaseService, private router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
        if (this.auth.isAuthenticated()) {
            return true;
        } else {
            this.auth.logout;
            this.router.navigate(['/admin', 'login'], { queryParams: { loginAgain: true } });
        }
    }

}
