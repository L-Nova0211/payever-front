import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { PebBuilderBlogsApi } from '@pe/builder-api';
import { EnvService } from '@pe/common';
import { ThemesApi } from '@pe/themes';

import { BlogEnvService } from '../services/blog-env.service';


@Injectable()
export class BlogThemeGuard implements CanActivate {
  constructor(
    private apiService: PebBuilderBlogsApi,
    private themesApi:ThemesApi,
    @Inject(EnvService) private envService: BlogEnvService,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot, state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const blogId = this.envService.applicationId || route.parent.params.blogId;
    this.themesApi.applicationId = blogId;
    if (!blogId) {
      throw new Error('There is no BLOG ID in the url path');
    }

    return this.apiService.getBlogActiveTheme(blogId).pipe(

      switchMap((result: any) => {
        if(!result._id){
         return this.themesApi.createApplicationTheme('new theme')
        }

        return of(result)
      }),
      map((theme) => {
       return true
      }),
      catchError((err) => {
        console.error(err);

        return of(false);
      }),
    );
  }
}
