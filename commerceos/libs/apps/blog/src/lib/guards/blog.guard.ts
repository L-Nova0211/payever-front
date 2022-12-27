import { Inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { PebBlogsApi } from '@pe/builder-api';
import { EnvService } from '@pe/common';

import { BlogEnvService } from '../services/blog-env.service';

@Injectable()
export class PebBlogGuard implements CanActivate {

  constructor(
    private api: PebBlogsApi,
    @Inject(EnvService) private envService: BlogEnvService,
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (route?.firstChild?.firstChild?.params.blogId) {
      this.envService.applicationId = route?.firstChild?.firstChild?.params?.blogId;

      return this.api.getSingleBlog(route?.firstChild?.firstChild?.params?.blogId).pipe(
        map((data) => {
          route.data = { ...route.data, blog: data };

          return true;
        }),
      )
    }

    return this.api.getBlogsList().pipe(
      switchMap((blogs) => {
        return blogs.length ?
          of(blogs) :
          this.api.createBlog({
            name: this.envService.businessData.name || 'test',
          }).pipe(
            map(blog => [blog]),
          );
      }),
      map((blogs) => {
        const defaultBlog = blogs.find(blog => blog.isDefault === true);

        if (!defaultBlog) {
          this.envService.applicationId = blogs[0]._id;
          route.data = { ...route.data, blog: blogs[0] };
          console.log(route.data);

          return true;
        }

        this.envService.applicationId = defaultBlog._id;
        route.data = { ...route.data, blog: defaultBlog };

        return true;
      }),
      catchError((err) => {
        console.error(err);

        return of(false);
      }),
    )
  }
}
