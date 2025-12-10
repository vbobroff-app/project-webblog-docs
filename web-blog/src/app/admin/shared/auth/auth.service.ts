import { Injectable } from '@angular/core';
import { AuthBase } from './auth.base';
import { AuthPlatform } from './auth.platform';



@Injectable({providedIn: 'root'})
export class AuthService extends AuthBase {

    constructor(private context: AuthPlatform) {

      super(context.auth);

    }


}
