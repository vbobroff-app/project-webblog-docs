import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import 'firebase/analytics';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/admin/shared/interfaces';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  public database: firebase.database.Database;
  //public analytics: firebase.analytics.Analytics;

  constructor() {
      firebase.initializeApp(environment.firebaseConfig);
     // this.analytics = firebase.analytics();
      this.database = firebase.database();
  }

  login(user: User): Observable<any>{
    const credential = firebase.auth().signInWithEmailAndPassword(user.email, user.password).then(credential=>{
      return credential;
    }).catch((error) =>{
             console.log(error.message);
             console.log('You are not logged in!');
     });
     return from(credential) as Observable<any>;
  }

  logout(): Observable<void>{
    return from(firebase.auth().signOut());
  }

}
