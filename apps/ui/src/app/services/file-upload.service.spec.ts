import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FileUploadService } from './file-upload.service';
import { environment } from '../../environments/environment';

describe('FileUploadService', () => {
  let service: FileUploadService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FileUploadService],
    });
    service = TestBed.inject(FileUploadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('posts the image name and base64 payload to /analysis/image', () => {
    service.upload('a.png', 'YWJj').subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/analysis/image`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ imgName: 'a.png', imgBase64: 'YWJj' });
    req.flush({});
  });

  it('requests the stored analysis by image name as a query param', () => {
    service.getImageResult('a.png').subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiBaseUrl}/analysis/image` && r.params.get('name') === 'a.png'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ ImgName: 'a.png', ImgContent: 'hello' });
  });
});
