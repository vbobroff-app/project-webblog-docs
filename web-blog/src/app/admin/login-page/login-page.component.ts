import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../shared/auth/auth.service';
import { User } from '../shared/interfaces';


@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  private readonly destroy$ = new Subject();

  public form: FormGroup;
  public submitted = false;
  public message: string;

  constructor(public auth: AuthService, private router: Router, private activeRouter: ActivatedRoute) { }

  ngOnInit(): void {

    this.router.navigate(['admin', 'dashboard']);

    this.activeRouter.queryParams.subscribe((params: Params) =>{
      if(params['loginAgain']){
        this.message = 'Для входа необходимо авторизоваться'
      }
      if(params['authFailed']){
        this.message = 'Сессия истекла, необходима авторизация'
      }
    })
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)])
    })
  }

  submit() {
    if (this.form.invalid) {
      return;
    }
    this.submitted = true;
    const user: User = {
      email: this.form.value.email,
      password: this.form.value.password
    }

    this.auth.login(user).pipe(
      takeUntil(this.destroy$),

      ).subscribe(() => {
      this.form.reset;
      this.router.navigate(['admin', 'dashboard'])
    }, ()=>{this.submitted = false;}
    );
    this.submitted = false;
  }

  onDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

}
