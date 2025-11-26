import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { HomePageComponent } from './shared/home-page/home-page.component';
import { PostPageComponent } from './shared/post-page/post-page.component';
import { AdminModule } from './admin/admin.module';
import { PostResolver } from './core/Resolvers/post-resolver';


const routes: Routes = [
  {
    path: '', component: MainLayoutComponent, children: [
      {
        path: '', redirectTo: '/', pathMatch: 'full'
      },
      {
        path: '', component: HomePageComponent
      },
      {
        path: 'post/:id', 
        component: PostPageComponent,
        resolve: {
          target: PostResolver
        }
      }
    ]
  },
  {
    path: 'admin', loadChildren: './admin/admin.module#AdminModule'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes , {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
