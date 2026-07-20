import { EnvironmentProviders, inject, Provider } from '@angular/core';
import { InMemoryCache } from '@apollo/client';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

import { environment } from '../../../environments/environment';
import { ProductsService } from './products.service';

/**
 * Catalog-only providers. Keeping Apollo out of the root injector lets Angular
 * place the GraphQL client in the lazy catalog route chunk instead of the
 * initial application shell.
 */
export function provideCatalogData(): Array<EnvironmentProviders | Provider> {
  return [
    provideApollo(() => ({
      cache: new InMemoryCache(),
      link: inject(HttpLink).create({ uri: environment.graphqlEndpoint }),
    })),
    ProductsService,
  ];
}
