import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators'
import { environment } from 'src/environments/environment';
import { FbAuthResponse, User } from '../interfaces';
import { FirebaseService } from 'src/app/core/services/firebase.service';

@Injectable({providedIn: 'root'})
export class FbAuthService {

    public error$: Subject<string> = new Subject<string>();
    public isSignIn: boolean;

    constructor(private httpClient: HttpClient, private fbService: FirebaseService) {

    }

    get token(): string {
        const fb_token = localStorage.getItem('fb_token');
        if(!fb_token){
            this.isSignIn = false;
            return null;
        }
        const expDate = new Date(localStorage.getItem('fb_token_expDate'));
        if (new Date() > expDate) {
                this.isSignIn = false;
                this.logout();
                this.fbService.logout().subscribe();

            return null;
        }
        this.isSignIn = true;
        return localStorage.getItem('fb_token');
    }

    private setToken(response: FbAuthResponse) {
        if (response) {
            const expDate = new Date(new Date().getTime() + +response.expiresIn * 1000);
            localStorage.setItem('fb_token', response.idToken);
            localStorage.setItem('fb_token_expDate', expDate.toString());
            this.isSignIn = true;
        } else {
            localStorage.removeItem('fb_token'); //clear();
            localStorage.removeItem('fb_token_expDate');
            this.isSignIn = false;
        }
    }

    login(user: User): Observable<any> {
        user.returnSecureToken = true;
        return this.httpClient.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.apiKey}`, user)
            .pipe(
                tap(this.setToken),
                switchMap(()=> this.fbService.login(user)),
                catchError(this.handleError.bind(this))
            );
    }

    logout() {
        this.setToken(null);
        this.fbService.logout().subscribe();
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
