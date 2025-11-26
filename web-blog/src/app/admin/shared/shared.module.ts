import { CommonModule } from '@angular/common';
import { HttpClientModule } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DROPZONE_CONFIG, DropzoneConfigInterface, DropzoneModule } from 'ngx-dropzone-wrapper';
import { QuillModule } from 'ngx-quill';
import { NgxSpinnerModule } from "ngx-spinner";

import { ClickOutsideModule } from 'ng-click-outside';
import { CloseButtonComponent } from 'src/app/shared/components/close-button/close-button.component';
import { DropButtonComponent } from 'src/app/shared/components/drop-button/drop-button.component';
import { EditButtonComponent } from 'src/app/shared/components/edit-button/edit-button.component';
import { HubComponent } from 'src/app/shared/components/hub/hub.component';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { PostComponent } from 'src/app/shared/components/post/post.component';
import { ContainsInListValidator } from 'src/app/shared/services/contains-in-list.directive';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { DropzoneIconComponent } from './components/dropzone-icon/dropzone-icon.component';
import { PostModalComponent } from './components/post-modal/post-modal.component';
import { QuillEditorComponent } from "./components/quill-editor/quill-editor.component";
import { RefreshModalComponent } from './components/refresh-modal/refresh-modal.component';

import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  // Change this to your upload POST address:
  url: 'https://httpbin.org/post',
  maxFilesize: 50,
  acceptedFiles: 'image/*'
};

@NgModule({
  declarations: [
    HubComponent,
    ContainsInListValidator,
    PostComponent,
    ModalComponent,
    PostModalComponent,
    CloseButtonComponent,
    EditButtonComponent,
    DropButtonComponent,
    DropzoneIconComponent,
    ConfirmModalComponent,
    QuillEditorComponent,
    RefreshModalComponent,

  ],
  imports: [
    CommonModule,
    HttpClientModule,
    QuillModule.forRoot(),
    ClickOutsideModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    NgxSpinnerModule,
    DropzoneModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatCardModule

  ],
  exports: [
    HubComponent, ContainsInListValidator,
    ClickOutsideModule,
    ConfirmModalComponent,
    RefreshModalComponent,
    PostComponent, ModalComponent, PostModalComponent, CloseButtonComponent, EditButtonComponent,
    DropButtonComponent, DropzoneIconComponent,
    HttpClientModule, QuillModule, QuillEditorComponent,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    NgxSpinnerModule,
    DropzoneModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  providers: [
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG
    }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SharedModule {

}
