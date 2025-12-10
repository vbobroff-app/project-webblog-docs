import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { FirebaseService } from 'src/app/core/services/firebase.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private authService: AuthService,
        private router: Router,

    ) { }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

      //return throwError({name: "HttpErrorResponse", message: 'no pay data', error:'ERROR' });

        if (this.authService.isAuthenticated()) {
            request = request.clone({
                setParams: {
                    auth: this.authService.token
                }
            });
        }
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                console.log('interceptor error:', error);
                if(error.status == 401){
                    this.authService.logout();
                    this.router.navigate(['/admin','login'], {queryParams: { authFailed: true}});
                }
                return throwError(error);
            })
        );
    }

}
