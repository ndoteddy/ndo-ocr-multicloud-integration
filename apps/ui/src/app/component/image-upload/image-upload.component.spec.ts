import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { ImageUploadComponent } from './image-upload.component';
import { FileUploadService } from '../../services/file-upload.service';

describe('ImageUploadComponent', () => {
  let component: ImageUploadComponent;
  let fixture: ComponentFixture<ImageUploadComponent>;
  let uploadService: jasmine.SpyObj<FileUploadService>;

  beforeEach(() => {
    uploadService = jasmine.createSpyObj('FileUploadService', ['upload', 'getImageResult']);

    TestBed.configureTestingModule({
      declarations: [ImageUploadComponent],
      providers: [{ provide: FileUploadService, useValue: uploadService }],
    });
    fixture = TestBed.createComponent(ImageUploadComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sets a preview and enables upload once a file is selected', () => {
    const file = new File(['abc'], 'a.png', { type: 'image/png' });
    const fileList = { 0: file, length: 1, item: () => file } as unknown as FileList;

    component.selectFile({ target: { files: fileList } } as unknown as Event);

    expect(component.selectedFiles).toBe(fileList);
    expect(component.currentFile).toBe(file);
  });

  it('polls for the result and stops once ImgContent is returned', fakeAsync(() => {
    component.preview = 'data:image/png;base64,YWJj';
    const file = new File(['abc'], 'a.png', { type: 'image/png' });
    component.selectedFiles = { 0: file, length: 1, item: () => file } as unknown as FileList;

    uploadService.upload.and.returnValue(of(new HttpResponse({ status: 200, body: { ok: true } })));
    uploadService.getImageResult.and.returnValues(
      of({ ImgName: 'a.png', ImgContent: '' }),
      of({ ImgName: 'a.png', ImgContent: 'done' })
    );

    component.upload();
    tick(0);
    expect(uploadService.getImageResult).toHaveBeenCalledTimes(1);

    tick(5000);
    expect(uploadService.getImageResult).toHaveBeenCalledTimes(2);
    expect(component.imageInfos).toBe('done');

    // Polling must have stopped: no further calls after the result arrived.
    tick(20000);
    expect(uploadService.getImageResult).toHaveBeenCalledTimes(2);

    component.ngOnDestroy();
  }));

  it('surfaces an upload error without starting to poll', () => {
    component.preview = 'data:image/png;base64,YWJj';
    const file = new File(['abc'], 'a.png', { type: 'image/png' });
    component.selectedFiles = { 0: file, length: 1, item: () => file } as unknown as FileList;

    uploadService.upload.and.returnValue(throwError(() => ({ error: { message: 'boom' } })));

    component.upload();

    expect(component.message).toBe('boom');
    expect(uploadService.getImageResult).not.toHaveBeenCalled();
  });

  it('unsubscribes from polling on destroy', fakeAsync(() => {
    component.preview = 'data:image/png;base64,YWJj';
    const file = new File(['abc'], 'a.png', { type: 'image/png' });
    component.selectedFiles = { 0: file, length: 1, item: () => file } as unknown as FileList;

    uploadService.upload.and.returnValue(of(new HttpResponse({ status: 200, body: { ok: true } })));
    uploadService.getImageResult.and.returnValue(of({ ImgName: 'a.png', ImgContent: '' }));

    component.upload();
    tick(0);
    component.ngOnDestroy();

    const callsBeforeAdvancing = uploadService.getImageResult.calls.count();
    tick(20000);
    expect(uploadService.getImageResult.calls.count()).toBe(callsBeforeAdvancing);
  }));
});
