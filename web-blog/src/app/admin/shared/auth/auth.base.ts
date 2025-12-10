import { Observable, Subject } from 'rxjs';
import { User } from '../interfaces';


export interface AuthProvider {

    isSignIn: boolean;
    error$: Subject<string>;

    token: string;

    login(user: User): Observable<any>;
    logout();

    isAuthenticated(): boolean;

}


export class AuthBase implements AuthProvider {

    public  get error$(): Subject<string> {
      return this.authProvider.error$;
    };

    public get isSignIn(): boolean {
      return this.authProvider.isSignIn;
    }

    readonly authProvider: AuthProvider;

    constructor(context: AuthProvider) {
       this.authProvider = context;
    }

    get token(): string {
        return this.authProvider.token;
    }

    login(user: User): Observable<any> {
      return this.authProvider.login(user);
    }

    logout() {
        this.authProvider.logout();
    }

    isAuthenticated(): boolean {
        return this.authProvider.isAuthenticated();
    }

}
