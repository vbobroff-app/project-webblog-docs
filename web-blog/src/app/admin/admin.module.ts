import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { RouterModule } from '@angular/router';

import { ModalService } from '../core/services/modal.service';
import { AlertComponent } from './components/alert/alert.component';
import { HubCreateComponent } from './components/hub-create/hub-create.component';
import { CreatePageComponent } from './create-page/create-page.component';
import { DashboardPageComponent } from './dashboard-page/dashboard-page.component';
import { EditPageComponent } from './edit-page/edit-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { RefDirective } from './ref.directive';
import { AdminLayoutComponent } from './shared/components/admin-layout/admin-layout.component';
import { ConfirmDeleteModalComponent } from './shared/components/confirm-delete-modal/confirm-delete-modal.component';
import { CreateModalComponent } from './shared/components/create-modal/create-modal.component';
import { SearchPipe } from './shared/pipes/search.pipe';
import { AlertService } from './shared/services/alert.service';
import { AuthGuard } from './shared/services/auth.guard';
import { SharedModule } from './shared/shared.module';

@NgModule({
    declarations: [
        AdminLayoutComponent,
        DashboardPageComponent,
        CreatePageComponent,
        EditPageComponent,

        LoginPageComponent,
        SearchPipe,
        AlertComponent,
        HubCreateComponent,
        CreateModalComponent,
        RefDirective,
        ConfirmDeleteModalComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild([
            {
                path: '', component: AdminLayoutComponent, children: [
                    {
                        path: '', redirectTo: '/admin/login', pathMatch: 'full'
                    },
                    {
                        path: 'login', component: LoginPageComponent
                    },
                    {
                        path: 'dashboard', component: DashboardPageComponent, canActivate: [AuthGuard]
                    },
                    {
                        path: 'create', component: CreatePageComponent, canActivate: [AuthGuard]
                    },
                    {
                        path: 'post/:id/edit', component: EditPageComponent, canActivate: [AuthGuard]
                    }
                ]
            }
        ])
    ],
    exports: [
        RouterModule,
    ],
    providers: [
        AuthGuard, AlertService, ModalService
    ],
    entryComponents: [ CreateModalComponent, ConfirmDeleteModalComponent ]
})

export class AdminModule {

}
