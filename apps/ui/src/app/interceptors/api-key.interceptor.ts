import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class ApiKeyInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!req.url.startsWith(environment.apiBaseUrl)) {
      return next.handle(req);
    }

    const authorizedReq = req.clone({
      setHeaders: { 'x-api-key': environment.apiKey },
    });

    return next.handle(authorizedReq);
  }
}
