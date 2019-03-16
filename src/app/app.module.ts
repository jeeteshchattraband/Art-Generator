import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent, LoginDialogComponent, DeleteDialogComponent } from './app.component';
import {
  MatButtonModule,
  MatDialogModule,
  MatGridListModule,
  MatIconModule,
  MatProgressSpinnerModule,
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    LoginDialogComponent,
    DeleteDialogComponent
  ],
  entryComponents: [
    LoginDialogComponent,
    DeleteDialogComponent
  ],
  imports: [
    MatButtonModule,
    MatDialogModule,
    BrowserAnimationsModule,
    BrowserModule,
    FlexLayoutModule,
    MatGridListModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
