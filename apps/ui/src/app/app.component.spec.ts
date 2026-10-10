import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { AppComponent } from './app.component';

@Component({ selector: 'app-image-upload', template: '', standalone: false })
class ImageUploadStubComponent {}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent, ImageUploadStubComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('exposes the page title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance.title).toEqual(
      'Analyze Image With Rekognition - Kafka - Mongo DB'
    );
  });

  it('renders the title inside the page', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h4')?.textContent).toContain(
      'Analyze Image With Rekognition - Kafka - Mongo DB'
    );
  });
});
