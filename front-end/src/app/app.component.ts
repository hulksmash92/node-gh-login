import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { Subscription } from 'rxjs';

import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private routeQuerySub = new Subscription();
  get authorised(): boolean {
    return !!sessionStorage.getItem('accessToken');
  }
  me: any;

  constructor(route: ActivatedRoute, private appService: AppService) {
    this.routeQuerySub = route.queryParamMap.subscribe({
      next: (queryParams: ParamMap) => {
        if (queryParams.has('code')) {
          this.getAccessToken(queryParams.get('code'));
        }
      }
    });
  }

  ngOnInit(): void {
    if (this.authorised) {
      this.handleGetMe();
    }
  }

  ngOnDestroy(): void {
    if (!this.routeQuerySub.closed) {
      this.routeQuerySub.unsubscribe();
    }
  }

  handleGitHubLogin(): void {
    this.appService.githubLoginUrl()
      .subscribe((loginUrl: string) => {
        if (loginUrl) {
          window.location.href = loginUrl;
        }
      });
  }

  handleGetMe(): void {
    this.appService.githubMe()
      .subscribe((res: any) => {
        this.me = res;
      });
  }

  private getAccessToken(sessionCode: string): void {
    this.appService.githubToken(sessionCode)
      .subscribe((accessToken: string) => {
        if (accessToken) {
          sessionStorage.setItem('accessToken', accessToken);
        }
      });
  }

}
