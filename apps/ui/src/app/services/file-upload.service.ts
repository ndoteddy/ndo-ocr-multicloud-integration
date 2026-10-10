import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  upload(imgName: string, imgBase64: string): Observable<HttpEvent<any>> {
    const payload = { imgName, imgBase64 };

    const req = new HttpRequest('POST', `${this.baseUrl}/analysis/image`, payload, {
      reportProgress: true,
      responseType: 'json',
    });

    return this.http.request(req);
  }

  getImageResult(imgName: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/analysis/image`, { params: { name: imgName } });
  }
}
