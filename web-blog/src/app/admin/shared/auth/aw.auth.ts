import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators'
import { AwAuthResponse, User } from '../interfaces';
import { WebAppService } from 'src/app/core/services/webapp.service';

@Injectable({providedIn: 'root'})
export class AwAuthService {

    public error$: Subject<string> = new Subject<string>();
    public isSignIn: boolean;

    constructor( private awService: WebAppService) {

    }

    get token(): string {
        const aw_token = localStorage.getItem('aw_token');
        if(!aw_token){
            this.isSignIn = false;
            return null;
        }
        const expDate = new Date(localStorage.getItem('aw_token_expDate'));
        if (new Date() > expDate) {
                this.isSignIn = false;
                this.logout();
                this.awService.logout().subscribe();

            return null;
        }
        this.isSignIn = true;
        return localStorage.getItem('aw_token');
    }

    private setToken(response: AwAuthResponse) {
      const min = 15; //15min to expire
        if (response) {
            const expDate = new Date(new Date().getTime() + min * 60 * 1000);
            localStorage.setItem('aw_token', response.jwt);
            localStorage.setItem('aw_token_expDate', expDate.toString());
            this.isSignIn = true;
        } else {
            localStorage.removeItem('aw_token'); //clear();
            localStorage.removeItem('aw_token_expDate');
            this.isSignIn = false;
        }
    }

    login(user: User): Observable<any> {
        user.returnSecureToken = true;
        return this.awService.login(user)
            .pipe(
                switchMap(user=> this.awService.account.createJWT()),
                tap(this.setToken),
                catchError(this.handleError.bind(this))
            );
    }

    logout() {
        this.setToken(null);
        this.awService.logout().subscribe();
    }

    isAuthenticated(): boolean {
        return !!this.token;
    }

    handleError(error: HttpErrorResponse) {
        const { message } = error.error.error;
        switch(message){
            case "EMAIL_NOT_FOUND":
            this.error$.next('Неверный email');
            break;
            case "INVALID_PASSWORD":
            this.error$.next('Неверный пароль');
            break;
            case "USER_DISABLED":
            this.error$.next('Пользаватель заблокирован');
            break;
        }
        return throwError(error);
    }

}
