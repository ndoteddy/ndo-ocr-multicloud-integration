import { Component, OnDestroy } from '@angular/core';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Subscription, timer } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { FileUploadService } from '../../services/file-upload.service';

const POLL_INTERVAL_MS = 5000;

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css'],
  standalone: false,
})
export class ImageUploadComponent implements OnDestroy {
  selectedFiles?: FileList;
  currentFile?: File;
  progress = 0;
  message = '';
  preview = '';
  imageInfos?: string;

  private pollSubscription?: Subscription;

  constructor(private uploadService: FileUploadService) {}

  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
  }

  selectFile(event: Event): void {
    this.message = '';
    this.preview = '';
    this.progress = 0;
    this.selectedFiles = (event.target as HTMLInputElement).files ?? undefined;

    const file = this.selectedFiles?.item(0);
    if (!file) {
      return;
    }

    this.currentFile = file;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.preview = e.target?.result as string;
    };
    reader.readAsDataURL(this.currentFile);
  }

  upload(): void {
    this.progress = 0;
    this.imageInfos = undefined;
    this.pollSubscription?.unsubscribe();

    const file = this.selectedFiles?.item(0);
    if (!file) {
      return;
    }

    this.currentFile = file;
    const imgName = file.name;
    const imgBase64 = this.preview.split(',')[1];
    this.selectedFiles = undefined;

    this.uploadService.upload(imgName, imgBase64).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress = Math.round((100 * event.loaded) / event.total);
        } else if (event instanceof HttpResponse) {
          this.message = JSON.stringify(event.body);
          this.pollForResult(imgName);
        }
      },
      error: (err) => {
        this.progress = 0;
        this.message = err?.error?.message ?? 'Could not upload the image!';
        this.currentFile = undefined;
      },
    });
  }

  private pollForResult(imgName: string): void {
    this.pollSubscription = timer(0, POLL_INTERVAL_MS)
      .pipe(
        switchMap(() => this.uploadService.getImageResult(imgName)),
        takeWhile((result) => !result?.ImgContent, true)
      )
      .subscribe({
        next: (result) => {
          if (result?.ImgContent) {
            this.imageInfos = result.ImgContent;
          }
        },
        error: () => {
          this.pollSubscription?.unsubscribe();
        },
      });
  }
}
