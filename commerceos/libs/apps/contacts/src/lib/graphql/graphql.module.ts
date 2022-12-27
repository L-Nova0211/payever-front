
import { CommonModule } from '@angular/common';
import { Inject, NgModule } from '@angular/core';
import { Apollo, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkHandler, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { PeAuthService } from '@pe/auth';

import { PE_CONTACTS_API_PATH } from '../tokens';

export enum ApolloBaseName {
  contacts = 'contacts',
}

@NgModule({
  imports: [
    CommonModule,
    ApolloModule,
    HttpLinkModule,
  ],
})
export class GraphQLModule {
  constructor(
    apollo: Apollo,
    httpLink: HttpLink,
    protected authService: PeAuthService,
    @Inject(PE_CONTACTS_API_PATH) private peContactsApiPath: string,
  ) {
    const contactsLink: HttpLinkHandler = httpLink.create({
      uri: this.authService.isAdmin() ? `${this.peContactsApiPath}/admin/contacts` : `${this.peContactsApiPath}/contacts`,
      withCredentials: true,
    });
    apollo.create(
      {
        link: contactsLink,
        cache: new InMemoryCache({ addTypename: false }),
      },
      ApolloBaseName.contacts,
    );
  }
}
