import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular-link-http';
import { ApolloLink } from 'apollo-link';
import { onError } from 'apollo-link-error';

import { PeAuthService } from '@pe/auth';

import { PeErrorsHandlerService } from '../services';

export function apolloInterceptor(
  httpLink: HttpLink,
  peAppointmentsApiPath: string,
  peAuthService: PeAuthService,
  peErrorHandlerService: PeErrorsHandlerService,
) {
  const token = peAuthService.token || localStorage.getItem('TOKEN');

  const appointmentsLink = httpLink.create({
    uri: `${peAppointmentsApiPath}/appointments`,
    withCredentials: true,
  });

  const authMiddleware = new ApolloLink((operation, forward) => {
    operation.setContext({
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    });

    return forward(operation);
  });

  const errorLink = onError(({ networkError }) => {
    if (networkError) {
      const httpErrorResponse = networkError as HttpErrorResponse;
      peErrorHandlerService.errorHandler('', httpErrorResponse);
    }
  });

  return {
    cache: new InMemoryCache(),
    link: ApolloLink.from([
      errorLink,
      authMiddleware,
      appointmentsLink,
    ]),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
      },
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      },
    },
  };
}
