import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiKeyInterceptor } from './api-key.interceptor';
import { environment } from '../../environments/environment';

describe('ApiKeyInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: HTTP_INTERCEPTORS, useClass: ApiKeyInterceptor, multi: true }],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('attaches the x-api-key header to requests targeting the backend', () => {
    http.get(`${environment.apiBaseUrl}/analysis/image`).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/analysis/image`);
    expect(req.request.headers.get('x-api-key')).toBe(environment.apiKey);
    req.flush({});
  });

  it('does not attach the header to unrelated requests', () => {
    http.get('https://unrelated.example.com/data').subscribe();

    const req = httpMock.expectOne('https://unrelated.example.com/data');
    expect(req.request.headers.has('x-api-key')).toBe(false);
    req.flush({});
  });
});
