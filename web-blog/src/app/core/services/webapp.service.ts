import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Account, Client, Databases } from 'appwrite';
import { Observable, from, interval, of } from 'rxjs';
import { catchError, repeat, switchMap, tap } from 'rxjs/operators';
import { User } from 'src/app/admin/shared/interfaces';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebAppService {

  public webAppClient: Client;
  public databases: Databases;
  public account: Account;

  constructor() {

    const client  = new Client();

    client
    .setEndpoint(environment.webAppUrl)
    .setProject(environment.webAppConfig.appId);


    this.webAppClient = client;
    this.databases = new Databases(client);
    this.account = new Account(client);



  }

  login(user: User){

    return from(this.account.get()).pipe(
      switchMap(res=>this.logout()),
      switchMap(res=>from(this.account.createEmailPasswordSession(user.email, user.password))),
      catchError(err=> from(this.account.createEmailPasswordSession(user.email, user.password))),
    )
  }

  logout(): Observable<any>{
    return from(this.account.deleteSession('current'));
  }


}
