import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Provider } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { HomePageComponent } from './shared/home-page/home-page.component';
import { PostPageComponent } from './shared/post-page/post-page.component';
import { SharedModule } from './admin/shared/shared.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './admin/shared/auth.interceptor';
import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HubCardComponent } from './shared/components/hub-card/hub-card.component';
import { SearchPostComponent } from './shared/components/search-post/search-post.component';
import { PostListsComponent } from './shared/components/post-lists/post-lists.component';
import { TruncatePipe } from './shared/components/truncate.pipe';
import { SelfiePageComponent } from './shared/selfie-page/selfie-page.component';
import { PaginatorAdaptiveComponent } from './shared/components/paginator-adaptive/paginator-adaptive.component';

registerLocaleData(localeRu, 'ru');

const INTERCEPTOR_PROVIDER: Provider = {
  provide: HTTP_INTERCEPTORS,
  multi: true,
  useClass: AuthInterceptor
}

@NgModule({
  declarations: [
    AppComponent,
    MainLayoutComponent,
    HomePageComponent,
    PostPageComponent,
    HubCardComponent,
    SearchPostComponent,
    PostListsComponent,
    TruncatePipe,
    SelfiePageComponent,
    PaginatorAdaptiveComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule
  ],
  providers: [INTERCEPTOR_PROVIDER],
  bootstrap: [AppComponent]
})
export class AppModule { }
