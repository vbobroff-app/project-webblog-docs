import { Injectable } from "@angular/core";

import { environment } from "src/environments/environment";
import { ApiPlatform } from "src/environments/interface";
import { AuthProvider } from "./auth.base";
import { FbAuthService } from "./fb.auth";
import { AwAuthService } from "./aw.auth";


@Injectable({
  providedIn: 'root'
})
export class AuthPlatform {

  public readonly platform: ApiPlatform;
  public readonly auth: AuthProvider;

  constructor(private fbAuth: FbAuthService, private awAuth: AwAuthService) {
    this.platform = environment.apiPlatform;

     switch (this.platform) {
       case 'appwrite':
         this.auth = awAuth;
         break;
       case 'firebase':
         this.auth = fbAuth;
         break;
         default: this.auth = awAuth;
     }

  }

}
