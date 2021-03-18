import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

const options = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private http: HttpClient) { }

  /**
   * Gets the URL to login with GitHub in the application
   */
  githubLoginUrl(): Observable<string> {
    return this.http.get('/github/loginUrl')
      .pipe(
        map((res: any) => res?.data),
        catchError((err: any) => {
          console.error(err);
          return of(null);
        })
      );
  }

  /**
   * Gets the github access token from the server
   * @param sessionCode - session code query value in url after login redirect
   */
  githubToken(sessionCode: string): Observable<string> {
    return this.http.post('/github/token', {sessionCode}, options)
      .pipe(
        map((res: any) => res?.data),
        catchError((err: any) => {
          console.error(err);
          return of(null);
        })
      );
  }

  /**
   * Gets the logged in GitHub user details
   */
  githubMe(): Observable<any> {
    const accessToken = sessionStorage.getItem('accessToken');
    const headers = options.headers.append('Authorization', `bearer ${accessToken}`);

    return this.http.get('/github/me', { headers })
      .pipe(
        map((res: any) => res?.data),
        catchError((err: any) => {
          console.error(err);
          return of(null);
        })
      );
  }

}
