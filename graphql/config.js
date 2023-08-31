import { ApolloClient, InMemoryCache } from '@apollo/client';

export const AREWEAVE_GRAPHQL_CLIENT = new ApolloClient({
  uri: 'https://arweave.net/graphql',
  cache: new InMemoryCache()
});
